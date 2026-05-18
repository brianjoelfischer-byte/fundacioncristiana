import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight, FileText, ClipboardList, Megaphone, CalendarDays,
  Users, ShieldCheck, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal RRHH — Fundación Neuquén Oeste" },
      { name: "description", content: "Sistema interno de Recursos Humanos: recibos, solicitudes, novedades y pedidos a RRHH." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/15 backdrop-blur grid place-items-center font-bold">FN</div>
            <div className="text-sm leading-tight">
              <div className="font-heading font-semibold">Fundación Neuquén Oeste</div>
              <div className="text-xs opacity-80">Portal de RRHH</div>
            </div>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link to="/login">Ingresar</Link>
          </Button>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider bg-white/10 backdrop-blur px-3 py-1.5 rounded-full">
              <Sparkles className="size-3" /> Plataforma interna
            </span>
            <h1 className="mt-6 font-heading text-4xl md:text-6xl font-bold leading-[1.05]">
              Recursos Humanos,<br/>simple y a tu alcance.
            </h1>
            <p className="mt-5 text-lg opacity-90 max-w-xl">
              Gestioná recibos, solicitudes, novedades y pedidos administrativos
              desde un solo lugar, diseñado para nuestras escuelas y programas sociales.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/login">Acceder al portal <ArrowRight className="ml-1 size-4" /></Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-3xl bg-white/10 backdrop-blur-md p-6 border border-white/20 shadow-[var(--shadow-elegant)]">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: FileText, label: "Recibos" },
                  { icon: ClipboardList, label: "Solicitudes" },
                  { icon: Megaphone, label: "Novedades" },
                  { icon: CalendarDays, label: "Calendario" },
                ].map((f) => (
                  <div key={f.label} className="rounded-2xl bg-white/10 border border-white/10 p-5">
                    <f.icon className="size-6 mb-3 opacity-90" />
                    <div className="text-sm font-medium">{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-32 -right-20 size-[28rem] rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -top-24 -left-24 size-72 rounded-full bg-white/10 blur-3xl" />
      </header>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Todo lo que necesita tu equipo</h2>
          <p className="mt-3 text-muted-foreground">Diseñado para reducir trabajo manual y mejorar la comunicación interna.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Users, t: "Gestión de empleados", d: "Datos personales, laborales y documentación centralizados." },
            { icon: FileText, t: "Recibos de sueldo", d: "Subida y descarga de recibos en PDF, ordenados por período." },
            { icon: ClipboardList, t: "Solicitudes", d: "Permisos, vacaciones, licencias y aprobaciones en línea." },
            { icon: Megaphone, t: "Comunicación interna", d: "Comunicados, anuncios y novedades institucionales." },
            { icon: CalendarDays, t: "Calendario", d: "Eventos, cumpleaños y fechas importantes." },
            { icon: ShieldCheck, t: "Seguro y privado", d: "Cada empleado accede solo a su propia información." },
          ].map((f) => (
            <Card key={f.t} className="p-6 hover:shadow-[var(--shadow-elegant)] transition-shadow">
              <div className="size-10 rounded-xl bg-accent/10 text-accent grid place-items-center mb-4">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-heading font-semibold">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Fundación Neuquén Oeste — Portal interno de RRHH
      </footer>
    </div>
  );
}
