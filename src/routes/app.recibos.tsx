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
import { Download, Plus, FileText } from "lucide-react";

export const Route = createFileRoute("/app/recibos")({ component: Recibos });

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function Recibos() {
  const { isAdmin, employeeId, user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ periodo_mes: new Date().getMonth() + 1, periodo_anio: new Date().getFullYear() });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: empleados } = useQuery({
    queryKey: ["empleados-mini"],
    queryFn: async () => (await supabase.from("employees").select("id, nombre, apellido").order("apellido")).data ?? [],
    enabled: isAdmin,
  });

  const { data: recibos } = useQuery({
    queryKey: ["recibos", isAdmin, employeeId],
    queryFn: async () => {
      let q = supabase.from("payslips").select("*, employees(nombre, apellido)").order("periodo_anio", { ascending: false }).order("periodo_mes", { ascending: false });
      if (!isAdmin && employeeId) q = q.eq("employee_id", employeeId);
      const { data } = await q;
      return data ?? [];
    },
    enabled: !!(isAdmin || employeeId),
  });

  const upload = async () => {
    if (!file || !form.employee_id) { toast.error("Falta empleado o archivo"); return; }
    setBusy(true);
    try {
      const path = `${form.employee_id}/${form.periodo_anio}-${String(form.periodo_mes).padStart(2,"0")}-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from("payslips").upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("payslips").insert({
        employee_id: form.employee_id,
        periodo_mes: form.periodo_mes,
        periodo_anio: form.periodo_anio,
        concepto: form.concepto ?? null,
        monto: form.monto ? Number(form.monto) : null,
        file_path: path,
        uploaded_by: user?.id,
      });
      if (insErr) throw insErr;
      toast.success("Recibo subido");
      setOpen(false); setFile(null);
      qc.invalidateQueries({ queryKey: ["recibos"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(false); }
  };

  const download = async (path: string) => {
    const { data, error } = await supabase.storage.from("payslips").createSignedUrl(path, 60);
    if (error || !data?.signedUrl) return toast.error("No se pudo descargar");
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Recibos de sueldo</h1>
          <p className="text-sm text-muted-foreground">{isAdmin ? "Gestión de recibos de todos los empleados" : "Tus recibos disponibles"}</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="size-4 mr-1" /> Subir recibo</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuevo recibo de sueldo</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Empleado</Label>
                  <Select value={form.employee_id ?? ""} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {empleados?.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.apellido}, {e.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Mes</Label>
                    <Select value={String(form.periodo_mes)} onValueChange={(v) => setForm({ ...form, periodo_mes: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{MESES.map((m, i) => <SelectItem key={i} value={String(i+1)}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Año</Label>
                    <Input type="number" value={form.periodo_anio} onChange={(e) => setForm({ ...form, periodo_anio: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <Label>Concepto (opcional)</Label>
                  <Input value={form.concepto ?? ""} onChange={(e) => setForm({ ...form, concepto: e.target.value })} />
                </div>
                <div>
                  <Label>Monto (opcional)</Label>
                  <Input type="number" step="0.01" value={form.monto ?? ""} onChange={(e) => setForm({ ...form, monto: e.target.value })} />
                </div>
                <div>
                  <Label>Archivo PDF</Label>
                  <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={upload} disabled={busy}>Subir</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left">
              <tr>
                {isAdmin && <th className="p-3 font-medium">Empleado</th>}
                <th className="p-3 font-medium">Período</th>
                <th className="p-3 font-medium">Concepto</th>
                <th className="p-3 font-medium">Monto</th>
                <th className="p-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {recibos?.map((r: any) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                  {isAdmin && <td className="p-3">{r.employees?.apellido}, {r.employees?.nombre}</td>}
                  <td className="p-3 flex items-center gap-2"><FileText className="size-4 text-accent" /> {MESES[r.periodo_mes-1]} {r.periodo_anio}</td>
                  <td className="p-3 text-muted-foreground">{r.concepto ?? "—"}</td>
                  <td className="p-3">{r.monto ? `$${Number(r.monto).toLocaleString("es-AR")}` : "—"}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => download(r.file_path)}>
                      <Download className="size-4 mr-1" /> Descargar
                    </Button>
                  </td>
                </tr>
              ))}
              {(!recibos || recibos.length === 0) && (
                <tr><td colSpan={isAdmin ? 5 : 4} className="p-8 text-center text-muted-foreground">Sin recibos cargados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
