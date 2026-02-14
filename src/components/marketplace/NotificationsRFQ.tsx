import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Bell,
  MessageSquare,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Receipt,
  CreditCard,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType = 
  | "new_offer" 
  | "message" 
  | "proforma_received" 
  | "proforma_accepted"
  | "proforma_rejected"
  | "deposit_received"
  | "rfq_response"
  | "order_update"
  | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  rfqId?: string;
  conversationId?: string;
  actionUrl?: string;
}

const notificationConfig: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  new_offer: { icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
  message: { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
  proforma_received: { icon: Receipt, color: "text-amber-500", bg: "bg-amber-500/10" },
  proforma_accepted: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  proforma_rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  deposit_received: { icon: CreditCard, color: "text-primary", bg: "bg-primary/10" },
  rfq_response: { icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
  order_update: { icon: Package, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  system: { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted" },
};

// Mock notifications - à remplacer par données temps réel
const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    type: "new_offer",
    title: "Nouvelle offre reçue",
    message: "Coopérative Aboisso Cacao a répondu à votre RFQ pour 500kg de cacao",
    timestamp: "Il y a 5 min",
    read: false,
    rfqId: "RFQ-2024-A01",
  },
  {
    id: "notif-002",
    type: "proforma_received",
    title: "Facture proforma reçue",
    message: "Imprimerie Moderne CI vous a envoyé une proforma de 800,000 FCFA",
    timestamp: "Il y a 15 min",
    read: false,
    rfqId: "RFQ-2024-A04",
  },
  {
    id: "notif-003",
    type: "message",
    title: "Nouveau message",
    message: "Transports Ivoire Express: \"Nous pouvons faire 10% de réduction...\"",
    timestamp: "Il y a 1h",
    read: false,
    conversationId: "conv-002",
  },
  {
    id: "notif-004",
    type: "deposit_received",
    title: "Acompte reçu",
    message: "L'acompte de 420,000 FCFA pour la commande #CMD-2024-089 a été confirmé",
    timestamp: "Il y a 2h",
    read: true,
  },
  {
    id: "notif-005",
    type: "rfq_response",
    title: "Devis envoyé",
    message: "Votre devis pour Hôtel Sofitel Abidjan a bien été envoyé",
    timestamp: "Il y a 3h",
    read: true,
    rfqId: "RFQ-2024-001",
  },
  {
    id: "notif-006",
    type: "proforma_accepted",
    title: "Proforma acceptée",
    message: "Restaurant Chez Tante a accepté votre proforma",
    timestamp: "Hier",
    read: true,
  },
];

interface NotificationsRFQProps {
  onNavigate?: (section: string, id?: string) => void;
}

export function NotificationsRFQ({ onNavigate }: NotificationsRFQProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Simuler des notifications temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      // Logique pour fetch les nouvelles notifications
      // À connecter avec Supabase Realtime
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);
    setOpen(false);
    
    if (notif.conversationId) {
      onNavigate?.("messagerie-rfq", notif.conversationId);
    } else if (notif.rfqId) {
      onNavigate?.("mes-devis", notif.rfqId);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} nouvelles</Badge>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Tout marquer lu
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-2 pr-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                <p className="text-sm text-muted-foreground">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const config = notificationConfig[notif.type];
                const Icon = config.icon;

                return (
                  <Card
                    key={notif.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      !notif.read && "border-primary/30 bg-primary/5"
                    )}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-lg shrink-0", config.bg)}>
                          <Icon className={cn("w-4 h-4", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              "text-sm font-medium",
                              !notif.read && "text-foreground"
                            )}>
                              {notif.title}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{notif.timestamp}</span>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Hook pour simuler les notifications temps réel
export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // À connecter avec Supabase Realtime
  useEffect(() => {
    // Exemple de configuration Supabase Realtime:
    // const channel = supabase
    //   .channel('notifications')
    //   .on('postgres_changes', {
    //     event: 'INSERT',
    //     schema: 'public',
    //     table: 'notifications',
    //     filter: `user_id=eq.${userId}`
    //   }, (payload) => {
    //     setNotifications(prev => [payload.new as Notification, ...prev]);
    //     setUnreadCount(prev => prev + 1);
    //   })
    //   .subscribe();

    return () => {
      // supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return { notifications, unreadCount, markAsRead };
}
