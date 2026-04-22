import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, BookOpen, Clock, Users, Award, Play, Video, Calendar,
  User, CheckCircle2, Share2, Heart, CreditCard, MapPin, Layers, Globe, ExternalLink,
  FileText, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formationsApi, FormationAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface FormationDetailProps {
  formationId: string;
  onBack: () => void;
  onStartLearning?: (formationId: string) => void;
}

function getLevelLabel(niveau: string | null) {
  if (niveau === "intermediate") return { label: "Intermédiaire", color: "bg-blue-500/10 text-blue-600" };
  if (niveau === "advanced") return { label: "Avancé", color: "bg-red-500/10 text-red-600" };
  return { label: "Débutant", color: "bg-green-500/10 text-green-600" };
}

function getModeLabel(mode: string) {
  if (mode === "a_son_rythme") return { label: "À son rythme", Icon: Video };
  if (mode === "presentiel") return { label: "Présentiel", Icon: MapPin };
  if (mode === "webinaire") return { label: "Webinaire", Icon: Calendar };
  return { label: "Live", Icon: Calendar };
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-sm" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-2/3" />
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="aspect-video rounded-sm" />
          <Skeleton className="h-40 rounded-sm" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-sm" />
          <Skeleton className="h-48 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export function FormationDetail({ formationId, onBack, onStartLearning }: FormationDetailProps) {
  const { user } = useAuth();
  const [formation, setFormation] = useState<FormationAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    formationsApi.getById(formationId)
      .then(setFormation)
      .catch(() => setError("Impossible de charger les détails de la formation."))
      .finally(() => setLoading(false));
  }, [formationId]);

  const handleEnroll = () => {
    toast.success("Inscription réussie ! Vous pouvez commencer la formation.");
    setShowEnrollDialog(false);
    if (onStartLearning) onStartLearning(formationId);
  };

  if (loading) return <DetailSkeleton />;

  if (error || !formation) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">{error ?? "Formation introuvable."}</p>
        <Button variant="outline" onClick={onBack}>Retour</Button>
      </div>
    );
  }

  const isFree = !formation.isPaid || !formation.price || parseFloat(formation.price) === 0;
  const pricePublic = formation.price ? parseFloat(formation.price) : 0;
  const priceMember = formation.price_member ? parseFloat(formation.price_member) : 0;
  const price = user && priceMember > 0 ? priceMember : pricePublic;
  const levelInfo = getLevelLabel(formation.niveau);
  const modeInfo = getModeLabel(formation.mode);
  const totalLecons = formation.chapitres.reduce((acc, c) => acc + c.lecons.length, 0);
  const instructorName = `${formation.formateur.firstname} ${formation.formateur.lastname}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge className={levelInfo.color}>{levelInfo.label}</Badge>
            <Badge variant="outline" className="gap-1">
              <modeInfo.Icon className="w-3 h-3" />
              {modeInfo.label}
            </Badge>
            {formation.certification_delivrer_badge && (
              <Badge variant="outline" className="gap-1">
                <Award className="w-3 h-3" />
                Certifiant
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{formation.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{formation.category}</p>
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
          {/* Banner : vidéo > image > placeholder */}
          {formation.fichier?.endsWith(".mp4") ? (
            <video
              src={formation.fichier}
              controls
              className="w-full aspect-video rounded-sm bg-black"
              poster={formation.image ?? undefined}
            />
          ) : formation.image ? (
            <img src={formation.image} alt={formation.title} className="w-full aspect-video object-cover rounded-sm" />
          ) : (
            <div className="aspect-video rounded-sm bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
              <Play className="w-16 h-16 text-primary/50" />
            </div>
          )}

          <Tabs defaultValue="description" className="space-y-4">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="programme">Programme</TabsTrigger>
              <TabsTrigger value="instructor">Formateur</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">À propos de cette formation</h3>
                    <p className="text-muted-foreground">{formation.description}</p>
                  </div>
                  {formation.competences.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-3">Compétences acquises</h3>
                        <ul className="space-y-2">
                          {formation.competences.map((comp, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{comp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  {formation.location && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{formation.location}</span>
                      </div>
                    </>
                  )}
                  {formation.date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(formation.date).toLocaleDateString("fr-FR", { dateStyle: "long" })}</span>
                    </div>
                  )}
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
                        {formation.chapitres.length} chapitre{formation.chapitres.length > 1 ? "s" : ""} • {totalLecons} leçon{totalLecons > 1 ? "s" : ""}
                        {formation.duration > 0 && ` • ${formation.duration}h`}
                      </p>
                    </div>
                  </div>
                  {formation.chapitres.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Le programme n'est pas encore disponible.</p>
                  ) : (
                    <div className="space-y-3">
                      {formation.chapitres.map((chapitre, index) => (
                        <div key={chapitre.id} className="rounded-sm border bg-card overflow-hidden">
                          <div className="flex items-center gap-3 p-4 bg-muted/30">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{chapitre.titre}</p>
                              <p className="text-sm text-muted-foreground">
                                {chapitre.lecons.length} leçon{chapitre.lecons.length > 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          {chapitre.lecons.length > 0 && (
                            <ul className="divide-y">
                              {chapitre.lecons.map((lecon) => {
                                const isPdf = lecon.type_contenu === "pdf";
                                const isVideo = lecon.type_contenu === "video";
                                const hasContent = lecon.contenu && !lecon.contenu.includes("contenu-en-attente");
                                return (
                                  <li key={lecon.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                                    {isPdf ? (
                                      <FileText className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                    ) : (
                                      <Play className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                    )}
                                    <span className="text-muted-foreground flex-1">{lecon.titre}</span>
                                    <div className="flex items-center gap-2 ml-auto">
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {isVideo ? "vidéo" : lecon.type_contenu}
                                      </Badge>
                                      {isPdf && hasContent && (
                                        <a
                                          href={lecon.contenu}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                          <Download className="w-3 h-3" />
                                          PDF
                                        </a>
                                      )}
                                      {isVideo && hasContent && (
                                        <a
                                          href={lecon.contenu}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          Voir
                                        </a>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructor">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    {formation.formateur.photo ? (
                      <img src={formation.formateur.photo} alt={instructorName} className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{instructorName}</h3>
                      {formation.formateur.titre && (
                        <p className="text-muted-foreground">{formation.formateur.titre}</p>
                      )}
                    </div>
                  </div>
                  {formation.formateur.bio && (
                    <p className="text-muted-foreground text-sm">{formation.formateur.bio}</p>
                  )}
                  {(formation.formateur.linkedin || formation.formateur.website) && (
                    <div className="flex items-center gap-3 pt-2">
                      {formation.formateur.linkedin && (
                        <a
                          href={formation.formateur.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          LinkedIn
                        </a>
                      )}
                      {formation.formateur.website && (
                        <a
                          href={formation.formateur.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="w-4 h-4" />
                          Site web
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}
                    </div>
                  )}
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
                {isFree ? (
                  <Badge className="bg-secondary/10 text-secondary text-lg px-4 py-1">Gratuit</Badge>
                ) : (
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-primary">{price.toLocaleString()} FCFA</p>
                    {user && priceMember > 0 && (
                      <p className="text-xs text-muted-foreground line-through">{pricePublic.toLocaleString()} FCFA</p>
                    )}
                    {user && priceMember > 0 && (
                      <p className="text-xs text-emerald-600 font-medium">Prix membre</p>
                    )}
                    {!user && pricePublic > 0 && (
                      <p className="text-xs text-muted-foreground">Connectez-vous pour le prix membre</p>
                    )}
                  </div>
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
              {formation.duration > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Durée
                    </span>
                    <span className="font-medium">{formation.duration}h</span>
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Chapitres
                </span>
                <span className="font-medium">{formation.chapitres.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Leçons
                </span>
                <span className="font-medium">{totalLecons}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Inscrits
                </span>
                <span className="font-medium">{formation.participants.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Certificat
                </span>
                <span className="font-medium">{formation.certification_delivrer_badge ? "Oui" : "Non"}</span>
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
                {formation.certification_delivrer_badge && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                    {formation.certification_nom_badge ?? "Certificat de réussite"}
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
            {!isFree ? (
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
                <div className="p-4 rounded-sm bg-muted/50">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-bold text-primary">{price.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-sm bg-secondary/10 text-center">
                <Badge className="bg-secondary/20 text-secondary">Formation gratuite</Badge>
                <p className="text-sm text-muted-foreground mt-2">Accessible aux membres CPU-PME</p>
              </div>
            )}
            <Button className="w-full gap-2" onClick={handleEnroll}>
              {isFree ? (
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
