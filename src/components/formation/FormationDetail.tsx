import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, BookOpen, Clock, Users, Award, Star, Play, Video, Calendar,
  User, CheckCircle2, Download, Share2, Heart, CreditCard, Building2, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FormationDetailProps {
  formationId: string;
  onBack: () => void;
}

const mockFormation = {
  id: "1",
  title: "Transformation Digitale pour PME",
  description: "Maîtrisez les outils et stratégies pour digitaliser votre entreprise. Cette formation complète vous guide pas à pas dans votre transformation numérique.",
  objectives: [
    "Comprendre les enjeux de la transformation digitale",
    "Identifier les outils adaptés à votre activité",
    "Élaborer une stratégie de digitalisation",
    "Mesurer le ROI de vos initiatives digitales",
  ],
  prerequisites: ["Aucun prérequis technique", "Connaissance basique de l'informatique"],
  category: "Numérique",
  level: "debutant",
  duration: "8h",
  format: "video",
  instructor: { name: "Dr. Kouamé Jean", title: "Expert Digital", avatar: "" },
  price: 0,
  isFree: true,
  isMemberOnly: true,
  hasCertificate: true,
  enrolled: 234,
  rating: 4.8,
  reviews: 45,
  modules: [
    { id: "1", title: "Introduction à la transformation digitale", duration: "1h", lessons: 4 },
    { id: "2", title: "Diagnostic de maturité numérique", duration: "1h30", lessons: 5 },
    { id: "3", title: "Outils et solutions digitales", duration: "2h", lessons: 8 },
    { id: "4", title: "Stratégie et roadmap", duration: "2h", lessons: 6 },
    { id: "5", title: "Conduite du changement", duration: "1h30", lessons: 4 },
  ],
};

export function FormationDetail({ formationId, onBack }: FormationDetailProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  const formation = mockFormation;
  const totalLessons = formation.modules.reduce((acc, m) => acc + m.lessons, 0);

  const handleEnroll = () => {
    toast.success("Inscription réussie ! Vous pouvez commencer la formation.");
    setShowEnrollDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge className="bg-green-500/10 text-green-600">Débutant</Badge>
            <Badge variant="outline" className="gap-1">
              <Video className="w-3 h-3" />
              Vidéo
            </Badge>
            {formation.hasCertificate && (
              <Badge variant="outline" className="gap-1">
                <Award className="w-3 h-3" />
                Certifiant
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{formation.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
            <Heart className={cn("w-5 h-5", isFavorite && "fill-red-500 text-red-500")} />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button onClick={() => setShowEnrollDialog(true)} size="lg" className="gap-2">
            <Play className="w-5 h-5" />
            S'inscrire
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
            <Play className="w-16 h-16 text-primary/50" />
          </div>

          <Tabs defaultValue="description" className="space-y-4">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="programme">Programme</TabsTrigger>
              <TabsTrigger value="instructor">Formateur</TabsTrigger>
              <TabsTrigger value="reviews">Avis</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">À propos de cette formation</h3>
                    <p className="text-muted-foreground">{formation.description}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Objectifs pédagogiques</h3>
                    <ul className="space-y-2">
                      {formation.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Prérequis</h3>
                    <ul className="space-y-1">
                      {formation.prerequisites.map((pre, i) => (
                        <li key={i} className="text-muted-foreground">• {pre}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="programme">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Programme de la formation</h3>
                      <p className="text-sm text-muted-foreground">
                        {formation.modules.length} modules • {totalLessons} leçons • {formation.duration}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {formation.modules.map((module, index) => (
                      <div key={module.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{module.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {module.lessons} leçons • {module.duration}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructor">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{formation.instructor.name}</h3>
                      <p className="text-muted-foreground">{formation.instructor.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl font-bold">{formation.rating}</div>
                    <div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={cn("w-5 h-5", star <= Math.round(formation.rating) ? "text-amber-500 fill-amber-500" : "text-muted")} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{formation.reviews} avis</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">Les avis seront affichés ici...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-primary/30">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                {formation.isFree ? (
                  <div>
                    <Badge className="bg-secondary/10 text-secondary text-lg px-4 py-1">Gratuit</Badge>
                    {formation.isMemberOnly && (
                      <p className="text-sm text-muted-foreground mt-2">Réservé aux membres CPU-PME</p>
                    )}
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-primary">{formation.price?.toLocaleString()} FCFA</p>
                )}
              </div>
              <Button onClick={() => setShowEnrollDialog(true)} className="w-full gap-2" size="lg">
                <Play className="w-5 h-5" />
                S'inscrire maintenant
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Durée
                </span>
                <span className="font-medium">{formation.duration}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Modules
                </span>
                <span className="font-medium">{formation.modules.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Inscrits
                </span>
                <span className="font-medium">{formation.enrolled}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Certificat
                </span>
                <span className="font-medium">{formation.hasCertificate ? "Oui" : "Non"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-3">Ce que vous obtiendrez</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  Accès illimité au contenu
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  Ressources téléchargeables
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  Quiz et évaluations
                </li>
                {formation.hasCertificate && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                    Certificat de réussite
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>S'inscrire à la formation</DialogTitle>
            <DialogDescription>{formation.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!formation.isFree && (
              <>
                <div className="space-y-2">
                  <Label>Mode de paiement</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Paiement personnel</SelectItem>
                      <SelectItem value="company">Paiement entreprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-bold text-primary">{formation.price?.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </>
            )}
            {formation.isFree && (
              <div className="p-4 rounded-lg bg-secondary/10 text-center">
                <Badge className="bg-secondary/20 text-secondary">Formation gratuite</Badge>
                <p className="text-sm text-muted-foreground mt-2">Accessible aux membres CPU-PME</p>
              </div>
            )}
            <Button className="w-full gap-2" onClick={handleEnroll}>
              {formation.isFree ? (
                <>
                  <Play className="w-4 h-4" />
                  Commencer la formation
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Payer et s'inscrire
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
