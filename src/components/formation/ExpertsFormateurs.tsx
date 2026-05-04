import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  BookOpen, Users, Search, MessageCircle, Award,
  Globe, AlertCircle, GraduationCap,
  ChevronLeft, ChevronRight, Mail, Phone, MapPin,
  Calendar, Clock, Play, Video, Upload, CheckCircle, ImageIcon,
} from "lucide-react";
import { formateursApi, FormateurAvecFormations } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function FormateurCardSkeleton() {
  return (
    <Card className="rounded-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Skeleton className="w-14 h-14 rounded-sm flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded-sm" />
          <Skeleton className="h-5 w-20 rounded-sm" />
        </div>
        <Skeleton className="h-8 w-full rounded-sm" />
      </CardContent>
    </Card>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const modeLabels: Record<string, { label: string; icon: typeof Play; color: string }> = {
  a_son_rythme: { label: "À son rythme", icon: Play,     color: "bg-blue-50 text-blue-700 border-blue-200" },
  presentiel:   { label: "Présentiel",   icon: MapPin,   color: "bg-green-50 text-green-700 border-green-200" },
  webinaire:    { label: "Webinaire",    icon: Video,    color: "bg-violet-50 text-violet-700 border-violet-200" },
  live:         { label: "Live",         icon: Calendar, color: "bg-red-50 text-red-700 border-red-200" },
};

const niveauLabels: Record<string, string> = {
  beginner:     "Débutant",
  intermediate: "Intermédiaire",
  advanced:     "Avancé",
};

function LinkedInIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

// ── Drawer contenu ────────────────────────────────────────────────────────────

function FormateurDrawer({
  formateur,
  open,
  onClose,
}: {
  formateur: FormateurAvecFormations | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!formateur) return null;

  const fullName = `${formateur.firstname} ${formateur.lastname}`;
  const totalStudents = formateur.formations.reduce((acc, fo) => acc + (fo.participants?.length ?? 0), 0);
  const activeFormations = formateur.formations.filter((fo) => fo.isActive);
  const domains = [...new Set(formateur.formations.map((fo) => fo.category))].filter(Boolean);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        {/* En-tête profil */}
        <div className="bg-gradient-to-br from-primary/15 to-secondary/10 p-6">
          <SheetHeader className="mb-4">
            <SheetTitle className="sr-only">{fullName}</SheetTitle>
          </SheetHeader>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-sm bg-white flex items-center justify-center overflow-hidden flex-shrink-0 border border-border shadow-sm">
              {formateur.photo ? (
                <img src={formateur.photo} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <GraduationCap className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg leading-tight">{fullName}</h2>
              {formateur.titre && (
                <p className="text-sm text-muted-foreground mt-0.5">{formateur.titre}</p>
              )}
              {/* Liens sociaux */}
              <div className="flex items-center gap-2 mt-2">
                {formateur.linkedin && (
                  <a href={formateur.linkedin} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700">
                    <LinkedInIcon />
                  </a>
                )}
                {formateur.website && (
                  <a href={formateur.website} target="_blank" rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/60 rounded-sm p-2.5 text-center">
              <p className="font-bold text-lg">{formateur.formations.length}</p>
              <p className="text-[11px] text-muted-foreground">Formations</p>
            </div>
            <div className="bg-white/60 rounded-sm p-2.5 text-center">
              <p className="font-bold text-lg">{activeFormations.length}</p>
              <p className="text-[11px] text-muted-foreground">Actives</p>
            </div>
            <div className="bg-white/60 rounded-sm p-2.5 text-center">
              <p className="font-bold text-lg">{totalStudents}</p>
              <p className="text-[11px] text-muted-foreground">Apprenants</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Bio */}
          {formateur.bio && (
            <div>
              <h3 className="font-semibold text-sm mb-1.5">À propos</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{formateur.bio}</p>
            </div>
          )}

          {/* Coordonnées */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Contact</h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{formateur.email}</span>
              </div>
              {formateur.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formateur.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Domaines */}
          {domains.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Domaines d'expertise</h3>
              <div className="flex flex-wrap gap-1.5">
                {domains.map((d) => (
                  <Badge key={d} variant="secondary" className="rounded-sm text-xs">{d}</Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Formations */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Formations ({formateur.formations.length})
            </h3>
            {formateur.formations.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Aucune formation associée.</p>
            ) : (
              <div className="space-y-3">
                {formateur.formations.map((fo) => {
                  const mode = modeLabels[fo.mode] ?? { label: fo.mode, icon: Play, color: "bg-muted text-muted-foreground" };
                  const ModeIcon = mode.icon;
                  const isFree = !fo.isPaid || !fo.price || parseFloat(fo.price) === 0;
                  const price = fo.price ? parseFloat(fo.price) : 0;
                  const priceMember = fo.price_member ? parseFloat(fo.price_member) : 0;

                  return (
                    <div key={fo.id} className={cn(
                      "rounded-sm border overflow-hidden",
                      !fo.isActive && "opacity-60"
                    )}>
                      {/* Image ou gradient */}
                      {fo.image ? (
                        <div className="h-24 overflow-hidden">
                          <img src={fo.image} alt={fo.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-16 bg-gradient-to-r from-primary/20 to-secondary/15 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-primary/30" />
                        </div>
                      )}

                      <div className="p-3 space-y-2">
                        {/* Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5 border", mode.color)}>
                            <ModeIcon className="w-2.5 h-2.5 mr-1" />
                            {mode.label}
                          </Badge>
                          {fo.niveau && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                              {niveauLabels[fo.niveau] ?? fo.niveau}
                            </Badge>
                          )}
                          {!fo.isActive && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-muted-foreground">
                              Inactif
                            </Badge>
                          )}
                        </div>

                        {/* Titre */}
                        <p className="font-medium text-sm line-clamp-2 leading-snug">{fo.title}</p>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground line-clamp-2">{fo.description}</p>

                        {/* Meta */}
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                          {fo.duration > 0 && (
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fo.duration}h</span>
                          )}
                          {fo.location && (
                            <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 flex-shrink-0" />{fo.location}</span>
                          )}
                          {fo.date && (
                            <span className="flex items-center gap-1 flex-shrink-0">
                              <Calendar className="w-3 h-3" />
                              {new Date(fo.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>

                        {/* Prix */}
                        <div className="flex items-center justify-between pt-1 border-t">
                          {isFree ? (
                            <span className="text-xs font-semibold text-emerald-600">Gratuit</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-primary">{price.toLocaleString()} FCFA</span>
                              {priceMember > 0 && (
                                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                                  Membre : {priceMember.toLocaleString()} FCFA
                                </span>
                              )}
                            </div>
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            {fo.participants?.length ?? 0} inscrit{(fo.participants?.length ?? 0) > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bouton contacter */}
          <Button className="w-full gap-2 rounded-sm" variant="outline">
            <MessageCircle className="w-4 h-4" />
            Contacter {formateur.firstname}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

const FORM_INIT = {
  firstname: "", lastname: "", email: "", phone: "",
  titre: "", bio: "", linkedin: "", website: "",
  photo: null as File | null,
};

export function ExpertsFormateurs() {
  const { user } = useAuth();
  const [formateurs, setFormateurs] = useState<FormateurAvecFormations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFormateur, setSelectedFormateur] = useState<FormateurAvecFormations | null>(null);
  const ITEMS_PER_PAGE = 12;

  // Dialog "Devenir formateur"
  const [devenirOpen, setDevenirOpen] = useState(false);
  const [devenirForm, setDevenirForm] = useState({ ...FORM_INIT });
  const [devenirSubmitting, setDevenirSubmitting] = useState(false);
  const [devenirError, setDevenirError] = useState<string | null>(null);
  const [devenirSuccess, setDevenirSuccess] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const setDF = (key: string, value: unknown) =>
    setDevenirForm((p) => ({ ...p, [key]: value }));

  const openDevenir = () => {
    setDevenirForm({ ...FORM_INIT, email: user?.email ?? "" });
    setDevenirError(null);
    setDevenirSuccess(false);
    setDevenirOpen(true);
  };

  const handleDevenirSubmit = async () => {
    setDevenirSubmitting(true);
    setDevenirError(null);
    try {
      await formateursApi.create({
        firstname: devenirForm.firstname,
        lastname:  devenirForm.lastname,
        email:     devenirForm.email   || undefined,
        phone:     devenirForm.phone   || undefined,
        titre:     devenirForm.titre   || undefined,
        bio:       devenirForm.bio     || undefined,
        linkedin:  devenirForm.linkedin,
        website:   devenirForm.website,
        photo:     devenirForm.photo,
      });
      setDevenirSuccess(true);
    } catch (e: unknown) {
      setDevenirError(e instanceof Error ? e.message : "Erreur lors de la création");
    } finally {
      setDevenirSubmitting(false);
    }
  };

  const fetchFormateurs = () => {
    setLoading(true);
    setError(null);
    formateursApi.getAll()
      .then(setFormateurs)
      .catch(() => setError("Impossible de charger les formateurs."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFormateurs(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedDomain]);

  const allDomains = [...new Set(
    formateurs.flatMap((f) => f.formations.map((fo) => fo.category))
  )].filter(Boolean).sort();

  const filtered = formateurs.filter((f) => {
    const fullName = `${f.firstname} ${f.lastname}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      (f.titre ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.formations.some((fo) => fo.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDomain =
      selectedDomain === "all" ||
      f.formations.some((fo) => fo.category === selectedDomain);
    return matchesSearch && matchesDomain;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none bg-gradient-to-r from-primary/10 to-secondary/10 rounded-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-sm bg-primary/20">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Experts & Formateurs</h2>
                <p className="text-sm text-muted-foreground">
                  {loading ? "Chargement…" : `${formateurs.length} formateur${formateurs.length > 1 ? "s" : ""} disponible${formateurs.length > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <div className="sm:ml-auto">
              <Button variant="outline" size="sm" className="gap-2 rounded-sm" onClick={openDevenir}>
                <Award className="w-4 h-4" />
                Devenir formateur
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="rounded-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un formateur ou une formation..."
                className="pl-8 h-9 text-sm rounded-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-[180px] h-9 text-sm rounded-sm flex-shrink-0">
                <SelectValue placeholder="Domaine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les domaines</SelectItem>
                {allDomains.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Chargement */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <FormateurCardSkeleton key={i} />)}
        </div>
      )}

      {/* Erreur */}
      {!loading && error && (
        <Card className="rounded-sm">
          <CardContent className="py-14 text-center space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-destructive/50" />
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="rounded-sm" onClick={fetchFormateurs}>Réessayer</Button>
          </CardContent>
        </Card>
      )}

      {/* Grille */}
      {!loading && !error && (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
            <span>{filtered.length} formateur{filtered.length > 1 ? "s" : ""}</span>
            {totalPages > 1 && <span>Page {currentPage} / {totalPages}</span>}
          </div>

          {filtered.length === 0 ? (
            <Card className="rounded-sm">
              <CardContent className="py-14 text-center">
                <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="font-medium">Aucun formateur trouvé</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((formateur) => {
                const fullName = `${formateur.firstname} ${formateur.lastname}`;
                const totalStudents = formateur.formations.reduce(
                  (acc, fo) => acc + (fo.participants?.length ?? 0), 0
                );
                const domains = [...new Set(formateur.formations.map((fo) => fo.category))].filter(Boolean);
                const activeFormations = formateur.formations.filter((fo) => fo.isActive);

                return (
                  <Card key={formateur.id} className="rounded-sm overflow-hidden hover:shadow-md transition-all group">
                    <CardContent className="p-4 space-y-3">
                      {/* Avatar + identité */}
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-sm bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border border-border">
                          {formateur.photo ? (
                            <img src={formateur.photo} alt={fullName} className="w-full h-full object-cover" />
                          ) : (
                            <GraduationCap className="w-7 h-7 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                            {fullName}
                          </h3>
                          {formateur.titre && (
                            <p className="text-xs text-muted-foreground truncate">{formateur.titre}</p>
                          )}
                          {formateur.phone && (
                            <p className="text-xs text-muted-foreground mt-0.5">{formateur.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {formateur.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {formateur.bio}
                        </p>
                      )}

                      {/* Domaines */}
                      {domains.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {domains.slice(0, 3).map((d) => (
                            <Badge key={d} variant="secondary" className="text-[10px] rounded-sm px-1.5 py-0">{d}</Badge>
                          ))}
                          {domains.length > 3 && (
                            <Badge variant="outline" className="text-[10px] rounded-sm px-1.5 py-0">+{domains.length - 3}</Badge>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-2.5">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {activeFormations.length} cours
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {totalStudents} apprenants
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {formateur.linkedin && (
                          <a href={formateur.linkedin} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700" title="LinkedIn">
                            <LinkedInIcon />
                          </a>
                        )}
                        {formateur.website && (
                          <a href={formateur.website} target="_blank" rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground" title="Site web">
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                        <Button variant="outline" size="sm" className="flex-1 gap-1 h-7 text-xs rounded-sm">
                          <MessageCircle className="w-3.5 h-3.5" />
                          Contacter
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-xs rounded-sm"
                          onClick={() => setSelectedFormateur(formateur)}
                        >
                          Détails
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="w-4 h-4" />Précédent
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button key={page} variant={page === currentPage ? "default" : "outline"}
                    size="sm" className="w-9 h-9 p-0 rounded-sm" onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 rounded-sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                Suivant<ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Drawer détails */}
      <FormateurDrawer
        formateur={selectedFormateur}
        open={!!selectedFormateur}
        onClose={() => setSelectedFormateur(null)}
      />

      {/* Dialog Devenir formateur */}
      <Dialog open={devenirOpen} onOpenChange={setDevenirOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Devenir formateur
            </DialogTitle>
          </DialogHeader>

          {devenirSuccess ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle className="w-14 h-14 mx-auto text-green-500" />
              <p className="font-semibold text-lg">Profil créé avec succès !</p>
              <p className="text-sm text-muted-foreground">Votre profil formateur est maintenant disponible.</p>
              <Button onClick={() => { setDevenirOpen(false); fetchFormateurs(); }} className="rounded-sm">
                Fermer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Photo */}
              <div className="space-y-2">
                <Label>Photo de profil</Label>
                <div
                  className="border-2 border-dashed rounded-sm p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => photoInputRef.current?.click()}
                >
                  {devenirForm.photo ? (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <span className="font-medium">{devenirForm.photo.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-7 h-7 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Cliquer pour choisir une photo</p>
                    </div>
                  )}
                </div>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => setDF("photo", e.target.files?.[0] ?? null)} />
              </div>

              {/* Nom / Prénom */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Prénom <span className="text-destructive">*</span></Label>
                  <Input value={devenirForm.firstname} onChange={(e) => setDF("firstname", e.target.value)} placeholder="Prénom" />
                </div>
                <div className="space-y-2">
                  <Label>Nom <span className="text-destructive">*</span></Label>
                  <Input value={devenirForm.lastname} onChange={(e) => setDF("lastname", e.target.value)} placeholder="Nom" />
                </div>
              </div>

              {/* Email / Téléphone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={devenirForm.email} onChange={(e) => setDF("email", e.target.value)} placeholder="email@exemple.com" />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={devenirForm.phone} onChange={(e) => setDF("phone", e.target.value)} placeholder="07 XX XX XX XX" />
                </div>
              </div>

              {/* Titre */}
              <div className="space-y-2">
                <Label>Titre / Spécialité</Label>
                <Input value={devenirForm.titre} onChange={(e) => setDF("titre", e.target.value)} placeholder="Ex: Expert Finance PME" />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label>Biographie</Label>
                <Textarea value={devenirForm.bio} onChange={(e) => setDF("bio", e.target.value)}
                  placeholder="Décrivez votre expertise et votre parcours..." rows={3} />
              </div>

              {/* Liens */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input value={devenirForm.linkedin} onChange={(e) => setDF("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="space-y-2">
                  <Label>Site web</Label>
                  <Input value={devenirForm.website} onChange={(e) => setDF("website", e.target.value)} placeholder="https://monsite.com" />
                </div>
              </div>

              {devenirError && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-sm text-sm">{devenirError}</div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" className="rounded-sm" onClick={() => setDevenirOpen(false)} disabled={devenirSubmitting}>
                  Annuler
                </Button>
                <Button className="rounded-sm gap-2" onClick={handleDevenirSubmit}
                  disabled={devenirSubmitting || !devenirForm.firstname || !devenirForm.lastname}>
                  {devenirSubmitting ? <span className="animate-spin">⏳</span> : <Award className="w-4 h-4" />}
                  {devenirSubmitting ? "Envoi en cours..." : "Créer mon profil"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
