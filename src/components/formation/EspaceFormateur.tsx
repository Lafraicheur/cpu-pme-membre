import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen, Users, Star, TrendingUp, DollarSign, Plus, Edit, Copy,
  Send, Calendar, CheckCircle, Clock, Eye, Upload,
  Lock, Crown, BarChart3, MessageSquare, ImageIcon, FileVideo,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formationsApi, centreFormationsApi, formationModulesApi, type CentreFormation, type FormationModule } from "@/lib/api";

type SubscriptionTier = "bronze" | "silver" | "gold" | "platine";

interface Course {
  id: string;
  title: string;
  status: "draft" | "submitted" | "published" | "rejected";
  learners: number;
  completion: number;
  rating: number;
  revenue: number;
  createdAt: string;
}

const mockCourses: Course[] = [
  { id: "1", title: "Maîtriser les Appels d'Offres", status: "published", learners: 156, completion: 78, rating: 4.8, revenue: 450000, createdAt: "2025-10-15" },
  { id: "2", title: "Excellence opérationnelle PME", status: "published", learners: 89, completion: 65, rating: 4.6, revenue: 280000, createdAt: "2025-11-20" },
  { id: "3", title: "Négociation bancaire", status: "submitted", learners: 0, completion: 0, rating: 0, revenue: 0, createdAt: "2026-01-02" },
  { id: "4", title: "Export vers la CEDEAO", status: "draft", learners: 0, completion: 0, rating: 0, revenue: 0, createdAt: "2026-01-03" },
];

const subscriptionLimits: Record<SubscriptionTier, { courses: number; canMonetize: boolean; canCertify: boolean }> = {
  bronze: { courses: 0, canMonetize: false, canCertify: false },
  silver: { courses: 1, canMonetize: false, canCertify: false },
  gold: { courses: 5, canMonetize: true, canCertify: true },
  platine: { courses: -1, canMonetize: true, canCertify: true }, // -1 = illimité
};

