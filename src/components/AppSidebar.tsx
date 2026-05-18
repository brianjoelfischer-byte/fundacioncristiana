import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, FileText, CalendarDays, Megaphone,
  ClipboardList, Inbox, FolderOpen, Building2, UserCircle, LogOut,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const empleadoItems = [
  { title: "Inicio", url: "/app", icon: LayoutDashboard },
  { title: "Mi perfil", url: "/app/perfil", icon: UserCircle },
  { title: "Recibos de sueldo", url: "/app/recibos", icon: FileText },
  { title: "Mis solicitudes", url: "/app/solicitudes", icon: ClipboardList },
  { title: "Pedidos a RRHH", url: "/app/pedidos", icon: Inbox },
  { title: "Mis documentos", url: "/app/documentos", icon: FolderOpen },
  { title: "Novedades", url: "/app/novedades", icon: Megaphone },
  { title: "Calendario", url: "/app/calendario", icon: CalendarDays },
];

const adminExtra = [
  { title: "Empleados", url: "/app/empleados", icon: Users },
  { title: "Sectores", url: "/app/sectores", icon: Building2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { isAdmin, signOut, user } = useAuth();

  const isActive = (url: string) =>
    url === "/app" ? path === "/app" : path.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/app" className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-[image:var(--gradient-accent)] grid place-items-center text-sidebar-primary-foreground font-bold shrink-0 shadow-md">
            FN
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-heading font-semibold text-sm text-sidebar-foreground">Fundación</div>
              <div className="text-xs text-sidebar-foreground/70">Neuquén Oeste</div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Mi espacio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {empleadoItems.map((it) => (
                <SidebarMenuItem key={it.url}>
                  <SidebarMenuButton asChild isActive={isActive(it.url)}>
                    <Link to={it.url}>
                      <it.icon className="size-4" />
                      <span>{it.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración RRHH</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminExtra.map((it) => (
                  <SidebarMenuItem key={it.url}>
                    <SidebarMenuButton asChild isActive={isActive(it.url)}>
                      <Link to={it.url}>
                        <it.icon className="size-4" />
                        <span>{it.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && user?.email && (
          <div className="px-2 pb-2 text-xs text-sidebar-foreground/70 truncate">{user.email}</div>
        )}
        <Button variant="ghost" size="sm" onClick={signOut} className="justify-start text-sidebar-foreground hover:bg-sidebar-accent">
          <LogOut className="size-4" />
          {!collapsed && <span className="ml-2">Cerrar sesión</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
