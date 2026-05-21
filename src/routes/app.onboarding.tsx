import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Heart, Loader2, Upload } from "lucide-react";

export const Route = createFileRoute("/app/onboarding")({ component: OnboardingPage });

function OnboardingPage() {
  const { employeeId, user, refresh } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>({
    nombre: "", apellido: "", dni: "", cuil: "", fecha_nacimiento: "", telefono: "", avatar_url: "",
    calle: "", numero: "", piso: "", depto: "", edificio: "", barrio: "", ciudad: "", provincia: "", codigo_postal: "",
    contacto_emergencia_nombre: "", contacto_emergencia_telefono: "",
  });

  useEffect(() => {
    (async () => {
      if (!employeeId) return;
      const { data } = await supabase.from("employees").select("*").eq("id", employeeId).maybeSingle();
      if (data?.perfil_completo) { navigate({ to: "/app" }); return; }
      if (data) setForm({ ...form, ...data });
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { toast.error(error.message); setUploadingAvatar(false); return; }
    const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
    setForm((f: any) => ({ ...f, avatar_url: signed?.signedUrl ?? path }));
    setUploadingAvatar(false);
    toast.success("Foto cargada");
  };

  const requiredStep1 = form.nombre && form.apellido && form.dni && form.cuil && form.fecha_nacimiento && form.telefono;
  const requiredStep2 = form.calle && form.numero && form.ciudad && form.provincia && form.codigo_postal;

  const submit = async () => {
    if (!employeeId) return;
    if (!requiredStep1 || !requiredStep2 || !form.contacto_emergencia_nombre || !form.contacto_emergencia_telefono) {
      toast.error("Completá todos los campos obligatorios"); return;
    }
    setSaving(true);
    const { error } = await supabase.from("employees").update({
      nombre: form.nombre, apellido: form.apellido, dni: form.dni, cuil: form.cuil,
      fecha_nacimiento: form.fecha_nacimiento, telefono: form.telefono, avatar_url: form.avatar_url,
      calle: form.calle, numero: form.numero, piso: form.piso, depto: form.depto, edificio: form.edificio,
      barrio: form.barrio, ciudad: form.ciudad, provincia: form.provincia, codigo_postal: form.codigo_postal,
      contacto_emergencia_nombre: form.contacto_emergencia_nombre,
      contacto_emergencia_telefono: form.contacto_emergencia_telefono,
      perfil_completo: true,
    }).eq("id", employeeId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("¡Bienvenido/a a la Fundación! 🙏");
    await refresh();
    navigate({ to: "/app" });
  };

  if (loading) return <div className="grid place-items-center min-h-[60vh]"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-3">
          <Heart className="size-3" /> Bienvenido/a a la familia
        </div>
        <h1 className="font-heading text-3xl font-bold">Completá tu perfil</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
          Necesitamos algunos datos para acompañarte mejor. Tu información es confidencial y se trata con respeto y cuidado.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`h-1.5 w-12 rounded-full transition-colors ${step >= n ? "bg-accent" : "bg-muted"}`} />
        ))}
      </div>

      <Card className="p-6 md:p-8">
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="font-heading text-lg font-semibold">Datos personales</h2>

            <div className="flex items-center gap-4">
              <div className="size-20 rounded-2xl bg-muted overflow-hidden grid place-items-center text-2xl font-heading font-bold text-muted-foreground">
                {form.avatar_url ? <img src={form.avatar_url} alt="" className="size-full object-cover" /> : (form.nombre?.[0] ?? "?")}
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-muted">
                  {uploadingAvatar ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  Subir foto
                </span>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <F label="Nombre *" v={form.nombre} on={(v) => setForm({ ...form, nombre: v })} />
              <F label="Apellido *" v={form.apellido} on={(v) => setForm({ ...form, apellido: v })} />
              <F label="DNI *" v={form.dni} on={(v) => setForm({ ...form, dni: v })} />
              <F label="CUIL *" v={form.cuil} on={(v) => setForm({ ...form, cuil: v })} placeholder="20-12345678-9" />
              <F label="Fecha de nacimiento *" v={form.fecha_nacimiento} on={(v) => setForm({ ...form, fecha_nacimiento: v })} type="date" />
              <F label="Teléfono *" v={form.telefono} on={(v) => setForm({ ...form, telefono: v })} />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="font-heading text-lg font-semibold">Domicilio</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <F label="Calle *" v={form.calle} on={(v) => setForm({ ...form, calle: v })} />
              <F label="Número *" v={form.numero} on={(v) => setForm({ ...form, numero: v })} />
              <F label="Piso" v={form.piso} on={(v) => setForm({ ...form, piso: v })} />
              <F label="Departamento" v={form.depto} on={(v) => setForm({ ...form, depto: v })} />
              <F label="Edificio" v={form.edificio} on={(v) => setForm({ ...form, edificio: v })} />
              <F label="Barrio" v={form.barrio} on={(v) => setForm({ ...form, barrio: v })} />
              <F label="Ciudad *" v={form.ciudad} on={(v) => setForm({ ...form, ciudad: v })} />
              <F label="Provincia *" v={form.provincia} on={(v) => setForm({ ...form, provincia: v })} />
              <F label="Código postal *" v={form.codigo_postal} on={(v) => setForm({ ...form, codigo_postal: v })} />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="font-heading text-lg font-semibold">Contacto de emergencia</h2>
            <p className="text-sm text-muted-foreground">Si llegara a ocurrir algo, ¿a quién llamamos?</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <F label="Nombre completo *" v={form.contacto_emergencia_nombre} on={(v) => setForm({ ...form, contacto_emergencia_nombre: v })} />
              <F label="Teléfono *" v={form.contacto_emergencia_telefono} on={(v) => setForm({ ...form, contacto_emergencia_telefono: v })} />
            </div>
            <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/20 text-sm">
              <p className="text-muted-foreground">
                💙 Gracias por compartir tus datos. Como familia de la Fundación Neuquén Oeste, valoramos cada persona que forma parte de este equipo.
              </p>
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>Atrás</Button>
          {step < 3 ? (
            <Button onClick={() => {
              if (step === 1 && !requiredStep1) return toast.error("Completá los datos obligatorios");
              if (step === 2 && !requiredStep2) return toast.error("Completá los datos obligatorios");
              setStep((s) => s + 1);
            }}>Continuar</Button>
          ) : (
            <Button onClick={submit} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin mr-2" />}
              Finalizar
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function F({ label, v, on, type = "text", placeholder }: { label: string; v: string; on: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input value={v ?? ""} type={type} placeholder={placeholder} onChange={(e) => on(e.target.value)} maxLength={200} />
    </div>
  );
}
