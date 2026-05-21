import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { NotificationsBell } from "@/components/NotificationsBell";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const { session, loading, employeeId } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  const { data: perfil } = useQuery({
    queryKey: ["perfil-completo", employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      const { data } = await supabase.from("employees").select("perfil_completo").eq("id", employeeId).maybeSingle();
      return data;
    },
    enabled: !!employeeId,
  });

  useEffect(() => {
    if (perfil && perfil.perfil_completo === false && path !== "/app/onboarding") {
      navigate({ to: "/app/onboarding" });
    }
  }, [perfil, path, navigate]);

  if (loading || !session) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b bg-background/80 backdrop-blur px-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="font-heading font-semibold text-sm">Portal RRHH</div>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <NotificationsBell />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
