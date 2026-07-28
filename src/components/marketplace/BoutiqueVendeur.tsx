import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  Upload,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Truck,
  Shield,
  Eye,
  Edit,
  Save,
  Star,
  Package,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { boutiquesApi } from "@/lib/api";

interface BoutiqueData {
  id: string;
  vendorId: string;
  nom: string;
  slug: string;
  logo: string;
  description: string;
  slogan: string;
  telephone: string;
  email: string;
  siteWeb: string;
  regionsServies: string[];
  delaiPreparation: string;
  politiqueRetour: string;
  isActive: boolean;
}

interface PaymentSettings {
  rib: string;
  banque: string;
  mobileMoneyNumero: string;
  mobileMoneyOperateur: string;
  frequencePaiement: string;
}

const emptyBoutiqueData: BoutiqueData = {
  id: "",
  vendorId: "",
  nom: "",
  slug: "",
  logo: "",
  description: "",
  slogan: "",
  telephone: "",
  email: "",
  siteWeb: "",
  regionsServies: [],
  delaiPreparation: "24",
  politiqueRetour: "",
  isActive: true,
};

const mockPaymentSettings: PaymentSettings = {
  rib: "CI04 XXXX XXXX XXXX XXXX XXXX XXX",
  banque: "SGBCI",
  mobileMoneyNumero: "07 XX XX XX XX",
  mobileMoneyOperateur: "Orange Money",
  frequencePaiement: "weekly",
};

const mockStats = {
  produitsActifs: 12,
  commandes30j: 45,
  ca30j: 8500000,
  noteGlobale: 4.7,
  avisTotal: 156,
  tauxReponse: 94,
  delaiMoyenLivraison: 2.3,
};

