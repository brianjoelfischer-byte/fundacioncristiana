import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Ingresar — Portal RRHH FNO" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenido/a");
        navigate({ to: "/app" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { nombre, apellido },
          },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Revisa tu email para confirmar.");
        setMode("login");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      toast.error(msg.includes("Invalid login") ? "Credenciales incorrectas" : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Hero */}
      <div className="hidden md:flex flex-col justify-between p-12 text-primary-foreground relative overflow-hidden"
           style={{ background: "var(--gradient-hero)" }}>
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-white/15 backdrop-blur grid place-items-center font-bold text-xl">FN</div>
          <div>
            <div className="font-heading text-lg font-semibold">Fundación Neuquén Oeste</div>
            <div className="text-xs opacity-80">Portal de Recursos Humanos</div>
          </div>
        </div>
        <div className="space-y-4 relative z-10">
          <h1 className="font-heading text-4xl lg:text-5xl font-bold leading-tight">
            Gestión moderna<br/>para nuestro equipo.
          </h1>
          <p className="text-base opacity-90 max-w-md">
            Recibos, solicitudes, novedades y pedidos a RRHH en un solo lugar.
            Diseñado para escuelas y programas sociales.
          </p>
        </div>
        <p className="text-xs opacity-70">© {new Date().getFullYear()} Fundación Neuquén Oeste</p>
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-20 -right-20 size-72 rounded-full bg-accent/30 blur-3xl" />
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <Card className="w-full max-w-md p-8 shadow-[var(--shadow-elegant)]">
          <h2 className="font-heading text-2xl font-bold mb-1">
            {mode === "login" ? "Bienvenido/a" : "Crear cuenta"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "login" ? "Ingresá con tu correo institucional" : "Registrá tu cuenta de empleado/a"}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={80} />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required maxLength={80} />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email}
                     onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"}
                     value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading && <Loader2 className="size-4 animate-spin mr-2" />}
              {mode === "login" ? "Ingresar" : "Crear cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-center text-muted-foreground">
            {mode === "login" ? (
              <>¿Sos nuevo/a? <button onClick={() => setMode("register")} className="text-accent font-medium hover:underline">Crear cuenta</button></>
            ) : (
              <>¿Ya tenés cuenta? <button onClick={() => setMode("login")} className="text-accent font-medium hover:underline">Ingresar</button></>
            )}
          </div>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            El primer usuario en registrarse será administrador de RRHH.
          </p>
          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Volver al inicio</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
