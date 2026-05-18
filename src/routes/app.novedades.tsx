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
import { Plus, Megaphone, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/novedades")({ component: Novedades });

function Novedades() {
  const { isAdmin, user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ categoria: "novedad" });

  const { data: items } = useQuery({
    queryKey: ["news"],
    queryFn: async () => (await supabase.from("news").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const crear = async () => {
    if (!form.titulo || !form.contenido) { toast.error("Completá los campos"); return; }
    const { error } = await supabase.from("news").insert({ ...form, author_id: user?.id });
    if (error) toast.error(error.message);
    else { toast.success("Publicado"); setOpen(false); setForm({ categoria: "novedad" }); qc.invalidateQueries({ queryKey: ["news"] }); }
  };

  const borrar = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Eliminado"); qc.invalidateQueries({ queryKey: ["news"] }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Novedades</h1>
          <p className="text-sm text-muted-foreground">Comunicación interna de la fundación</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="size-4 mr-1" /> Publicar</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nueva publicación</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Título</Label><Input value={form.titulo ?? ""} onChange={(e) => setForm({ ...form, titulo: e.target.value })} maxLength={200} /></div>
                <div>
                  <Label>Categoría</Label>
                  <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["novedad","comunicado","anuncio","alerta"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Contenido</Label><Textarea rows={6} value={form.contenido ?? ""} onChange={(e) => setForm({ ...form, contenido: e.target.value })} maxLength={5000} /></div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={crear}>Publicar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {items?.map((n: any) => (
          <Card key={n.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className={`size-11 rounded-xl grid place-items-center shrink-0 ${
                n.categoria === "alerta" ? "bg-destructive/10 text-destructive" :
                n.categoria === "comunicado" ? "bg-secondary/20 text-secondary" :
                "bg-accent/10 text-accent"
              }`}>
                <Megaphone className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold">{n.titulo}</h3>
                    <Badge variant="outline" className="capitalize">{n.categoria}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString("es-AR")}</div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{n.contenido}</p>
              </div>
              {isAdmin && (
                <Button size="sm" variant="ghost" onClick={() => borrar(n.id)}><Trash2 className="size-4 text-destructive" /></Button>
              )}
            </div>
          </Card>
        ))}
        {(!items || items.length === 0) && (
          <Card className="p-8 text-center text-muted-foreground text-sm">Aún no hay novedades</Card>
        )}
      </div>
    </div>
  );
}