export function BoutiqueVendeur() {
  const [boutiqueData, setBoutiqueData] = useState<BoutiqueData>(emptyBoutiqueData);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(mockPaymentSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [completionScore] = useState(85);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBoutiqueData((prev) => ({ ...prev, logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setIsLoading(true);
    boutiquesApi.getMyShop()
      .then((boutique) => {
        if (boutique) {
          setBoutiqueData({
            id: boutique.id,
            vendorId: boutique.vendorId,
            nom: boutique.name,
            slug: "",
            logo: boutique.logo ?? "",
            description: boutique.description,
            slogan: boutique.slogan,
            telephone: boutique.phone,
            email: boutique.email,
            siteWeb: boutique.vendor?.website_url ?? boutique.website ?? "",
            regionsServies: [],
            delaiPreparation: String(boutique.preparationDelayHours),
            politiqueRetour: boutique.returnPolicy,
            isActive: boutique.status === "active",
          });
        }
      })
      .catch(() => setError("Impossible de charger les informations de la boutique."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (!boutiqueData.id || !boutiqueData.vendorId) return;
    setIsSaving(true);
    try {
      const updated = await boutiquesApi.update(boutiqueData.id, {
        vendorId: boutiqueData.vendorId,
        name: boutiqueData.nom,
        description: boutiqueData.description,
        slogan: boutiqueData.slogan,
        logo: boutiqueData.logo || undefined,
        phone: boutiqueData.telephone,
        email: boutiqueData.email,
        website: boutiqueData.siteWeb || undefined,
        status: boutiqueData.isActive ? "active" : "inactive",
        preparationDelayHours: Number(boutiqueData.delaiPreparation),
        returnPolicy: boutiqueData.politiqueRetour,
      });
      setBoutiqueData((prev) => ({
        ...prev,
        id: updated.id,
        vendorId: updated.vendorId,
        nom: updated.name,
        logo: updated.logo ?? "",
        description: updated.description,
        slogan: updated.slogan,
        telephone: updated.phone,
        email: updated.email,
        siteWeb: updated.website ?? "",
        delaiPreparation: String(updated.preparationDelayHours),
        politiqueRetour: updated.returnPolicy,
        isActive: updated.status === "active",
      }));
      setIsEditing(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Chargement de la boutique...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {/* Header avec stats */}
      {/* <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-5xl shadow-lg overflow-hidden">
                {boutiqueData.logo
                  ? <img src={boutiqueData.logo} alt={boutiqueData.nom} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  : <Store className="w-8 h-8 text-muted-foreground/40" />
                }
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{boutiqueData.nom}</h2>
                  {boutiqueData.isActive && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{boutiqueData.slogan}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-medium">{mockStats.noteGlobale}</span>
                  <span className="text-sm text-muted-foreground">({mockStats.avisTotal} avis)</span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:ml-auto">
              <div className="text-center p-3 rounded-lg bg-background/80">
                <p className="text-2xl font-bold text-primary">{mockStats.produitsActifs}</p>
                <p className="text-xs text-muted-foreground">Produits actifs</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/80">
                <p className="text-2xl font-bold text-secondary">{mockStats.commandes30j}</p>
                <p className="text-xs text-muted-foreground">Commandes (30j)</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/80">
                <p className="text-2xl font-bold">{(mockStats.ca30j / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">CA (30j)</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/80">
                <p className="text-2xl font-bold">{mockStats.tauxReponse}%</p>
                <p className="text-xs text-muted-foreground">Taux réponse</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-background/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profil boutique complété à {completionScore}%</span>
              {completionScore < 100 && (
                <Button variant="link" size="sm" className="h-auto p-0">
                  Compléter mon profil
                </Button>
              )}
            </div>
            <Progress value={completionScore} className="h-2" />
          </div>
        </CardContent>
      </Card> */}

      <Tabs defaultValue="profil" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profil">Ma boutique</TabsTrigger>
          <TabsTrigger value="paiements">Paiements</TabsTrigger>
          <TabsTrigger value="apercu">Aperçu public</TabsTrigger>
        </TabsList>

        {/* Profil boutique + Livraison & retours fusionnés */}
        <TabsContent value="profil" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    Informations de la boutique
                  </CardTitle>
                  <CardDescription>
                    Ces informations sont visibles par les acheteurs
                  </CardDescription>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={isSaving}
                >
                  {isEditing ? (
                    <><Save className="w-4 h-4 mr-1" />{isSaving ? "Enregistrement..." : "Enregistrer"}</>
                  ) : (
                    <><Edit className="w-4 h-4 mr-1" />Modifier</>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">

              {/* ── Section : Identité ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Store className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Identité</h3>
                </div>

                {/* Logo */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border-2 border-dashed shrink-0 overflow-hidden">
                    {boutiqueData.logo
                      ? <img src={boutiqueData.logo} alt="Logo" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      : <Store className="w-8 h-8 text-muted-foreground/40" />
                    }
                  </div>
                  {isEditing && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-1" />
                        Changer le logo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WebP. Max 2MB. 200x200px recommandé.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom de la boutique *</Label>
                    <Input
                      value={boutiqueData.nom}
                      onChange={(e) => setBoutiqueData({ ...boutiqueData, nom: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slogan</Label>
                    <Input
                      value={boutiqueData.slogan}
                      onChange={(e) => setBoutiqueData({ ...boutiqueData, slogan: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Une phrase accrocheuse..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={boutiqueData.description}
                    onChange={(e) => setBoutiqueData({ ...boutiqueData, description: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Présentez votre entreprise, vos valeurs, vos certifications..."
                  />
                </div>
              </div>

              {/* ── Section : Contact ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Phone className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Contact</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Téléphone
                    </Label>
                    <Input
                      value={boutiqueData.telephone}
                      onChange={(e) => setBoutiqueData({ ...boutiqueData, telephone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </Label>
                    <Input
                      value={boutiqueData.email}
                      onChange={(e) => setBoutiqueData({ ...boutiqueData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Site web
                    </Label>
                    <Input
                      value={boutiqueData.siteWeb}
                      onChange={(e) => setBoutiqueData({ ...boutiqueData, siteWeb: e.target.value })}
                      disabled={!isEditing}
                      placeholder="www.example.com"
                    />
                  </div>
                </div>
              </div>

              {/* ── Section : Livraison & retours ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Truck className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Livraison & retours</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Délai de préparation
                    </Label>
                    <Select
                      value={boutiqueData.delaiPreparation}
                      onValueChange={(v) => setBoutiqueData({ ...boutiqueData, delaiPreparation: v })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 heures</SelectItem>
                        <SelectItem value="48">48 heures</SelectItem>
                        <SelectItem value="72">72 heures</SelectItem>
                        <SelectItem value="120">5 jours</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Temps nécessaire pour préparer une commande après paiement
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Politique de retours</Label>
                    <Textarea
                      value={boutiqueData.politiqueRetour}
                      onChange={(e) => setBoutiqueData({ ...boutiqueData, politiqueRetour: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Décrivez vos conditions de retour et d'échange..."
                    />
                  </div>
                </div>
              </div>

              {/* ── Statut boutique ── */}
              {/* <div className={cn(
                "flex items-center justify-between p-4 rounded-lg border",
                boutiqueData.isActive ? "border-green-500/30 bg-green-500/5" : "border-border"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center",
                    boutiqueData.isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                  )}>
                    {boutiqueData.isActive ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium">
                      {boutiqueData.isActive ? "Boutique active" : "Boutique inactive"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {boutiqueData.isActive
                        ? "Vos produits sont visibles sur le marketplace"
                        : "Votre boutique n'est pas visible par les acheteurs"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={boutiqueData.isActive}
                  onCheckedChange={(checked) => setBoutiqueData({ ...boutiqueData, isActive: checked })}
                  disabled={!isEditing}
                />
              </div> */}

            </CardContent>
          </Card>
        </TabsContent>

        {/* Paiements */}
        <TabsContent value="paiements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Coordonnées de paiement
              </CardTitle>
              <CardDescription>
                Informations pour recevoir vos reversements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Compte vérifié</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vos coordonnées bancaires ont été vérifiées et validées
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Banque</Label>
                  <Input value={paymentSettings.banque} disabled />
                </div>
                <div className="space-y-2">
                  <Label>RIB / IBAN</Label>
                  <Input value={paymentSettings.rib} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mobile Money</Label>
                  <Input value={`${paymentSettings.mobileMoneyOperateur} - ${paymentSettings.mobileMoneyNumero}`} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Fréquence des reversements</Label>
                  <Select value={paymentSettings.frequencePaiement} onValueChange={(v) => setPaymentSettings({ ...paymentSettings, frequencePaiement: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="biweekly">Bi-mensuel</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button variant="outline">
                <Edit className="w-4 h-4 mr-1" />
                Modifier les coordonnées bancaires
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aperçu public */}
        <TabsContent value="apercu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Aperçu de votre boutique
              </CardTitle>
              <CardDescription>
                Voici comment les acheteurs voient votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl overflow-hidden shadow-sm">
                {/* Header boutique */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 relative">
                  {/* Certification Made in CI - bandeau visible */}
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5 shadow-md">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-bold">Made in CI</span>
                      <span className="text-xs opacity-90">— Or</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-xl bg-background flex items-center justify-center text-5xl shadow-lg ring-2 ring-primary/30 overflow-hidden">
                        {boutiqueData.logo
                          ? <img src={boutiqueData.logo} alt={boutiqueData.nom} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          : <Store className="w-8 h-8 text-muted-foreground/40" />
                        }
                      </div>
                      {/* Petit badge certifié sur l'avatar */}
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md ring-2 ring-background">
                        <Award className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold">{boutiqueData.nom}</h3>
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />Vérifié
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{boutiqueData.slogan}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          {mockStats.noteGlobale} ({mockStats.avisTotal} avis)
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {mockStats.produitsActifs} produits
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {boutiqueData.regionsServies.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bandeau certification détaillé */}
                <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 border-y border-primary/20 px-6 py-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10">
                        <Award className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">Boutique certifiée Made in Côte d'Ivoire</span>
                          <Badge className="bg-primary text-primary-foreground">Or</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Score de valeur ajoutée locale : <span className="font-semibold text-primary">78%</span> • Certifié le 15/01/2024 • Valide jusqu'au 15/01/2026
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        <Shield className="w-3 h-3 mr-1" />
                        Audité CPU-PME
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-6 border-b">
                  <h4 className="font-medium mb-2">À propos</h4>
                  <p className="text-sm text-muted-foreground">{boutiqueData.description}</p>
                </div>

                {/* Badges & certifications */}
                <div className="p-6 flex flex-wrap gap-2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Award className="w-3 h-3 mr-1" />
                    Made in CI - Or
                  </Badge>
                  <Badge variant="secondary">
                    <Shield className="w-3 h-3 mr-1" />
                    Vendeur certifié
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    Répond en &lt;24h
                  </Badge>
                  <Badge variant="outline" className="border-green-500/30 text-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    KYC validé
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
