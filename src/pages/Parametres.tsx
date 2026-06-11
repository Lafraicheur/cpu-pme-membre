import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Save,
  ChevronRight,
  Clock,
  Newspaper,
  Zap,
  ShoppingBag,
  GraduationCap,
  FileText
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mailingApi } from "@/lib/api";

const TOPICS = [
  { key: "formation",     label: "Formation",         desc: "Nouvelles formations, rappels, certificats", icon: GraduationCap },
  { key: "marketplace",   label: "Marketplace",        desc: "Commandes, messages acheteurs, stock",      icon: ShoppingBag   },
  { key: "appels_offres", label: "Appels d'offres",    desc: "Nouveaux AO, résultats, délais",            icon: FileText      },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function Parametres() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Notifications state (synced from API)
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [contentAlertOptIn, setContentAlertOptIn] = useState(true);
  const [alertHour, setAlertHour] = useState(8);
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);

  // Fetch mailing preferences
  const { data: prefs, isLoading: isLoadingPrefs } = useQuery({
    queryKey: ["mailing-preferences"],
    queryFn: mailingApi.getPreferences,
    staleTime: 5 * 60 * 1000,
  });

  // Sync local state when API data arrives
  useEffect(() => {
    if (!prefs) return;
    setNewsletterOptIn(prefs.newsletterOptIn);
    setContentAlertOptIn(prefs.contentAlertOptIn);
    setAlertHour(prefs.alertHour);
    setSubscribedTopics(prefs.subscribedTopics ?? []);
  }, [prefs]);

  // Save notifications
  const saveNotifsMutation = useMutation({
    mutationFn: mailingApi.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailing-preferences"] });
      toast.success("Préférences de notifications enregistrées");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors de la sauvegarde");
    },
  });

  function toggleTopic(key: string) {
    setSubscribedTopics(prev =>
      prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]
    );
  }

  function handleSaveProfile() {
    toast.success("Profil mis à jour avec succès");
  }

  function handleSaveNotifications() {
    saveNotifsMutation.mutate({
      newsletterOptIn,
      contentAlertOptIn,
      alertHour,
      alertMinute: 0,
      subscribedTopics,
    });
  }

  return (
    <>
      <Helmet>
        <title>Paramètres - CPU-PME</title>
        <meta name="description" content="Gérez vos paramètres de compte, notifications et préférences." />
      </Helmet>
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
            <p className="text-muted-foreground">
              Gérez votre compte et vos préférences
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="gap-2 text-xs sm:text-sm">
                <User className="h-4 w-4 flex-shrink-0" />
                <span>Profil</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2 text-xs sm:text-sm">
                <Bell className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Notifs</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>Mettez à jour vos informations de profil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rôle</Label>
                      <Input value={user?.role || "owner"} disabled />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile}>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Entreprise associée</CardTitle>
                  <CardDescription>Votre compte est lié à cette entreprise</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{user?.companyName || "Entreprise Demo SARL"}</p>
                      <p className="text-sm text-muted-foreground">Compte actif</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/mon-entreprise")}>
                      Gérer l'entreprise
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6 space-y-6">
              {isLoadingPrefs ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-40 w-full rounded-xl" />
                </div>
              ) : (
                <>
                  {/* Newsletter */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Newsletter</CardTitle>
                      <CardDescription>Recevez nos actualités et informations sectorielles</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Newspaper className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Newsletter CPU-PME</p>
                            <p className="text-sm text-muted-foreground">Actualités, événements et opportunités filière</p>
                          </div>
                        </div>
                        <Switch checked={newsletterOptIn} onCheckedChange={setNewsletterOptIn} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alertes contenu */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Alertes contenu</CardTitle>
                      <CardDescription>Recevez un email quotidien récapitulatif des nouveautés</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Zap className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Alertes quotidiennes</p>
                            <p className="text-sm text-muted-foreground">Résumé des nouvelles formations, AO et ressources</p>
                          </div>
                        </div>
                        <Switch checked={contentAlertOptIn} onCheckedChange={setContentAlertOptIn} />
                      </div>

                      {contentAlertOptIn && (
                        <div className="flex items-center gap-3 px-1">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          <Label className="text-sm shrink-0">Heure d'envoi</Label>
                          <Select
                            value={String(alertHour)}
                            onValueChange={(v) => setAlertHour(Number(v))}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {HOURS.map(h => (
                                <SelectItem key={h} value={String(h)}>
                                  {String(h).padStart(2, "0")}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Topics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Thèmes d'intérêt</CardTitle>
                      <CardDescription>Sélectionnez les domaines pour lesquels vous souhaitez recevoir des alertes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {TOPICS.map((topic, idx) => {
                        const Icon = topic.icon;
                        return (
                          <div key={topic.key}>
                            {idx > 0 && <Separator className="mb-4" />}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{topic.label}</p>
                                  <p className="text-sm text-muted-foreground">{topic.desc}</p>
                                </div>
                              </div>
                              <Switch
                                checked={subscribedTopics.includes(topic.key)}
                                onCheckedChange={() => toggleTopic(topic.key)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveNotifications}
                      disabled={saveNotifsMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saveNotifsMutation.isPending ? "Enregistrement…" : "Enregistrer les préférences"}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
