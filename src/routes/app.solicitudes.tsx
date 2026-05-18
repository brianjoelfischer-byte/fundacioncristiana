import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Check, X } from "lucide-react";

export const Route = createFileRoute("/app/solicitudes")({ component: Solicitudes });

const TIPOS = [
  { v: "permiso_personal", l: "Permiso personal" },
  { v: "vacaciones", l: "Vacaciones" },
  { v: "licencia_medica", l: "Licencia médica" },
  { v: "llegada_tarde", l: "Llegada tarde" },
  { v: "ausencia", l: "Ausencia" },
  { v: "administrativo", l: "Administrativo" },
];

function Solicitudes() {
  const { isAdmin, employeeId, user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ tipo: "permiso_personal" });

  const { data: items } = useQuery({
    queryKey: ["solicitudes", isAdmin, employeeId],
    queryFn: async () => {
      let q = supabase.from("requests").select("*, employees(nombre, apellido)").order("created_at", { ascending: false });
      if (!isAdmin && employeeId) q = q.eq("employee_id", employeeId);
      return (await q).data ?? [];
    },
    enabled: !!(isAdmin || employeeId),
  });

  const crear = async () => {
    if (!employeeId) return;
    if (!form.fecha_desde || !form.motivo) { toast.error("Faltan datos"); return; }
    const { error } = await supabase.from("requests").insert({
      employee_id: employeeId,
      tipo: form.tipo,
      fecha_desde: form.fecha_desde,
      fecha_hasta: form.fecha_hasta || null,
      motivo: form.motivo,
    });
    if (error) toast.error(error.message);
    else { toast.success("Solicitud enviada"); setOpen(false); setForm({ tipo: "permiso_personal" }); qc.invalidateQueries({ queryKey: ["solicitudes"] }); }
  };

  const decidir = async (id: string, estado: "aprobado" | "rechazado") => {
    const comentario = prompt(`Comentario para ${estado} (opcional)`) ?? "";
    const { error } = await supabase.from("requests").update({
      estado, comentario_rrhh: comentario, reviewed_by: user?.id, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Actualizada"); qc.invalidateQueries({ queryKey: ["solicitudes"] }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Solicitudes y permisos</h1>
          <p className="text-sm text-muted-foreground">{isAdmin ? "Revisión y gestión" : "Tus solicitudes"}</p>
        </div>
        {!isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="size-4 mr-1" /> Nueva solicitud</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nueva solicitud</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIPOS.map((t) => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Desde</Label><Input type="date" value={form.fecha_desde ?? ""} onChange={(e) => setForm({ ...form, fecha_desde: e.target.value })} /></div>
                  <div><Label>Hasta</Label><Input type="date" value={form.fecha_hasta ?? ""} onChange={(e) => setForm({ ...form, fecha_hasta: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Motivo</Label>
                  <Textarea value={form.motivo ?? ""} onChange={(e) => setForm({ ...form, motivo: e.target.value })} rows={3} maxLength={1000} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={crear}>Enviar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-3">
        {items?.map((s: any) => {
          const tipo = TIPOS.find((t) => t.v === s.tipo)?.l ?? s.tipo;
          const variant = s.estado === "aprobado" ? "default" : s.estado === "rechazado" ? "destructive" : "secondary";
          return (
            <Card key={s.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-semibold">{tipo}</span>
                    <Badge variant={variant as any} className="capitalize">{s.estado}</Badge>
                    {isAdmin && <span className="text-xs text-muted-foreground">{s.employees?.apellido}, {s.employees?.nombre}</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(s.fecha_desde).toLocaleDateString("es-AR")}
                    {s.fecha_hasta && ` → ${new Date(s.fecha_hasta).toLocaleDateString("es-AR")}`}
                  </div>
                  <p className="text-sm mt-1">{s.motivo}</p>
                  {s.comentario_rrhh && <p className="text-xs mt-2 text-muted-foreground italic">RRHH: {s.comentario_rrhh}</p>}
                </div>
                {isAdmin && s.estado === "pendiente" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => decidir(s.id, "aprobado")}><Check className="size-4 mr-1" />Aprobar</Button>
                    <Button size="sm" variant="outline" onClick={() => decidir(s.id, "rechazado")}><X className="size-4 mr-1" />Rechazar</Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        {(!items || items.length === 0) && (
          <Card className="p-8 text-center text-muted-foreground text-sm">Sin solicitudes</Card>
        )}
      </div>
    </div>
  );
}
