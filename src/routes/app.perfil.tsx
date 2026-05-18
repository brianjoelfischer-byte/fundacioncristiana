import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { employeeId, user } = useAuth();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  const { data: emp } = useQuery({
    queryKey: ["mi-perfil", employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      const { data } = await supabase
        .from("employees")
        .select("*, departments(nombre)")
        .eq("id", employeeId)
        .maybeSingle();
      return data;
    },
    enabled: !!employeeId,
  });

  useEffect(() => { if (emp) setForm(emp); }, [emp]);

  const save = async () => {
    if (!employeeId) return;
    setSaving(true);
    const { error } = await supabase.from("employees").update({
      telefono: form.telefono,
      direccion: form.direccion,
      contacto_emergencia_nombre: form.contacto_emergencia_nombre,
      contacto_emergencia_telefono: form.contacto_emergencia_telefono,
    }).eq("id", employeeId);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Datos actualizados"); qc.invalidateQueries({ queryKey: ["mi-perfil"] }); }
  };

  const changePassword = async () => {
    const np = prompt("Nueva contraseña (mín. 6 caracteres)");
    if (!np || np.length < 6) return;
    const { error } = await supabase.auth.updateUser({ password: np });
    if (error) toast.error(error.message);
    else toast.success("Contraseña actualizada");
  };

  if (!emp) return <div className="text-sm text-muted-foreground">Cargando…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">Tus datos personales y laborales</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="size-16 rounded-2xl bg-[image:var(--gradient-accent)] text-primary-foreground grid place-items-center font-heading font-bold text-xl">
            {emp.nombre?.[0]}{emp.apellido?.[0]}
          </div>
          <div className="flex-1">
            <div className="font-heading text-xl font-semibold">{emp.nombre} {emp.apellido}</div>
            <div className="text-sm text-muted-foreground">{emp.cargo ?? "Sin cargo asignado"}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{emp.departments?.nombre ?? "Sin sector"}</Badge>
              <Badge>{emp.estado}</Badge>
            </div>
          </div>
        </div>

        <h2 className="font-heading text-base font-semibold mb-3">Datos laborales</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <Info label="Legajo" value={emp.legajo} />
          <Info label="Fecha de ingreso" value={emp.fecha_ingreso} />
          <Info label="Tipo de contrato" value={emp.tipo_contrato} />
          <Info label="Jornada" value={emp.jornada_laboral} />
          <Info label="Email" value={emp.email} />
          <Info label="Vacaciones disponibles" value={`${emp.dias_vacaciones_disponibles} días`} />
        </div>

        <h2 className="font-heading text-base font-semibold mb-3">Datos personales editables</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Teléfono" value={form.telefono ?? ""} onChange={(v) => setForm({ ...form, telefono: v })} />
          <Field label="Dirección" value={form.direccion ?? ""} onChange={(v) => setForm({ ...form, direccion: v })} />
          <Field label="Contacto de emergencia" value={form.contacto_emergencia_nombre ?? ""} onChange={(v) => setForm({ ...form, contacto_emergencia_nombre: v })} />
          <Field label="Teléfono de emergencia" value={form.contacto_emergencia_telefono ?? ""} onChange={(v) => setForm({ ...form, contacto_emergencia_telefono: v })} />
        </div>

        <div className="mt-6 flex gap-2 flex-wrap">
          <Button onClick={save} disabled={saving}>Guardar cambios</Button>
          <Button variant="outline" onClick={changePassword}>Cambiar contraseña</Button>
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-3 rounded-lg bg-muted/40">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-0.5">{value || "—"}</div>
    </div>
  );
}
function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} maxLength={200} />
    </div>
  );
}
