
-- =========================================================
-- ROLES (tabla separada por seguridad)
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin_rrhh', 'empleado');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin_rrhh')
$$;

CREATE POLICY "Usuarios ven sus roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admin gestiona roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- DEPARTAMENTOS / SECTORES
-- =========================================================
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven departamentos" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin gestiona departamentos" ON public.departments FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- EMPLEADOS (perfil completo)
-- =========================================================
CREATE TYPE public.contract_type AS ENUM ('planta_permanente','contrato','monotributo','pasantia','suplente');
CREATE TYPE public.employee_status AS ENUM ('activo','licencia','suspendido','baja');

CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  -- datos personales
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT UNIQUE,
  fecha_nacimiento DATE,
  direccion TEXT,
  telefono TEXT,
  email TEXT NOT NULL,
  contacto_emergencia_nombre TEXT,
  contacto_emergencia_telefono TEXT,
  avatar_url TEXT,
  -- datos laborales
  legajo TEXT UNIQUE,
  fecha_ingreso DATE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  cargo TEXT,
  jornada_laboral TEXT,
  tipo_contrato contract_type,
  supervisor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  estado employee_status NOT NULL DEFAULT 'activo',
  dias_vacaciones_disponibles INTEGER NOT NULL DEFAULT 14,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empleado ve su perfil" ON public.employees FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Empleado actualiza datos básicos" ON public.employees FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admin crea empleados" ON public.employees FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admin elimina empleados" ON public.employees FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_employees_updated BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- RECIBOS DE SUELDO
-- =========================================================
CREATE TABLE public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  periodo_mes SMALLINT NOT NULL CHECK (periodo_mes BETWEEN 1 AND 12),
  periodo_anio SMALLINT NOT NULL,
  concepto TEXT,
  monto NUMERIC(12,2),
  file_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Empleado ve sus recibos" ON public.payslips FOR SELECT TO authenticated
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Admin gestiona recibos" ON public.payslips FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- SOLICITUDES / PERMISOS
-- =========================================================
CREATE TYPE public.request_type AS ENUM ('permiso_personal','vacaciones','licencia_medica','llegada_tarde','ausencia','administrativo');
CREATE TYPE public.request_status AS ENUM ('pendiente','aprobado','rechazado','cancelado');

CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  tipo request_type NOT NULL,
  fecha_desde DATE NOT NULL,
  fecha_hasta DATE,
  motivo TEXT NOT NULL,
  archivo_url TEXT,
  estado request_status NOT NULL DEFAULT 'pendiente',
  comentario_rrhh TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Empleado ve sus solicitudes" ON public.requests FOR SELECT TO authenticated
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Empleado crea sus solicitudes" ON public.requests FOR INSERT TO authenticated
  WITH CHECK (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));
CREATE POLICY "Admin gestiona solicitudes" ON public.requests FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admin elimina solicitudes" ON public.requests FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- =========================================================
-- PEDIDOS A RRHH (tickets)
-- =========================================================
CREATE TYPE public.ticket_category AS ENUM ('certificado_laboral','consulta','actualizacion_datos','reclamo','soporte','otro');
CREATE TYPE public.ticket_status AS ENUM ('abierto','en_proceso','resuelto','cerrado');

CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  categoria ticket_category NOT NULL,
  asunto TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  estado ticket_status NOT NULL DEFAULT 'abierto',
  respuesta TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Empleado ve sus pedidos" ON public.tickets FOR SELECT TO authenticated
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Empleado crea pedidos" ON public.tickets FOR INSERT TO authenticated
  WITH CHECK (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));
CREATE POLICY "Admin responde pedidos" ON public.tickets FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- NOVEDADES / COMUNICADOS
-- =========================================================
CREATE TYPE public.news_category AS ENUM ('comunicado','anuncio','novedad','alerta');

CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  categoria news_category NOT NULL DEFAULT 'novedad',
  imagen_url TEXT,
  destacado BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven novedades" ON public.news FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin gestiona novedades" ON public.news FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- EVENTOS DE CALENDARIO
-- =========================================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  ubicacion TEXT,
  tipo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos ven eventos" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin gestiona eventos" ON public.events FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- DOCUMENTOS DE EMPLEADO
-- =========================================================
CREATE TYPE public.document_type AS ENUM ('contrato','certificado','licencia','dni','cv','otro');

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  tipo document_type NOT NULL,
  nombre TEXT NOT NULL,
  file_path TEXT NOT NULL,
  fecha_vencimiento DATE,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Empleado ve sus documentos" ON public.documents FOR SELECT TO authenticated
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Empleado sube sus documentos" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Admin gestiona documentos" ON public.documents FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- NOTIFICACIONES
-- =========================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  link TEXT,
  leida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuario ve sus notificaciones" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Usuario marca leídas sus notificaciones" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin crea notificaciones" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) OR user_id = auth.uid());

-- =========================================================
-- TRIGGER: crear empleado + rol al registrarse
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_user BOOLEAN;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin_rrhh') INTO v_first_user;

  INSERT INTO public.employees (user_id, nombre, apellido, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
    NEW.email
  );

  -- El primer usuario registrado es admin; los demás, empleados
  IF v_first_user THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin_rrhh');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'empleado');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('payslips', 'payslips', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('news', 'news', true) ON CONFLICT DO NOTHING;

-- Políticas storage: payslips
CREATE POLICY "Empleado ve sus recibos en storage" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payslips' AND (
    public.is_admin(auth.uid()) OR
    (storage.foldername(name))[1] IN (SELECT id::text FROM public.employees WHERE user_id = auth.uid())
  ));
CREATE POLICY "Admin sube recibos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payslips' AND public.is_admin(auth.uid()));
CREATE POLICY "Admin elimina recibos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'payslips' AND public.is_admin(auth.uid()));

-- documents
CREATE POLICY "Documentos: ver" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (
    public.is_admin(auth.uid()) OR
    (storage.foldername(name))[1] IN (SELECT id::text FROM public.employees WHERE user_id = auth.uid())
  ));
CREATE POLICY "Documentos: subir" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (
    public.is_admin(auth.uid()) OR
    (storage.foldername(name))[1] IN (SELECT id::text FROM public.employees WHERE user_id = auth.uid())
  ));
CREATE POLICY "Documentos: borrar" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (
    public.is_admin(auth.uid()) OR
    (storage.foldername(name))[1] IN (SELECT id::text FROM public.employees WHERE user_id = auth.uid())
  ));

-- avatars (bucket público lectura, escritura propia)
CREATE POLICY "Avatars: ver" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "Avatars: subir propio" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Avatars: actualizar propio" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- news (público lectura, admin escritura)
CREATE POLICY "News: ver" ON storage.objects FOR SELECT TO public USING (bucket_id = 'news');
CREATE POLICY "News: admin escribe" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'news' AND public.is_admin(auth.uid()));

-- Departamentos iniciales
INSERT INTO public.departments (nombre, descripcion) VALUES
  ('Dirección', 'Equipo directivo de la fundación'),
  ('Administración', 'Administración y finanzas'),
  ('Educación', 'Equipo docente y educativo'),
  ('Programas Sociales', 'Coordinación de programas comunitarios'),
  ('Mantenimiento', 'Mantenimiento y servicios generales');
