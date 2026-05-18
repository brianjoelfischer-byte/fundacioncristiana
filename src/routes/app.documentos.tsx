import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Upload, FileText, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/documentos")({ component: Documentos });

const TIPOS = ["contrato","certificado","licencia","dni","cv","otro"];

function Documentos() {
  const { isAdmin, employeeId, user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ tipo: "otro" });
  const [file, setFile] = useState<File | null>(null);

  const { data: items } = useQuery({
    queryKey: ["docs", isAdmin, employeeId],
    queryFn: async () => {
      let q = supabase.from("documents").select("*, employees(nombre, apellido)").order("created_at", { ascending: false });
      if (!isAdmin && employeeId) q = q.eq("employee_id", employeeId);
      return (await q).data ?? [];
    },
    enabled: !!(isAdmin || employeeId),
  });

  const subir = async () => {
    if (!file || !employeeId || !form.nombre) { toast.error("Faltan datos"); return; }
    const path = `${employeeId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
    if (upErr) return toast.error(upErr.message);
    const { error } = await supabase.from("documents").insert({
      employee_id: employeeId, tipo: form.tipo, nombre: form.nombre,
      file_path: path, fecha_vencimiento: form.fecha_vencimiento || null, uploaded_by: user?.id,
    });
    if (error) toast.error(error.message);
    else { toast.success("Subido"); setOpen(false); setFile(null); setForm({ tipo: "otro" }); qc.invalidateQueries({ queryKey: ["docs"] }); }
  };

  const descargar = async (path: string) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const borrar = async (id: string, path: string) => {
    if (!confirm("¿Eliminar?")) return;
    await supabase.storage.from("documents").remove([path]);
    await supabase.from("documents").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["docs"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Documentos</h1>
          <p className="text-sm text-muted-foreground">{isAdmin ? "Todos los documentos" : "Tu documentación"}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Upload className="size-4 mr-1" /> Subir documento</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Subir documento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nombre</Label><Input value={form.nombre ?? ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Vencimiento (opcional)</Label><Input type="date" value={form.fecha_vencimiento ?? ""} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} /></div>
              <div><Label>Archivo</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={subir}>Subir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items?.map((d: any) => (
          <Card key={d.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-accent/10 text-accent grid place-items-center shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{d.nombre}</div>
                <div className="text-xs text-muted-foreground capitalize">{d.tipo}</div>
                {isAdmin && d.employees && <div className="text-xs text-muted-foreground">{d.employees.apellido}, {d.employees.nombre}</div>}
                {d.fecha_vencimiento && <div className="text-xs text-warning mt-1">Vence: {new Date(d.fecha_vencimiento).toLocaleDateString("es-AR")}</div>}
              </div>
            </div>
            <div className="flex gap-1 mt-3 justify-end">
              <Button size="sm" variant="outline" onClick={() => descargar(d.file_path)}><Download className="size-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={() => borrar(d.id, d.file_path)}><Trash2 className="size-3.5 text-destructive" /></Button>
            </div>
          </Card>
        ))}
        {(!items || items.length === 0) && (
          <Card className="p-8 text-center text-muted-foreground text-sm col-span-full">Sin documentos</Card>
        )}
      </div>
    </div>
  );
}