export function EspaceFormateur() {
  useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses] = useState<Course[]>(mockCourses);
  const [creationStep, setCreationStep] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [centres, setCentres] = useState<CentreFormation[]>([]);
  const [modules, setModules] = useState<FormationModule[]>([]);

  useEffect(() => {
    centreFormationsApi.getAll().then(setCentres).catch(() => {});
    formationModulesApi.getAll().then(setModules).catch(() => {});
  }, []);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fichierInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    mode: "",
    niveau: "",
    duration: "",
    moduleId: "",
    formateur_id: "",
    centreFormationId: "",
    lien: "",
    date: "",
    isPaid: false,
    isActive: true,
    price: "",
    price_member: "",
    certification_delivrer_badge: false,
    certification_quiz_reussi: false,
    certification_progression_100: false,
    certification_devoir_valide: false,
    certification_presence_live: false,
    certification_nom_badge: "",
    image: null as File | null,
    fichier: null as File | null,
  });

  const setF = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));
  
  // Simulated subscription
  const subscriptionTier: SubscriptionTier = "gold";
  const limits = subscriptionLimits[subscriptionTier];
  const publishedCount = courses.filter(c => c.status === "published").length;
  const canCreateMore = limits.courses === -1 || publishedCount < limits.courses;

  const totalLearners = courses.reduce((acc, c) => acc + c.learners, 0);
  const avgCompletion = Math.round(courses.filter(c => c.learners > 0).reduce((acc, c) => acc + c.completion, 0) / courses.filter(c => c.learners > 0).length) || 0;
  const avgRating = (courses.filter(c => c.rating > 0).reduce((acc, c) => acc + c.rating, 0) / courses.filter(c => c.rating > 0).length).toFixed(1) || "0";
  const totalRevenue = courses.reduce((acc, c) => acc + c.revenue, 0);

  const getStatusBadge = (status: Course["status"]) => {
    switch (status) {
      case "draft": return <Badge variant="secondary">Brouillon</Badge>;
      case "submitted": return <Badge variant="outline" className="border-amber-500 text-amber-500">En validation</Badge>;
      case "published": return <Badge className="bg-green-500">Publié</Badge>;
      case "rejected": return <Badge variant="destructive">Rejeté</Badge>;
    }
  };

  const handleSubmitFormation = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await formationsApi.create({
        title: form.title,
        description: form.description || undefined,
        category: form.category || undefined,
        mode: form.mode || undefined,
        niveau: form.niveau || undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        isPaid: form.isPaid,
        isActive: form.isActive,
        price: form.price ? Number(form.price) : undefined,
        price_member: form.price_member ? Number(form.price_member) : undefined,
        moduleId: form.moduleId || undefined,
        formateur_id: form.formateur_id || undefined,
        centreFormationId: form.centreFormationId || undefined,
        lien: form.lien || undefined,
        date: form.date || undefined,
        certification_delivrer_badge: form.certification_delivrer_badge,
        certification_quiz_reussi: form.certification_quiz_reussi,
        certification_progression_100: form.certification_progression_100,
        certification_devoir_valide: form.certification_devoir_valide,
        certification_presence_live: form.certification_presence_live,
        certification_nom_badge: form.certification_nom_badge || undefined,
        image: form.image,
        fichier: form.fichier,
      });
      setSubmitSuccess(true);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const renderCreationWizard = () => (
    <div className="space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center justify-end gap-2">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === creationStep ? "bg-primary text-primary-foreground" :
              step < creationStep ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            {step < creationStep ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
        ))}
      </div>

      {/* Étape 1 — Métadonnées */}
      {creationStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 1 : Informations générales</CardTitle>
            <CardDescription>Renseignez les informations de base de votre formation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titre <span className="text-destructive">*</span></Label>
              <Input value={form.title} onChange={(e) => setF("title", e.target.value)} placeholder="Ex: Maîtriser les marchés publics" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setF("description", e.target.value)} placeholder="Décrivez ce que les apprenants vont apprendre..." rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Input value={form.category} onChange={(e) => setF("category", e.target.value)} placeholder="Ex: Finance, Commerce..." />
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={form.mode} onValueChange={(v) => setF("mode", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir le mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a_son_rythme">À son rythme (vidéo)</SelectItem>
                    <SelectItem value="webinaire">Webinaire / Live</SelectItem>
                    <SelectItem value="presentiel">Présentiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select value={form.niveau} onValueChange={(v) => setF("niveau", v)}>
                  <SelectTrigger><SelectValue placeholder="Niveau" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durée (heures)</Label>
                <Input type="number" value={form.duration} onChange={(e) => setF("duration", e.target.value)} placeholder="Ex: 10" min={0} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID Formateur (UUID)</Label>
                <Input value={form.formateur_id} onChange={(e) => setF("formateur_id", e.target.value)} placeholder="UUID du formateur" />
              </div>
              <div className="space-y-2">
                <Label>Module lié</Label>
                <Select value={form.moduleId} onValueChange={(v) => setF("moduleId", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir un module" /></SelectTrigger>
                  <SelectContent>
                    {modules.length === 0 && (
                      <SelectItem value="_" disabled>Chargement...</SelectItem>
                    )}
                    {modules.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date — visible pour tous les modes */}
            <div className="space-y-2">
              <Label>Date & heure de la formation</Label>
              <Input type="datetime-local" value={form.date} onChange={(e) => setF("date", e.target.value)} />
            </div>

            {/* Champs conditionnels selon le mode */}
            {form.mode === "webinaire" && (
              <div className="space-y-2">
                <Label>Lien du webinaire</Label>
                <Input value={form.lien} onChange={(e) => setF("lien", e.target.value)} placeholder="https://zoom.us/..." />
              </div>
            )}
            {form.mode === "presentiel" && (
              <div className="space-y-2">
                <Label>Centre de formation</Label>
                <Select value={form.centreFormationId} onValueChange={(v) => setF("centreFormationId", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir un centre" /></SelectTrigger>
                  <SelectContent>
                    {centres.length === 0 && (
                      <SelectItem value="_" disabled>Chargement...</SelectItem>
                    )}
                    {centres.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nom} — {c.ville}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Étape 2 — Médias */}
      {creationStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 2 : Médias</CardTitle>
            <CardDescription>Image de couverture et fichier vidéo/document principal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image */}
            <div className="space-y-2">
              <Label>Image de couverture</Label>
              <div
                className="border-2 border-dashed rounded-sm p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => imageInputRef.current?.click()}
              >
                {form.image ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{form.image.name}</span>
                    <span className="text-muted-foreground">({(form.image.size / 1024 / 1024).toFixed(1)} Mo)</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Cliquer pour choisir une image</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP</p>
                  </>
                )}
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => setF("image", e.target.files?.[0] ?? null)} />
            </div>

            {/* Fichier vidéo/document */}
            <div className="space-y-2">
              <Label>Fichier principal (vidéo ou document)</Label>
              <div
                className="border-2 border-dashed rounded-sm p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fichierInputRef.current?.click()}
              >
                {form.fichier ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <FileVideo className="w-5 h-5 text-primary" />
                    <span className="font-medium">{form.fichier.name}</span>
                    <span className="text-muted-foreground">({(form.fichier.size / 1024 / 1024).toFixed(1)} Mo)</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Cliquer pour choisir un fichier</p>
                    <p className="text-xs text-muted-foreground mt-1">MP4, MOV, PDF — max 500 Mo</p>
                  </>
                )}
              </div>
              <input ref={fichierInputRef} type="file" accept="video/*,.pdf" className="hidden"
                onChange={(e) => setF("fichier", e.target.files?.[0] ?? null)} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 3 — Certification */}
      {creationStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 3 : Certification</CardTitle>
            <CardDescription>Définissez les critères d'obtention du certificat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!limits.canCertify ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-sm border border-amber-200">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Fonctionnalité réservée Or+</span>
                </div>
                <p className="text-sm text-muted-foreground">Passez au plan Or pour proposer des certifications.</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Crown className="w-4 h-4 mr-2" /> Voir les plans
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Délivrer un badge / certificat</Label>
                    <p className="text-sm text-muted-foreground">Activez pour proposer une certification</p>
                  </div>
                  <Switch checked={form.certification_delivrer_badge} onCheckedChange={(v) => setF("certification_delivrer_badge", v)} />
                </div>

                {form.certification_delivrer_badge && (
                  <>
                    <div className="space-y-2">
                      <Label>Nom du badge</Label>
                      <Input value={form.certification_nom_badge} onChange={(e) => setF("certification_nom_badge", e.target.value)} placeholder="Ex: Prêt AO" />
                    </div>
                    <div className="space-y-2">
                      <Label>Critères de réussite</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: "certification_quiz_reussi", label: "Quiz réussi (min 70%)" },
                          { key: "certification_devoir_valide", label: "Devoir validé" },
                          { key: "certification_progression_100", label: "100% progression" },
                          { key: "certification_presence_live", label: "Présence live" },
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center gap-2">
                            <Switch checked={(form as Record<string, unknown>)[key] as boolean}
                              onCheckedChange={(v) => setF(key, v)} />
                            <span className="text-sm">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Étape 4 — Tarification */}
      {creationStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 4 : Tarification</CardTitle>
            <CardDescription>Définissez le prix et la visibilité de votre formation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Formation active (visible)</Label>
                <p className="text-sm text-muted-foreground">La formation sera visible dans le catalogue</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(v) => setF("isActive", v)} />
            </div>

            {!limits.canMonetize ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-sm border border-amber-200">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Monétisation réservée Or+</span>
                </div>
                <p className="text-sm text-muted-foreground">Votre formation sera gratuite. Passez au plan Or pour la monétiser.</p>
                <Button variant="outline" size="sm" className="mt-2 rounded-sm">
                  <Crown className="w-4 h-4 mr-2" /> Voir les plans
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Formation payante</Label>
                    <p className="text-sm text-muted-foreground">Désactivez pour rendre la formation gratuite</p>
                  </div>
                  <Switch checked={form.isPaid} onCheckedChange={(v) => setF("isPaid", v)} />
                </div>

                {form.isPaid && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Prix public (FCFA)</Label>
                        <Input type="number" value={form.price} onChange={(e) => setF("price", e.target.value)} placeholder="25000" min={0} />
                      </div>
                      <div className="space-y-2">
                        <Label>Prix membre (FCFA)</Label>
                        <Input type="number" value={form.price_member} onChange={(e) => setF("price_member", e.target.value)} placeholder="20000" min={0} />
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-sm text-sm">
                      <p className="font-medium mb-1">Commission CPU Academy</p>
                      <p className="text-muted-foreground">20% sur chaque vente. Vous recevez 80% du prix.</p>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Étape 5 — Récapitulatif */}
      {creationStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 5 : Récapitulatif</CardTitle>
            <CardDescription>Vérifiez les informations avant de soumettre</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {submitSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle className="w-14 h-14 mx-auto text-green-500" />
                <p className="font-semibold text-lg">Formation créée avec succès !</p>
                <p className="text-sm text-muted-foreground">Elle sera examinée par notre équipe sous 48h.</p>
                <Button onClick={() => { setCreateOpen(false); setSubmitSuccess(false); setCreationStep(1); }} className="rounded-sm">
                  Fermer
                </Button>
              </div>
            ) : (
              <>
                {[
                  { label: "Titre", value: form.title || "—" },
                  { label: "Catégorie", value: form.category || "—" },
                  { label: "Mode", value: form.mode || "—" },
                  { label: "Niveau", value: form.niveau || "—" },
                  { label: "Durée", value: form.duration ? `${form.duration}h` : "—" },
                  { label: "Image", value: form.image?.name || "—" },
                  { label: "Fichier", value: form.fichier?.name || "—" },
                  { label: "Certification", value: form.certification_delivrer_badge ? `Oui — ${form.certification_nom_badge || "sans nom"}` : "Non" },
                  { label: "Prix", value: form.isPaid ? `${form.price} FCFA (membre: ${form.price_member} FCFA)` : "Gratuit" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm py-1.5 border-b last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}

                {submitError && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-sm text-sm">{submitError}</div>
                )}

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-200">
                  <p className="text-sm text-blue-600">
                    Votre formation sera examinée par notre équipe sous 48h. Vous serez notifié par email.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {!submitSuccess && (
        <div className="flex justify-between">
          <Button variant="outline" className="rounded-sm"
            onClick={() => setCreationStep(Math.max(1, creationStep - 1))}
            disabled={creationStep === 1 || submitting}
          >
            Précédent
          </Button>
          {creationStep < 5 ? (
            <Button className="rounded-sm" disabled={creationStep === 1 && !form.title}
              onClick={() => setCreationStep(creationStep + 1)}
            >
              Suivant
            </Button>
          ) : (
            <Button className="rounded-sm gap-2" onClick={handleSubmitFormation} disabled={submitting}>
              {submitting ? <span className="animate-spin">⏳</span> : <Send className="w-4 h-4" />}
              {submitting ? "Envoi en cours..." : "Soumettre à validation"}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with subscription info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Espace Formateur
          </h2>
          <p className="text-muted-foreground">Créez et gérez vos formations</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Crown className="w-3 h-3 text-amber-500" />
            Abonnement {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
          </Badge>
          {limits.courses !== -1 && (
            <span className="text-sm text-muted-foreground">
              {publishedCount}/{limits.courses} cours publiés
            </span>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="w-4 h-4" /> Mes cours
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Calendar className="w-4 h-4" /> Sessions
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="gap-2">
            <MessageSquare className="w-4 h-4" /> Évaluations
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <DollarSign className="w-4 h-4" /> Revenus
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Cours publiés</span>
                </div>
                <p className="text-2xl font-bold">{courses.filter(c => c.status === "published").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Apprenants</span>
                </div>
                <p className="text-2xl font-bold">{totalLearners}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Complétion</span>
                </div>
                <p className="text-2xl font-bold">{avgCompletion}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">Satisfaction</span>
                </div>
                <p className="text-2xl font-bold">{avgRating}/5</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Revenus</span>
                </div>
                <p className="text-2xl font-bold">{(totalRevenue / 1000).toFixed(0)}K</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent activity */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cours récents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.learners} apprenants</p>
                    </div>
                    {getStatusBadge(course.status)}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions en attente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">3 devoirs à corriger</span>
                  </div>
                  <Button size="sm" variant="outline">Voir</Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">5 questions sans réponse</span>
                  </div>
                  <Button size="sm" variant="outline">Répondre</Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Live demain 14h</span>
                  </div>
                  <Button size="sm" variant="outline">Préparer</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Input placeholder="Rechercher un cours..." className="max-w-sm" />
              <Button onClick={() => { setCreationStep(1); setCreateOpen(true); }} disabled={!canCreateMore}>
                <Plus className="w-4 h-4 mr-2" /> Nouvelle formation
              </Button>
            </div>

            <div className="space-y-3">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{course.title}</h3>
                          {getStatusBadge(course.status)}
                        </div>
                        {course.status === "published" && (
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" /> {course.learners} apprenants
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" /> {course.completion}% complétion
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4" /> {course.rating}/5
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" /> {course.revenue.toLocaleString()} FCFA
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon"><Copy className="w-4 h-4" /></Button>
                        {course.status === "draft" && (
                          <Button size="sm">
                            <Send className="w-4 h-4 mr-2" /> Soumettre
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Planifier et gérer vos sessions live et présentielles</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Corriger les devoirs et publier les notes</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Suivi des revenus et reversements</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une formation</DialogTitle>
          </DialogHeader>
          {canCreateMore ? renderCreationWizard() : (
            <div className="p-4 text-center space-y-4">
              <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">Limite atteinte</h3>
              <p className="text-muted-foreground">
                Vous avez atteint le nombre maximum de cours pour votre abonnement {subscriptionTier}.
              </p>
              <Button>
                <Crown className="w-4 h-4 mr-2" /> Passer au plan supérieur
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
