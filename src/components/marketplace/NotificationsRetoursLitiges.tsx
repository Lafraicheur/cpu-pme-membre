import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  BellRing,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Scale,
  RotateCcw,
  Send,
  CreditCard,
  XCircle,
  Shield,
  Eye,
  Trash2,
  Settings,
  Volume2,
  VolumeX,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type NotifType = "retour" | "litige" | "reclamation" | "mediation" | "remboursement" | "systeme";
type NotifChannel = "push" | "email" | "sms";
type NotifPriority = "urgent" | "normal" | "info";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  date: string;
  lu: boolean;
  priority: NotifPriority;
  channels: NotifChannel[];
  referenceId: string;
  referenceType: "retour" | "litige";
  action?: string;
}

interface NotifPreference {
  event: string;
  label: string;
  push: boolean;
  email: boolean;
  sms: boolean;
}

const typeConfig: Record<NotifType, { icon: typeof Bell; color: string; bg: string; label: string }> = {
  retour: { icon: RotateCcw, color: "text-blue-500", bg: "bg-blue-500/10", label: "Retour" },
  litige: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", label: "Litige" },
  reclamation: { icon: Send, color: "text-amber-500", bg: "bg-amber-500/10", label: "Réclamation" },
  mediation: { icon: Scale, color: "text-purple-500", bg: "bg-purple-500/10", label: "Médiation" },
  remboursement: { icon: CreditCard, color: "text-green-500", bg: "bg-green-500/10", label: "Remboursement" },
  systeme: { icon: Shield, color: "text-muted-foreground", bg: "bg-muted", label: "Système" },
};

const priorityConfig: Record<NotifPriority, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "bg-red-500 text-white" },
  normal: { label: "Normal", color: "bg-amber-500 text-white" },
  info: { label: "Info", color: "bg-muted text-muted-foreground" },
};

const mockNotifications: Notification[] = [
  {
    id: "NOTIF-001",
    type: "retour",
    title: "Nouvelle demande de retour",
    message: "Restaurant Le Gourmet a soumis une demande de retour pour \"Huile de palme raffinée\" (125 000 FCFA). Preuves jointes.",
    date: "2024-01-22 10:05",
    lu: false,
    priority: "urgent",
    channels: ["push", "email"],
    referenceId: "RET-001",
    referenceType: "retour",
    action: "Examiner et approuver/refuser",
  },
  {
    id: "NOTIF-002",
    type: "litige",
    title: "Nouveau litige ouvert - Réponse requise",
    message: "Hôtel Ivoire a ouvert un litige pour \"Anacarde brut\" (180 000 FCFA). Vous avez 72h pour répondre.",
    date: "2024-01-22 08:45",
    lu: false,
    priority: "urgent",
    channels: ["push", "email", "sms"],
    referenceId: "LIT-002",
    referenceType: "litige",
    action: "Répondre avant le 25/01",
  },
  {
    id: "NOTIF-003",
    type: "mediation",
    title: "Proposition du médiateur",
    message: "Le médiateur CPU-PME propose un remboursement de 50% (37 500 FCFA) pour le litige LIT-001. Vous pouvez accepter ou contester.",
    date: "2024-01-22 09:00",
    lu: false,
    priority: "normal",
    channels: ["push", "email"],
    referenceId: "LIT-001",
    referenceType: "litige",
    action: "Accepter ou contester",
  },
  {
    id: "NOTIF-004",
    type: "retour",
    title: "Retour approuvé - Colis en transit",
    message: "Le retour RET-004 (Beurre de karité bio) est en cours d'acheminement vers votre entrepôt.",
    date: "2024-01-22 14:30",
    lu: true,
    priority: "info",
    channels: ["push"],
    referenceId: "RET-004",
    referenceType: "retour",
  },
  {
    id: "NOTIF-005",
    type: "remboursement",
    title: "Remboursement effectué",
    message: "Le remboursement de 45 000 FCFA pour le retour RET-003 a été crédité au client via Orange Money.",
    date: "2024-01-14 09:15",
    lu: true,
    priority: "info",
    channels: ["email"],
    referenceId: "RET-003",
    referenceType: "retour",
  },
  {
    id: "NOTIF-006",
    type: "litige",
    title: "Litige résolu",
    message: "Le litige LIT-003 a été résolu par médiation. Compensation de 25 000 FCFA accordée.",
    date: "2024-01-18 14:30",
    lu: true,
    priority: "info",
    channels: ["push", "email"],
    referenceId: "LIT-003",
    referenceType: "litige",
  },
  {
    id: "NOTIF-007",
    type: "systeme",
    title: "Rappel : délai de réponse",
    message: "Il vous reste 48h pour répondre au litige LIT-002. Passé ce délai, une décision par défaut sera appliquée.",
    date: "2024-01-23 08:00",
    lu: false,
    priority: "urgent",
    channels: ["push", "email", "sms"],
    referenceId: "LIT-002",
    referenceType: "litige",
    action: "Répondre maintenant",
  },
  {
    id: "NOTIF-008",
    type: "reclamation",
    title: "Réclamation mise à jour",
    message: "Le client a fourni des preuves supplémentaires pour la réclamation RCL-2024-001 (rapport d'analyse laboratoire).",
    date: "2024-01-21 16:00",
    lu: true,
    priority: "normal",
    channels: ["push"],
    referenceId: "RCL-2024-001",
    referenceType: "retour",
  },
];

