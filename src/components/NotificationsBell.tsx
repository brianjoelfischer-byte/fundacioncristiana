import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  titulo: string;
  mensaje: string;
  link: string | null;
  leida: boolean;
  created_at: string;
}

export function NotificationsBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unread = items.filter((n) => !n.leida).length;

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setItems((data ?? []) as Notification[]);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const channel = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as Notification;
          setItems((prev) => [n, ...prev]);
          toast.info(n.titulo, { description: n.mensaje });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const markAllRead = async () => {
    if (!user || unread === 0) return;
    await supabase.from("notifications").update({ leida: true }).eq("user_id", user.id).eq("leida", false);
    setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const markOne = async (id: string) => {
    await supabase.from("notifications").update({ leida: true }).eq("id", id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
          <Bell className="size-4" />
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center"
              >
                {unread > 9 ? "9+" : unread}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <div className="font-heading font-semibold text-sm">Notificaciones</div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              <Check className="size-3 mr-1" /> Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">No tenés notificaciones aún.</p>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li
                  key={n.id}
                  onClick={() => markOne(n.id)}
                  className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${!n.leida ? "bg-accent/5" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.leida && <span className="mt-1.5 size-2 rounded-full bg-accent shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{n.titulo}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{n.mensaje}</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-1">
                        {new Date(n.created_at).toLocaleString("es-AR")}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
