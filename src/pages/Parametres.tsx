import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  Settings as SettingsIcon, 
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Smartphone,
  Mail,
  Save,
  ChevronRight
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
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Parametres() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("+225 07 XX XX XX XX");
  
  // Notifications state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [marketplaceNotifs, setMarketplaceNotifs] = useState(true);
  const [aoNotifs, setAoNotifs] = useState(true);
  const [formationNotifs, setFormationNotifs] = useState(true);
  
  // Preferences state
  const [language, setLanguage] = useState("fr");
  const [theme, setTheme] = useState("system");
  const [timezone, setTimezone] = useState("Africa/Abidjan");

  const handleSaveProfile = () => {
    toast.success("Profil mis à jour avec succès");
  };

  const handleSaveNotifications = () => {
    toast.success("Préférences de notifications enregistrées");
  };

  const handleSavePreferences = () => {
    toast.success("Préférences enregistrées");
  };

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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <Palette className="h-4 w-4" />
                Préférences
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
                    <Button variant="outline">
                      Gérer l'entreprise
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Canaux de notification</CardTitle>
                  <CardDescription>Choisissez comment recevoir vos notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Notifications par email</p>
                        <p className="text-sm text-muted-foreground">Recevez les alertes importantes par email</p>
                      </div>
                    </div>
                    <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Notifications SMS</p>
                        <p className="text-sm text-muted-foreground">Alertes urgentes par SMS</p>
                      </div>
                    </div>
                    <Switch checked={smsNotifs} onCheckedChange={setSmsNotifs} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Types de notifications</CardTitle>
                  <CardDescription>Sélectionnez les notifications que vous souhaitez recevoir</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketplace</p>
                      <p className="text-sm text-muted-foreground">Commandes, messages acheteurs, stock</p>
                    </div>
                    <Switch checked={marketplaceNotifs} onCheckedChange={setMarketplaceNotifs} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Appels d'offres</p>
                      <p className="text-sm text-muted-foreground">Nouveaux AO, résultats, délais</p>
                    </div>
                    <Switch checked={aoNotifs} onCheckedChange={setAoNotifs} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Formation</p>
                      <p className="text-sm text-muted-foreground">Nouvelles formations, rappels, certificats</p>
                    </div>
                    <Switch checked={formationNotifs} onCheckedChange={setFormationNotifs} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les préférences
                </Button>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mot de passe</CardTitle>
                  <CardDescription>Modifiez votre mot de passe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mot de passe actuel</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nouveau mot de passe</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmer le nouveau mot de passe</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="flex justify-end">
                    <Button>
                      <Key className="mr-2 h-4 w-4" />
                      Modifier le mot de passe
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Authentification à deux facteurs</CardTitle>
                  <CardDescription>Ajoutez une couche de sécurité supplémentaire</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">2FA par SMS</p>
                      <p className="text-sm text-muted-foreground">Non activé</p>
                    </div>
                    <Button variant="outline">Activer</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sessions actives</CardTitle>
                  <CardDescription>Gérez vos sessions de connexion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">Session actuelle</p>
                        <p className="text-sm text-muted-foreground">Chrome · Abidjan, CI · Maintenant</p>
                      </div>
                      <span className="text-xs text-green-500 font-medium">Active</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Déconnecter toutes les autres sessions
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Affichage</CardTitle>
                  <CardDescription>Personnalisez l'apparence de l'interface</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Thème</Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger>
                          <Palette className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Clair</SelectItem>
                          <SelectItem value="dark">Sombre</SelectItem>
                          <SelectItem value="system">Système</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Langue</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <Globe className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Région</CardTitle>
                  <CardDescription>Paramètres régionaux</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Fuseau horaire</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Abidjan">Abidjan (GMT+0)</SelectItem>
                        <SelectItem value="Africa/Lagos">Lagos (GMT+1)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSavePreferences}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les préférences
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
