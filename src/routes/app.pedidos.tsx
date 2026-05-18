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
import { Plus, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/app/pedidos")({ component: Pedidos });

const CATS = [
  { v: "certificado_laboral", l: "Certificado laboral" },
  { v: "consulta", l: "Consulta" },
  { v: "actualizacion_datos", l: "Actualización de datos" },
  { v: "reclamo", l: "Reclamo" },
  { v: "soporte", l: "Soporte" },
  { v: "otro", l: "Otro" },
];

function Pedidos() {
  const { isAdmin, employeeId, user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ categoria: "consulta" });

  const { data: items } = useQuery({
    queryKey: ["tickets", isAdmin, employeeId],
    queryFn: async () => {
      let q = supabase.from("tickets").select("*, employees(nombre, apellido)").order("created_at", { ascending: false });
      if (!isAdmin && employeeId) q = q.eq("employee_id", employeeId);
      return (await q).data ?? [];
    },
    enabled: !!(isAdmin || employeeId),
  });

  const crear = async () => {
    if (!employeeId) return;
    if (!form.asunto || !form.descripcion) { toast.error("Completá asunto y descripción"); return; }
    const { error } = await supabase.from("tickets").insert({
      employee_id: employeeId, categoria: form.categoria, asunto: form.asunto, descripcion: form.descripcion,
    });
    if (error) toast.error(error.message);
    else { toast.success("Pedido enviado"); setOpen(false); setForm({ categoria: "consulta" }); qc.invalidateQueries({ queryKey: ["tickets"] }); }
  };

  const responder = async (id: string) => {
    const respuesta = prompt("Respuesta:");
    if (!respuesta) return;
    const { error } = await supabase.from("tickets").update({
      respuesta, estado: "resuelto", responded_by: user?.id, responded_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Respondido"); qc.invalidateQueries({ queryKey: ["tickets"] }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Pedidos a RRHH</h1>
          <p className="text-sm text-muted-foreground">{isAdmin ? "Bandeja de entrada" : "Tus pedidos a RRHH"}</p>
        </div>
        {!isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="size-4 mr-1" /> Nuevo pedido</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuevo pedido a RRHH</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Categoría</Label>
                  <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATS.map((c) => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Asunto</Label><Input value={form.asunto ?? ""} onChange={(e) => setForm({ ...form, asunto: e.target.value })} maxLength={200} /></div>
                <div><Label>Descripción</Label><Textarea rows={4} value={form.descripcion ?? ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} maxLength={2000} /></div>
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
        {items?.map((t: any) => (
          <Card key={t.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading font-semibold">{t.asunto}</span>
                  <Badge variant="outline" className="capitalize">{CATS.find((c) => c.v === t.categoria)?.l}</Badge>
                  <Badge variant={t.estado === "resuelto" ? "default" : "secondary"} className="capitalize">{t.estado}</Badge>
                  {isAdmin && <span className="text-xs text-muted-foreground">— {t.employees?.apellido}, {t.employees?.nombre}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{t.descripcion}</p>
                {t.respuesta && (
                  <div className="mt-3 p-3 rounded-lg bg-accent/5 border border-accent/20 text-sm">
                    <div className="flex items-center gap-1 text-xs text-accent font-medium mb-1"><MessageSquare className="size-3" /> Respuesta RRHH</div>
                    {t.respuesta}
                  </div>
                )}
              </div>
              {isAdmin && t.estado !== "resuelto" && (
                <Button size="sm" onClick={() => responder(t.id)}>Responder</Button>
              )}
            </div>
          </Card>
        ))}
        {(!items || items.length === 0) && (
          <Card className="p-8 text-center text-muted-foreground text-sm">Sin pedidos</Card>
        )}
      </div>
    </div>
  );
}
