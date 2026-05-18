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
import { Plus, Building2, Trash2 } from "lucide-react";
import { NoPermiso } from "./app.empleados";

export const Route = createFileRoute("/app/sectores")({ component: Sectores });

function Sectores() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});

  const { data: items } = useQuery({
    queryKey: ["deps-full"],
    queryFn: async () => (await supabase.from("departments").select("*, employees(count)").order("nombre")).data ?? [],
  });

  if (!isAdmin) return <NoPermiso />;

  const crear = async () => {
    if (!form.nombre) return;
    const { error } = await supabase.from("departments").insert(form);
    if (error) toast.error(error.message);
    else { toast.success("Creado"); setOpen(false); setForm({}); qc.invalidateQueries({ queryKey: ["deps-full"] }); }
  };

  const borrar = async (id: string) => {
    if (!confirm("¿Eliminar este sector?")) return;
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Eliminado"); qc.invalidateQueries({ queryKey: ["deps-full"] }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Sectores</h1>
          <p className="text-sm text-muted-foreground">Departamentos de la fundación</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-1" /> Nuevo</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo sector</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nombre</Label><Input value={form.nombre ?? ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
              <div><Label>Descripción</Label><Textarea value={form.descripcion ?? ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={crear}>Crear</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items?.map((d: any) => (
          <Card key={d.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="size-10 rounded-xl bg-accent/10 text-accent grid place-items-center">
                <Building2 className="size-5" />
              </div>
              <Button size="sm" variant="ghost" onClick={() => borrar(d.id)}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
            <h3 className="font-heading font-semibold mt-3">{d.nombre}</h3>
            {d.descripcion && <p className="text-sm text-muted-foreground mt-1">{d.descripcion}</p>}
            <div className="text-xs text-muted-foreground mt-3">{d.employees?.[0]?.count ?? 0} empleados</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
