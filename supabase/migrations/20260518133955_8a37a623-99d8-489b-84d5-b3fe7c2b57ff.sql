
-- Fix search_path en set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Revocar ejecución pública de funciones security definer
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Restringir lectura pública de buckets (quitar listado)
DROP POLICY IF EXISTS "Avatars: ver" ON storage.objects;
DROP POLICY IF EXISTS "News: ver" ON storage.objects;
CREATE POLICY "Avatars: ver autenticado" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "News: ver autenticado" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'news');