const defaultPreferences: NotifPreference[] = [
  { event: "new_return", label: "Nouvelle demande de retour", push: true, email: true, sms: false },
  { event: "return_approved", label: "Retour approuvé/refusé", push: true, email: true, sms: false },
  { event: "return_received", label: "Colis retour reçu", push: true, email: false, sms: false },
  { event: "refund_processed", label: "Remboursement effectué", push: true, email: true, sms: true },
  { event: "new_dispute", label: "Nouveau litige ouvert", push: true, email: true, sms: true },
  { event: "dispute_response", label: "Réponse au litige requise", push: true, email: true, sms: true },
  { event: "mediator_proposal", label: "Proposition du médiateur", push: true, email: true, sms: false },
  { event: "dispute_resolved", label: "Litige résolu", push: true, email: true, sms: false },
  { event: "deadline_reminder", label: "Rappel de délai", push: true, email: true, sms: true },
  { event: "status_change", label: "Changement de statut", push: true, email: false, sms: false },
];

interface NotificationsRetoursLitigesProps {
  onNavigate?: (section: string) => void;
}

export function NotificationsRetoursLitiges({ onNavigate }: NotificationsRetoursLitigesProps) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [muteAll, setMuteAll] = useState(false);
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.lu).length;
  const urgentCount = notifications.filter(n => !n.lu && n.priority === "urgent").length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    toast({ title: "Tout marqué comme lu" });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const togglePreference = (index: number, channel: NotifChannel) => {
    setPreferences(prev => prev.map((p, i) => i === index ? { ...p, [channel]: !p[channel] } : p));
  };

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);
    if (onNavigate) {
      onNavigate(notif.referenceType === "litige" ? "retours-litiges" : "retours-acheteur");
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            {urgentCount > 0 ? (
              <BellRing className="w-4 h-4 text-red-500 animate-pulse" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0" align="end">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">{unreadCount} non lues</Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
                <Check className="w-3 h-3 mr-1" />
                Tout lire
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowSettings(true)}>
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="p-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const config = typeConfig[notif.type];
                  const Icon = config.icon;
                  const pConfig = priorityConfig[notif.priority];

                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        "p-3 rounded-lg mx-1 my-0.5 cursor-pointer transition-colors hover:bg-muted/80",
                        !notif.lu && "bg-primary/5 border-l-2 border-l-primary",
                      )}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="flex gap-3">
                        <div className={cn("p-1.5 rounded-lg shrink-0 h-fit", config.bg)}>
                          <Icon className={cn("w-4 h-4", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={cn("text-sm font-medium", !notif.lu && "font-semibold")}>
                                {notif.title}
                              </span>
                              {notif.priority === "urgent" && (
                                <Badge className={cn("text-[10px] h-4 px-1", pConfig.color)}>
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100"
                              onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-muted-foreground">{notif.date}</span>
                            <div className="flex gap-1">
                              {notif.channels.includes("email") && (
                                <Mail className="w-3 h-3 text-muted-foreground" />
                              )}
                              {notif.channels.includes("push") && (
                                <Smartphone className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                            {notif.action && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {notif.action}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Dialog Paramètres de notification */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Paramètres de notifications
            </DialogTitle>
            <DialogDescription>
              Configurez les canaux de notification pour chaque événement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Mute global */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                {muteAll ? (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-5 h-5 text-primary" />
                )}
                <div>
                  <p className="font-medium">Désactiver toutes les notifications</p>
                  <p className="text-xs text-muted-foreground">Aucune notification ne sera envoyée</p>
                </div>
              </div>
              <Switch checked={muteAll} onCheckedChange={setMuteAll} />
            </div>

            {/* Tableau des préférences */}
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1fr_80px_80px_80px] gap-0 bg-muted/50 p-3 text-xs font-semibold text-muted-foreground border-b">
                <span>Événement</span>
                <span className="text-center flex items-center justify-center gap-1">
                  <Smartphone className="w-3 h-3" /> Push
                </span>
                <span className="text-center flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </span>
                <span className="text-center flex items-center justify-center gap-1">
                  <Smartphone className="w-3 h-3" /> SMS
                </span>
              </div>
              {preferences.map((pref, idx) => (
                <div
                  key={pref.event}
                  className={cn(
                    "grid grid-cols-[1fr_80px_80px_80px] gap-0 p-3 items-center",
                    idx < preferences.length - 1 && "border-b",
                    muteAll && "opacity-50 pointer-events-none"
                  )}
                >
                  <span className="text-sm">{pref.label}</span>
                  <div className="flex justify-center">
                    <Switch
                      checked={pref.push}
                      onCheckedChange={() => togglePreference(idx, "push")}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={pref.email}
                      onCheckedChange={() => togglePreference(idx, "email")}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={pref.sms}
                      onCheckedChange={() => togglePreference(idx, "sms")}
                      className="scale-75"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p className="font-medium mb-1">💡 Conseil</p>
              <p>Les notifications SMS sont envoyées uniquement pour les événements urgents (litiges, délais). Des frais SMS peuvent s'appliquer selon votre forfait.</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSettings(false)}>Annuler</Button>
              <Button onClick={() => {
                toast({ title: "Préférences enregistrées", description: "Vos paramètres de notification ont été mis à jour." });
                setShowSettings(false);
              }}>
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
