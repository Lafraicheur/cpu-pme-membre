import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Building2,
  Users,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  Globe,
  Info,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { affiliationApi, type AffiliationSettings as AffiliationSettingsType, type AffiliationMeResponse } from "@/lib/api";

interface AffiliationSettingsProps {
  onBack: () => void;
}

type SettingsPayload = Omit<AffiliationSettingsType, "adhesionId" | "updatedAt">;

export function AffiliationSettings({ onBack }: AffiliationSettingsProps) {
  const queryClient = useQueryClient();

  const { data: settingsData, isLoading, isError } = useQuery({
    queryKey: ["affiliation", "settings"],
    queryFn: affiliationApi.getSettings,
    staleTime: 2 * 60 * 1000,
  });

  // Données d'affiliation depuis le cache existant
  const meData = queryClient.getQueryData<AffiliationMeResponse>(["affiliation", "me"]);
  const currentAffiliation = meData?.currentAffiliation ?? null;

  const [settings, setSettings] = useState<SettingsPayload | null>(null);

  // Initialise l'état local dès que les données API arrivent
  useEffect(() => {
    if (settingsData) {
      const { adhesionId: _a, updatedAt: _u, ...rest } = settingsData;
      setSettings(rest);
    }
  }, [settingsData]);

  const mutation = useMutation({
    mutationFn: (payload: SettingsPayload) => affiliationApi.updateSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["affiliation", "settings"], updated);
    },
    onError: (_err, variables) => {
      // Rollback optimiste : on remet l'ancienne valeur
      if (settingsData) {
        const { adhesionId: _a, updatedAt: _u, ...prev } = settingsData;
        setSettings(prev);
      }
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const updateSetting = (key: keyof SettingsPayload, value: boolean) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    mutation.mutate(updated);
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-52" />
                  </div>
                </div>
                <Skeleton className="h-6 w-10 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Paramètres d'affiliation</h2>
            <p className="text-muted-foreground">
              Gérez le partage de données avec votre organisation
            </p>
          </div>
        </div>
        {mutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Enregistrement...
          </div>
        )}
      </div>

      {/* Erreur chargement */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Impossible de charger les paramètres. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Affiliation Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Affiliation active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {currentAffiliation?.organization.name ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentAffiliation?.effectiveDate
                    ? `Membre depuis le ${new Date(currentAffiliation.effectiveDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
                    : "Aucune affiliation active"}
                </p>
              </div>
            </div>
            {currentAffiliation && (
              <Badge className="bg-emerald-500/20 text-emerald-700">Active</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visibilité des données
          </CardTitle>
          <CardDescription>
            Contrôlez quelles informations sont partagées avec votre organisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <Label className="font-medium">Profil visible</Label>
                <p className="text-sm text-muted-foreground">
                  Votre profil entreprise est visible par l'organisation
                </p>
              </div>
            </div>
            <Switch
              checked={settings.profileVisible}
              onCheckedChange={(checked) => updateSetting("profileVisible", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Globe className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <Label className="font-medium">Annuaire filière</Label>
                <p className="text-sm text-muted-foreground">
                  Apparaître dans l'annuaire public de la filière
                </p>
              </div>
            </div>
            <Switch
              checked={settings.showInDirectory}
              onCheckedChange={(checked) => updateSetting("showInDirectory", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <Label className="font-medium">Statistiques agrégées</Label>
                <p className="text-sm text-muted-foreground">
                  Partager des statistiques anonymes pour le reporting filière
                </p>
              </div>
            </div>
            <Switch
              checked={settings.shareStatistics}
              onCheckedChange={(checked) => updateSetting("shareStatistics", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <Label className="font-medium">Coordonnées de contact</Label>
                <p className="text-sm text-muted-foreground">
                  Partager téléphone et email avec les membres
                </p>
              </div>
            </div>
            <Switch
              checked={settings.shareContactInfo}
              onCheckedChange={(checked) => updateSetting("shareContactInfo", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <Label className="font-medium">Localisation</Label>
                <p className="text-sm text-muted-foreground">
                  Afficher votre région/ville dans les annuaires
                </p>
              </div>
            </div>
            <Switch
              checked={settings.shareLocation}
              onCheckedChange={(checked) => updateSetting("shareLocation", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications & Communications
          </CardTitle>
          <CardDescription>
            Gérez les communications reçues de votre organisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="font-medium">Opportunités filière</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les appels d'offres et opportunités de la filière
                </p>
              </div>
            </div>
            <Switch
              checked={settings.receiveOpportunities}
              onCheckedChange={(checked) => updateSetting("receiveOpportunities", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label className="font-medium">Invitations événements</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les invitations aux événements de l'organisation
                </p>
              </div>
            </div>
            <Switch
              checked={settings.receiveEventInvites}
              onCheckedChange={(checked) => updateSetting("receiveEventInvites", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <Label className="font-medium">Newsletters</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les newsletters et actualités de l'organisation
                </p>
              </div>
            </div>
            <Switch
              checked={settings.receiveNewsletters}
              onCheckedChange={(checked) => updateSetting("receiveNewsletters", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Info */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Protection des données</strong> — Vos données personnelles sont protégées
          conformément à la réglementation en vigueur. Seules les données que vous choisissez
          de partager sont transmises à votre organisation d'affiliation.
        </AlertDescription>
      </Alert>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5" />
            Résumé du partage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="flex justify-center mb-2">
                {settings.profileVisible ? (
                  <Eye className="h-6 w-6 text-emerald-600" />
                ) : (
                  <EyeOff className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm font-medium">Profil</p>
              <p className="text-xs text-muted-foreground">
                {settings.profileVisible ? "Visible" : "Masqué"}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="flex justify-center mb-2">
                {settings.showInDirectory ? (
                  <Globe className="h-6 w-6 text-emerald-600" />
                ) : (
                  <EyeOff className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm font-medium">Annuaire</p>
              <p className="text-xs text-muted-foreground">
                {settings.showInDirectory ? "Listé" : "Non listé"}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="flex justify-center mb-2">
                {settings.shareStatistics ? (
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                ) : (
                  <EyeOff className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm font-medium">Stats</p>
              <p className="text-xs text-muted-foreground">
                {settings.shareStatistics ? "Partagées" : "Non partagées"}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="flex justify-center mb-2">
                {settings.shareContactInfo ? (
                  <Phone className="h-6 w-6 text-emerald-600" />
                ) : (
                  <EyeOff className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm font-medium">Contact</p>
              <p className="text-xs text-muted-foreground">
                {settings.shareContactInfo ? "Partagé" : "Privé"}
              </p>
            </div>
          </div>
          {settingsData?.updatedAt && (
            <p className="text-xs text-muted-foreground mt-4 text-right">
              Dernière mise à jour : {new Date(settingsData.updatedAt).toLocaleDateString("fr-FR", {
                day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit"
              })}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
