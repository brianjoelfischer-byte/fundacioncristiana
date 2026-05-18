import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/empleados")({ component: Empleados });

function Empleados() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const { data: empleados } = useQuery({
    queryKey: ["empleados"],
    queryFn: async () => {
      const { data } = await supabase
        .from("employees")
        .select("*, departments(nombre)")
        .order("apellido");
      return data ?? [];
    },
  });

  const { data: deps } = useQuery({
    queryKey: ["deps"],
    queryFn: async () => (await supabase.from("departments").select("*").order("nombre")).data ?? [],
  });

  if (!isAdmin) return <NoPermiso />;

  const filtered = empleados?.filter((e) => {
    const s = `${e.nombre} ${e.apellido} ${e.email} ${e.legajo ?? ""}`.toLowerCase();
    return s.includes(q.toLowerCase());
  }) ?? [];

  const onEdit = (emp: any) => { setEditing(emp); setOpen(true); };
  const onNew = () => {
    setEditing({ nombre: "", apellido: "", email: "", estado: "activo", dias_vacaciones_disponibles: 14 });
    setOpen(true);
  };

  const save = async () => {
    const payload = { ...editing };
    delete payload.departments;
    let error;
    if (editing.id) {
      ({ error } = await supabase.from("employees").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("employees").insert(payload));
    }
    if (error) return toast.error(error.message);
    toast.success("Guardado");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["empleados"] });
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este empleado?")) return;
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Eliminado"); qc.invalidateQueries({ queryKey: ["empleados"] }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Empleados</h1>
          <p className="text-sm text-muted-foreground">{empleados?.length ?? 0} en total</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="size-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="pl-8 w-64" />
          </div>
          <Button onClick={onNew}><Plus className="size-4 mr-1" /> Nuevo</Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr className="text-left">
                <th className="p-3 font-medium">Empleado</th>
                <th className="p-3 font-medium">Sector</th>
                <th className="p-3 font-medium">Cargo</th>
                <th className="p-3 font-medium">Estado</th>
                <th className="p-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e: any) => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-[image:var(--gradient-accent)] text-primary-foreground grid place-items-center text-xs font-semibold">
                        {e.nombre?.[0]}{e.apellido?.[0]}
                      </div>
                      <div>
                        <div className="font-medium">{e.nombre} {e.apellido}</div>
                        <div className="text-xs text-muted-foreground">{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{e.departments?.nombre ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{e.cargo ?? "—"}</td>
                  <td className="p-3"><Badge variant={e.estado === "activo" ? "default" : "secondary"}>{e.estado}</Badge></td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(e)}><Pencil className="size-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(e.id)}><Trash2 className="size-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar empleado" : "Nuevo empleado"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid sm:grid-cols-2 gap-3">
              <FieldX label="Nombre*" v={editing.nombre} on={(v) => setEditing({ ...editing, nombre: v })} />
              <FieldX label="Apellido*" v={editing.apellido} on={(v) => setEditing({ ...editing, apellido: v })} />
              <FieldX label="Email*" v={editing.email} on={(v) => setEditing({ ...editing, email: v })} />
              <FieldX label="DNI" v={editing.dni ?? ""} on={(v) => setEditing({ ...editing, dni: v })} />
              <FieldX label="Legajo" v={editing.legajo ?? ""} on={(v) => setEditing({ ...editing, legajo: v })} />
              <FieldX label="Cargo" v={editing.cargo ?? ""} on={(v) => setEditing({ ...editing, cargo: v })} />
              <FieldX label="Teléfono" v={editing.telefono ?? ""} on={(v) => setEditing({ ...editing, telefono: v })} />
              <FieldX label="Jornada" v={editing.jornada_laboral ?? ""} on={(v) => setEditing({ ...editing, jornada_laboral: v })} />
              <FieldX label="Fecha de ingreso" type="date" v={editing.fecha_ingreso ?? ""} on={(v) => setEditing({ ...editing, fecha_ingreso: v })} />
              <FieldX label="Fecha de nacimiento" type="date" v={editing.fecha_nacimiento ?? ""} on={(v) => setEditing({ ...editing, fecha_nacimiento: v })} />
              <div>
                <Label>Sector</Label>
                <Select value={editing.department_id ?? ""} onValueChange={(v) => setEditing({ ...editing, department_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sector" /></SelectTrigger>
                  <SelectContent>
                    {deps?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de contrato</Label>
                <Select value={editing.tipo_contrato ?? ""} onValueChange={(v) => setEditing({ ...editing, tipo_contrato: v })}>
                  <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    {["planta_permanente","contrato","monotributo","pasantia","suplente"].map((t) =>
                      <SelectItem key={t} value={t}>{t.replace("_"," ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={editing.estado ?? "activo"} onValueChange={(v) => setEditing({ ...editing, estado: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["activo","licencia","suspendido","baja"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <FieldX label="Vacaciones (días)" type="number" v={String(editing.dias_vacaciones_disponibles ?? 14)} on={(v) => setEditing({ ...editing, dias_vacaciones_disponibles: Number(v) })} />
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FieldX({ label, v, on, type = "text" }: any) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}

export function NoPermiso() {
  return (
    <Card className="p-8 text-center">
      <h2 className="font-heading text-xl font-semibold">Acceso restringido</h2>
      <p className="text-sm text-muted-foreground mt-2">Esta sección es solo para administradores de RRHH.</p>
    </Card>
  );
}
