import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  BookOpen, Users, Star, TrendingUp, DollarSign, Plus, Edit, Copy, 
  Send, Calendar, CheckCircle, Clock, Eye, FileText, Video, Upload,
  Award, Lock, Crown, BarChart3, MessageSquare, Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses] = useState<Course[]>(mockCourses);
  const [creationStep, setCreationStep] = useState(1);
  
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

  const renderCreationWizard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Créer une formation</h2>
        <div className="flex items-center gap-2">
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
      </div>

      {creationStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 1 : Métadonnées</CardTitle>
            <CardDescription>Informations générales sur votre formation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titre de la formation</Label>
                <Input placeholder="Ex: Maîtriser les marchés publics" />
              </div>
              <div className="space-y-2">
                <Label>Compétence visée</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ao">Appels d'offres</SelectItem>
                    <SelectItem value="finance">Finance & Bancabilité</SelectItem>
                    <SelectItem value="vente">Vente & Commercial</SelectItem>
                    <SelectItem value="production">Production & Qualité</SelectItem>
                    <SelectItem value="digital">Digital & Pilotage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Résumé</Label>
              <Textarea placeholder="Décrivez brièvement ce que les apprenants vont apprendre..." rows={3} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Niveau" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debutant">Débutant</SelectItem>
                    <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                    <SelectItem value="avance">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Format" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Vidéo à la demande</SelectItem>
                    <SelectItem value="live">Live / Webinaire</SelectItem>
                    <SelectItem value="presentiel">Présentiel</SelectItem>
                    <SelectItem value="hybride">Hybride</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Module lié</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Module" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ao">Appels d'Offres</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="financement">Financement</SelectItem>
                    <SelectItem value="incubateur">Incubateur</SelectItem>
                    <SelectItem value="datahub">DataHub</SelectItem>
                    <SelectItem value="evenements">Événements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {creationStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 2 : Contenu</CardTitle>
            <CardDescription>Structure et contenus de votre formation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Chapitre 1 : Introduction</h4>
                <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
              </div>
              <div className="pl-4 space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary" />
                    <span className="text-sm">Leçon 1.1 : Présentation</span>
                  </div>
                  <span className="text-xs text-muted-foreground">5 min</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm">Leçon 1.2 : Ressources</span>
                  </div>
                  <span className="text-xs text-muted-foreground">PDF</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Ajouter une leçon
                </Button>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Ajouter un chapitre
            </Button>

            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-2">Importer des vidéos</p>
              <p className="text-sm text-muted-foreground mb-4">MP4, MOV - Max 500 MB par fichier</p>
              <Button variant="outline">Parcourir</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {creationStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 3 : Certification</CardTitle>
            <CardDescription>Définissez les critères d'obtention du certificat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!limits.canCertify ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
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
                    <Label>Proposer une certification</Label>
                    <p className="text-sm text-muted-foreground">Délivrer un badge/certificat</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Critères de réussite</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked />
                      <span className="text-sm">Quiz réussi (min 70%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch />
                      <span className="text-sm">Devoir validé</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked />
                      <span className="text-sm">100% progression</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch />
                      <span className="text-sm">Présence live</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nom du badge</Label>
                  <Input placeholder="Ex: Prêt AO" />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {creationStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 4 : Tarification</CardTitle>
            <CardDescription>Définissez le prix de votre formation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!limits.canMonetize ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Monétisation réservée Or+</span>
                </div>
                <p className="text-sm text-muted-foreground">Votre formation sera gratuite. Passez au plan Or pour monétiser.</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Crown className="w-4 h-4 mr-2" /> Voir les plans
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Formation gratuite</Label>
                    <p className="text-sm text-muted-foreground">Accessible à tous sans paiement</p>
                  </div>
                  <Switch />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prix public (FCFA)</Label>
                    <Input type="number" placeholder="25000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Prix membre (-20%)</Label>
                    <Input type="number" placeholder="20000" disabled className="bg-muted" />
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">Commission CPU Academy</p>
                  <p className="text-muted-foreground">20% sur chaque vente. Vous recevez 80% du prix.</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {creationStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Étape 5 : Soumettre</CardTitle>
            <CardDescription>Vérifiez et soumettez votre formation pour validation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Métadonnées complètes</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">3 chapitres, 8 leçons</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Certification configurée</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Prix défini : 25 000 FCFA</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600">
                Votre formation sera examinée par notre équipe sous 48h. Vous serez notifié par email.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCreationStep(Math.max(1, creationStep - 1))}
          disabled={creationStep === 1}
        >
          Précédent
        </Button>
        {creationStep < 5 ? (
          <Button onClick={() => setCreationStep(creationStep + 1)}>
            Suivant
          </Button>
        ) : (
          <Button>
            <Send className="w-4 h-4 mr-2" /> Soumettre à validation
          </Button>
        )}
      </div>
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
          <TabsTrigger value="create" className="gap-2" disabled={!canCreateMore}>
            <Plus className="w-4 h-4" /> Créer
            {!canCreateMore && <Lock className="w-3 h-3 ml-1" />}
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
              <Button onClick={() => setActiveTab("create")} disabled={!canCreateMore}>
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

        <TabsContent value="create">
          {canCreateMore ? (
            renderCreationWizard()
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Limite atteinte</h3>
                <p className="text-muted-foreground mb-4">
                  Vous avez atteint le nombre maximum de cours pour votre abonnement {subscriptionTier}.
                </p>
                <Button>
                  <Crown className="w-4 h-4 mr-2" /> Passer au plan supérieur
                </Button>
              </CardContent>
            </Card>
          )}
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
    </div>
  );
}
