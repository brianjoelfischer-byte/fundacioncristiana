import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, ClipboardList, Megaphone, Users, CalendarDays, TrendingUp,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { user, isAdmin, employeeId } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", isAdmin, employeeId],
    queryFn: async () => {
      if (isAdmin) {
        const [emps, reqs, payslips, news] = await Promise.all([
          supabase.from("employees").select("id, estado", { count: "exact", head: false }),
          supabase.from("requests").select("id, estado", { count: "exact", head: false }).eq("estado", "pendiente"),
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
          supabase.from("payslips").select("id, periodo_mes, periodo_anio").eq("employee_id", employeeId).order("periodo_anio", { ascending: false }).order("periodo_mes", { ascending: false }).limit(3),
          supabase.from("news").select("id, titulo, created_at, categoria").order("created_at", { ascending: false }).limit(3),
        ]);
        return {
          misSolicitudes: reqs.data?.length ?? 0,
          pendientes: reqs.data?.filter((r) => r.estado === "pendiente").length ?? 0,
          ultimosRecibos: payslips.data ?? [],
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
      const { data } = await supabase.from("employees").select("nombre, apellido, cargo, dias_vacaciones_disponibles").eq("id", employeeId).maybeSingle();
      return data;
    },
    enabled: !!employeeId,
  });

  const saludo = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  })();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl p-6 md:p-8 text-primary-foreground shadow-[var(--shadow-elegant)] relative overflow-hidden"
           style={{ background: "var(--gradient-hero)" }}>
        <div className="relative z-10">
          <p className="text-sm opacity-80">{saludo},</p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mt-1">
            {empleado?.nombre ?? user?.email?.split("@")[0]} {empleado?.apellido ?? ""}
          </h1>
          {empleado?.cargo && <p className="opacity-90 mt-1">{empleado.cargo}</p>}
          {isAdmin && <Badge variant="secondary" className="mt-3">Administrador RRHH</Badge>}
        </div>
        <div className="absolute -bottom-24 -right-10 size-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Stats */}
      {isAdmin ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Empleados" value={stats?.totalEmpleados ?? 0} hint={`${stats?.activos ?? 0} activos`} />
          <StatCard icon={ClipboardList} label="Solicitudes pendientes" value={stats?.solicitudesPendientes ?? 0} accent />
          <StatCard icon={FileText} label="Recibos cargados" value={stats?.totalRecibos ?? 0} />
          <StatCard icon={TrendingUp} label="Estado general" value="Saludable" small />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ClipboardList} label="Mis solicitudes" value={stats?.misSolicitudes ?? 0} hint={`${stats?.pendientes ?? 0} pendientes`} />
          <StatCard icon={CalendarDays} label="Días de vacaciones" value={empleado?.dias_vacaciones_disponibles ?? 0} hint="disponibles" />
          <StatCard icon={FileText} label="Recibos recientes" value={stats?.ultimosRecibos?.length ?? 0} />
          <StatCard icon={Megaphone} label="Novedades nuevas" value={stats?.news?.length ?? 0} />
        </div>
      )}

      {/* Accesos rápidos + Novedades */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold mb-4">Novedades recientes</h2>
          <div className="space-y-3">
            {stats?.news?.length ? stats.news.map((n) => (
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
            )) : (
              <p className="text-sm text-muted-foreground">Aún no hay novedades publicadas.</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Accesos rápidos</h2>
          <div className="grid grid-cols-2 gap-2">
            <QuickLink to="/app/recibos" icon={FileText} label="Recibos" />
            <QuickLink to="/app/solicitudes" icon={ClipboardList} label="Solicitudes" />
            <QuickLink to="/app/pedidos" icon={Megaphone} label="Pedidos RRHH" />
            <QuickLink to="/app/calendario" icon={CalendarDays} label="Calendario" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, accent, small }: any) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className={`size-10 rounded-xl grid place-items-center ${accent ? "bg-accent text-accent-foreground" : "bg-accent/10 text-accent"}`}>
          <Icon className="size-5" />
        </div>
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
