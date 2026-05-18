import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, CalendarDays, Cake } from "lucide-react";

export const Route = createFileRoute("/app/calendario")({ component: Calendario });

function Calendario() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});

  const { data: eventos } = useQuery({
    queryKey: ["events"],
    queryFn: async () => (await supabase.from("events").select("*").order("fecha_inicio", { ascending: true })).data ?? [],
  });

  const { data: cumples } = useQuery({
    queryKey: ["cumples"],
    queryFn: async () => (await supabase.from("employees").select("nombre, apellido, fecha_nacimiento").not("fecha_nacimiento", "is", null)).data ?? [],
  });

  const crear = async () => {
    if (!form.titulo || !form.fecha_inicio) { toast.error("Faltan datos"); return; }
    const { error } = await supabase.from("events").insert(form);
    if (error) toast.error(error.message);
    else { toast.success("Creado"); setOpen(false); setForm({}); qc.invalidateQueries({ queryKey: ["events"] }); }
  };

  const proximosCumples = (cumples ?? [])
    .map((e: any) => {
      const fn = new Date(e.fecha_nacimiento);
      const hoy = new Date();
      const prox = new Date(hoy.getFullYear(), fn.getMonth(), fn.getDate());
      if (prox < hoy) prox.setFullYear(hoy.getFullYear() + 1);
      return { ...e, proximo: prox };
    })
    .sort((a, b) => a.proximo.getTime() - b.proximo.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Calendario</h1>
          <p className="text-sm text-muted-foreground">Eventos institucionales y cumpleaños</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="size-4 mr-1" /> Nuevo evento</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuevo evento</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Título</Label><Input value={form.titulo ?? ""} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
                <div><Label>Descripción</Label><Textarea value={form.descripcion ?? ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Inicio</Label><Input type="datetime-local" value={form.fecha_inicio ?? ""} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} /></div>
                  <div><Label>Fin</Label><Input type="datetime-local" value={form.fecha_fin ?? ""} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} /></div>
                </div>
                <div><Label>Ubicación</Label><Input value={form.ubicacion ?? ""} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={crear}>Crear</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"><CalendarDays className="size-5 text-accent" /> Próximos eventos</h2>
          <div className="space-y-3">
            {eventos?.length ? eventos.map((e: any) => (
              <div key={e.id} className="flex items-start gap-4 p-3 rounded-lg border hover:border-accent transition-colors">
                <div className="text-center shrink-0 px-3 py-2 rounded-lg bg-accent/10 text-accent">
                  <div className="text-xs uppercase">{new Date(e.fecha_inicio).toLocaleDateString("es-AR", { month: "short" })}</div>
                  <div className="font-heading text-xl font-bold">{new Date(e.fecha_inicio).getDate()}</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{e.titulo}</div>
                  <div className="text-xs text-muted-foreground">{new Date(e.fecha_inicio).toLocaleString("es-AR")}</div>
                  {e.ubicacion && <div className="text-xs text-muted-foreground mt-0.5">📍 {e.ubicacion}</div>}
                  {e.descripcion && <p className="text-sm text-muted-foreground mt-1">{e.descripcion}</p>}
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">Sin eventos programados</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"><Cake className="size-5 text-accent" /> Próximos cumpleaños</h2>
          <div className="space-y-2">
            {proximosCumples.length ? proximosCumples.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                <div className="text-sm">{c.nombre} {c.apellido}</div>
                <div className="text-xs text-muted-foreground">{c.proximo.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</div>
              </div>
            )) : <p className="text-sm text-muted-foreground">—</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
