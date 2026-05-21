
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS cuil text,
  ADD COLUMN IF NOT EXISTS calle text,
  ADD COLUMN IF NOT EXISTS numero text,
  ADD COLUMN IF NOT EXISTS piso text,
  ADD COLUMN IF NOT EXISTS depto text,
  ADD COLUMN IF NOT EXISTS edificio text,
  ADD COLUMN IF NOT EXISTS barrio text,
  ADD COLUMN IF NOT EXISTS ciudad text,
  ADD COLUMN IF NOT EXISTS provincia text,
  ADD COLUMN IF NOT EXISTS codigo_postal text,
  ADD COLUMN IF NOT EXISTS perfil_completo boolean NOT NULL DEFAULT false;

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
