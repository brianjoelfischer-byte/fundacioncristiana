import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, ClipboardList, Megaphone, Users, CalendarDays, TrendingUp,
  Cake, Sparkles, Heart, Inbox,
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/")({ component: Dashboard });

function Dashboard() {
  const { user, isAdmin, employeeId } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", isAdmin, employeeId],
    queryFn: async () => {
      if (isAdmin) {
        const [emps, reqs, payslips, news] = await Promise.all([
          supabase.from("employees").select("id, estado"),
          supabase.from("requests").select("id, estado").eq("estado", "pendiente"),
          supabase.from("payslips").select("id", { count: "exact", head: true }),
          supabase.from("news").select("id, titulo, created_at, categoria").order("created_at", { ascending: false }).limit(3),
        ]);
        return {
          totalEmpleados: emps.data?.length ?? 0,
          activos: emps.data?.filter((e) => e.estado === "activo").length ?? 0,
          solicitudesPendientes: reqs.data?.length ?? 0,
          totalRecibos: payslips.count ?? 0,
          news: news.data ?? [],
        };
      } else if (employeeId) {
        const [reqs, payslips, news] = await Promise.all([
          supabase.from("requests").select("id, estado").eq("employee_id", employeeId),
          supabase.from("payslips").select("id").eq("employee_id", employeeId),
          supabase.from("news").select("id, titulo, created_at, categoria").order("created_at", { ascending: false }).limit(3),
        ]);
        return {
          misSolicitudes: reqs.data?.length ?? 0,
          pendientes: reqs.data?.filter((r) => r.estado === "pendiente").length ?? 0,
          ultimosRecibos: payslips.data?.length ?? 0,
          news: news.data ?? [],
        };
      }
      return null;
    },
    enabled: !!(isAdmin || employeeId),
  });

  const { data: empleado } = useQuery({
    queryKey: ["mi-empleado", employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      const { data } = await supabase.from("employees").select("nombre, apellido, cargo, dias_vacaciones_disponibles, fecha_nacimiento").eq("id", employeeId).maybeSingle();
      return data;
    },
    enabled: !!employeeId,
  });

  const { data: cumples } = useQuery({
    queryKey: ["cumples-mes"],
    queryFn: async () => {
      const { data } = await supabase.from("employees").select("id, nombre, apellido, fecha_nacimiento, avatar_url, cargo").eq("estado", "activo");
      const month = new Date().getMonth() + 1;
      const today = new Date().getDate();
      return (data ?? [])
        .filter((e: any) => e.fecha_nacimiento && Number(e.fecha_nacimiento.split("-")[1]) === month)
        .map((e: any) => ({ ...e, dia: Number(e.fecha_nacimiento.split("-")[2]) }))
        .filter((e: any) => e.dia >= today)
        .sort((a: any, b: any) => a.dia - b.dia)
        .slice(0, 5);
    },
  });

  const { data: eventos } = useQuery({
    queryKey: ["proximos-eventos"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("id, titulo, fecha_inicio, ubicacion, tipo")
        .gte("fecha_inicio", new Date().toISOString()).order("fecha_inicio").limit(4);
      return data ?? [];
    },
  });

  const saludo = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  })();

  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" as const } }),
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="rounded-2xl p-6 md:p-10 text-primary-foreground shadow-[var(--shadow-elegant)] relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium mb-3">
            <Sparkles className="size-3" /> {saludo}
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold leading-tight">
            {empleado?.nombre ?? user?.email?.split("@")[0]} {empleado?.apellido ?? ""}
          </h1>
          {empleado?.cargo && <p className="opacity-90 mt-1.5 text-sm md:text-base">{empleado.cargo}</p>}
          <p className="opacity-80 mt-3 text-sm max-w-md">
            Que tengas un día con propósito. Acá estamos para acompañarte.
          </p>
          {isAdmin && <Badge variant="secondary" className="mt-4">Administrador RRHH</Badge>}
        </div>
        <div className="absolute -bottom-24 -right-10 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-20 -left-10 size-56 rounded-full bg-white/5 blur-3xl" />
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(isAdmin ? [
          { icon: Users, label: "Empleados", value: stats?.totalEmpleados ?? 0, hint: `${stats?.activos ?? 0} activos` },
          { icon: ClipboardList, label: "Solicitudes pendientes", value: stats?.solicitudesPendientes ?? 0, accent: true },
          { icon: FileText, label: "Recibos cargados", value: stats?.totalRecibos ?? 0 },
          { icon: TrendingUp, label: "Estado general", value: "Saludable", small: true },
        ] : [
          { icon: ClipboardList, label: "Mis solicitudes", value: stats?.misSolicitudes ?? 0, hint: `${stats?.pendientes ?? 0} pendientes` },
          { icon: CalendarDays, label: "Días de vacaciones", value: empleado?.dias_vacaciones_disponibles ?? 0, hint: "disponibles" },
          { icon: FileText, label: "Mis recibos", value: stats?.ultimosRecibos ?? 0 },
          { icon: Megaphone, label: "Novedades", value: stats?.news?.length ?? 0 },
        ]).map((s, i) => (
          <motion.div key={s.label} custom={i} initial="hidden" animate="show" variants={fadeUp}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Grid principal */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Novedades */}
        <motion.div custom={0} initial="hidden" animate="show" variants={fadeUp} className="lg:col-span-2">
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold">Novedades recientes</h2>
              <Link to="/app/novedades" className="text-xs text-accent hover:underline">Ver todas</Link>
            </div>
            <div className="space-y-2">
              {stats?.news?.length ? stats.news.map((n: any) => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="size-9 rounded-lg bg-accent/10 text-accent grid place-items-center shrink-0">
                    <Megaphone className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{n.titulo}</div>
                    <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString("es-AR")}</div>
                  </div>
                  <Badge variant="outline" className="capitalize">{n.categoria}</Badge>
                </div>
              )) : <EmptyState icon={Megaphone} text="Aún no hay novedades publicadas." />}
            </div>
          </Card>
        </motion.div>

        {/* Accesos rápidos */}
        <motion.div custom={1} initial="hidden" animate="show" variants={fadeUp}>
          <Card className="p-6 h-full">
            <h2 className="font-heading text-lg font-semibold mb-4">Accesos rápidos</h2>
            <div className="grid grid-cols-2 gap-2">
              <QuickLink to="/app/recibos" icon={FileText} label="Recibos" />
              <QuickLink to="/app/solicitudes" icon={ClipboardList} label="Solicitudes" />
              <QuickLink to="/app/pedidos" icon={Inbox} label="Pedidos RRHH" />
              <QuickLink to="/app/calendario" icon={CalendarDays} label="Calendario" />
              <QuickLink to="/app/documentos" icon={FileText} label="Documentos" />
              <QuickLink to="/app/perfil" icon={Heart} label="Mi perfil" />
            </div>
          </Card>
        </motion.div>

        {/* Cumpleaños */}
        <motion.div custom={2} initial="hidden" animate="show" variants={fadeUp}>
          <Card className="p-6 h-full">
            <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <Cake className="size-4 text-accent" /> Próximos cumpleaños
            </h2>
            <div className="space-y-2">
              {cumples?.length ? cumples.map((c: any) => (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40">
                  <div className="size-9 rounded-full bg-[image:var(--gradient-accent)] text-primary-foreground grid place-items-center text-xs font-heading font-bold overflow-hidden shrink-0">
                    {c.avatar_url ? <img src={c.avatar_url} alt="" className="size-full object-cover" /> : `${c.nombre?.[0] ?? ""}${c.apellido?.[0] ?? ""}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.nombre} {c.apellido}</div>
                    {c.cargo && <div className="text-xs text-muted-foreground truncate">{c.cargo}</div>}
                  </div>
                  <Badge variant="outline" className="text-[10px]">Día {c.dia}</Badge>
                </div>
              )) : <EmptyState icon={Cake} text="Sin cumpleaños próximos este mes." />}
            </div>
          </Card>
        </motion.div>

        {/* Eventos */}
        <motion.div custom={3} initial="hidden" animate="show" variants={fadeUp} className="lg:col-span-2">
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="size-4 text-accent" /> Próximos eventos
              </h2>
              <Link to="/app/calendario" className="text-xs text-accent hover:underline">Ver calendario</Link>
            </div>
            <div className="space-y-2">
              {eventos?.length ? eventos.map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="size-12 rounded-xl bg-accent/10 text-accent grid place-items-center shrink-0">
                    <div className="text-center leading-none">
                      <div className="text-[10px] uppercase">{new Date(e.fecha_inicio).toLocaleString("es-AR", { month: "short" })}</div>
                      <div className="font-bold text-base">{new Date(e.fecha_inicio).getDate()}</div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{e.titulo}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.fecha_inicio).toLocaleString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                      {e.ubicacion && ` · ${e.ubicacion}`}
                    </div>
                  </div>
                  {e.tipo && <Badge variant="outline" className="capitalize">{e.tipo}</Badge>}
                </div>
              )) : <EmptyState icon={CalendarDays} text="No hay eventos programados." />}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, accent, small }: any) {
  return (
    <Card className="p-5 hover:shadow-[var(--shadow-soft)] transition-shadow">
      <div className={`size-10 rounded-xl grid place-items-center ${accent ? "bg-accent text-accent-foreground" : "bg-accent/10 text-accent"}`}>
        <Icon className="size-5" />
      </div>
      <div className={`mt-4 font-heading font-bold ${small ? "text-xl" : "text-3xl"}`}>{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
      {hint && <div className="text-xs text-muted-foreground/80 mt-0.5">{hint}</div>}
    </Card>
  );
}

function QuickLink({ to, icon: Icon, label }: any) {
  return (
    <Link to={to} className="flex flex-col items-start gap-2 p-3 rounded-lg border hover:border-accent hover:bg-accent/5 transition-all">
      <Icon className="size-4 text-accent" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="text-center py-6 text-muted-foreground">
      <Icon className="size-8 mx-auto mb-2 opacity-40" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
