import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Grid3X3,
  List,
  ChevronRight,
  Briefcase,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Award,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://back.cpupme.ci";

function getToken(): string | null {
  return localStorage.getItem("cpu-access-token");
}

interface AdhesionMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface Adhesion {
  id: string;
  name: string;
  customOrganisationName: string | null;
  position: string | null;
  email: string;
  phone: string;
  message: string | null;
  logo: string | null;
  website_url: string | null;
  nombre_employee: string | null;
  statut: string;
  created_at: string;
  typeMembre: { name: string } | null;
  profil: { name: string } | null;
  abonnement: { plan: string; libelle: string } | null;
  secteurPrincipal: { name: string } | null;
  filiere: { name: string } | null;
  activites: { name: string }[];
  siegeRegion: { name: string } | null;
  siegeCommune: { name: string } | null;
  siegeVille: string | null;
}

interface AdhesionsResponse {
  success: boolean;
  data: {
    data: Adhesion[];
    meta: AdhesionMeta;
  };
}

async function fetchAdhesions(params: {
  page: number;
  limit: number;
  search?: string;
  statut?: string;
}): Promise<AdhesionsResponse> {
  const token = getToken();
  const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.search) query.set("search", params.search);
  if (params.statut && params.statut !== "all") query.set("statut", params.statut);

  const res = await fetch(`${API_BASE}/api/adhesions/for-site-web?${query}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

const planBanners: Record<string, string> = {
  basic: "bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600",
  silver: "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500",
  gold: "bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400",
  federation: "bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600",
  organisation: "bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600",
  institutionnel: "bg-gradient-to-br from-red-400 via-rose-500 to-red-600",
};

const planPills: Record<string, string> = {
  basic: "border-slate-300 text-slate-600 bg-slate-50",
  silver: "border-gray-300 text-gray-600 bg-gray-50",
  gold: "border-amber-300 text-amber-700 bg-amber-50",
  federation: "border-blue-300 text-blue-700 bg-blue-50",
  organisation: "border-violet-300 text-violet-700 bg-violet-50",
  institutionnel: "border-red-300 text-red-700 bg-red-50",
};

const statutColors: Record<string, string> = {
  approved: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  in_review: "bg-blue-100 text-blue-700 border-blue-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const statutLabels: Record<string, string> = {
  approved: "Approuvé",
  pending: "En attente",
  in_review: "En révision",
  rejected: "Rejeté",
};

function displayName(member: Adhesion): string {
  return member.customOrganisationName || member.name;
}

export default function Annuaire() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState<Adhesion | null>(null);
  const LIMIT = 12;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["annuaire-membres", page, search],
    queryFn: () => fetchAdhesions({ page, limit: LIMIT, search: search || undefined, statut: "approved" }),
    staleTime: 30_000,
  });

  const members = data?.data?.data ?? [];
  const meta = data?.data?.meta;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Annuaire des Membres
            </h1>
            <p className="text-muted-foreground">
              Recherchez et connectez-vous avec les membres CPU-PME
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{meta?.total ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">Membres au total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {meta ? Math.ceil(meta.total / LIMIT) : "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">Pages de résultats</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Briefcase className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(members.map((m) => m.secteurPrincipal?.name).filter(Boolean)).size || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">Secteurs (page courante)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, email, téléphone..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
<div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} membre(s) trouvé(s) — page ${meta.page}/${meta.totalPages}` : "Chargement..."}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <Card className="border-destructive/50">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="font-semibold text-lg">Erreur de chargement</h3>
              <p className="text-muted-foreground mt-2">
                Impossible de récupérer les membres. Vérifiez votre connexion.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Grid view */}
        {!isLoading && !isError && viewMode === "grid" && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="group relative rounded-sm border border-border/60 bg-card overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-primary/10 hover:-translate-y-0.5 hover:border-primary/30"
                onClick={() => setSelectedMember(member)}
              >
                {/* Bandeau coloré en haut */}
                <div className={`h-20 w-full ${planBanners[member.abonnement?.plan ?? ""] ?? "bg-gradient-to-r from-slate-400 to-slate-500"}`} />

                {/* Avatar en overlap */}
                <div className="px-5 pb-5">
                  <div className="flex items-end justify-between -mt-8 mb-3">
                    <Avatar className="h-16 w-16 ring-4 ring-card shadow-md">
                      <AvatarImage src={member.logo || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                        {displayName(member).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1.5 mb-1">
                      {member.abonnement && (
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${planPills[member.abonnement.plan] ?? "border-border text-muted-foreground"}`}>
                          {member.abonnement.plan.charAt(0).toUpperCase() + member.abonnement.plan.slice(1)}
                        </span>
                      )}
                      <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statutColors[member.statut] ?? "border-border"}`}>
                        {statutLabels[member.statut] ?? member.statut}
                      </span>
                    </div>
                  </div>

                  {/* Nom & poste */}
                  <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors truncate">
                    {displayName(member)}
                  </h3>
                  {member.position && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{member.position}</p>
                  )}

                  {/* Secteur */}
                  {member.secteurPrincipal && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-muted-foreground truncate">
                        {member.secteurPrincipal.name}
                        {member.filiere ? ` · ${member.filiere.name}` : ""}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  {member.message && (
                    <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {member.message}
                    </p>
                  )}

                  {/* Activités */}
                  {member.activites.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {member.activites.slice(0, 3).map((a) => (
                        <span key={a.name} className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                          {a.name}
                        </span>
                      ))}
                      {member.activites.length > 3 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                          +{member.activites.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer localisation */}
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {[member.siegeCommune?.name, member.siegeVille, member.siegeRegion?.name]
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(", ") || "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {!isLoading && !isError && viewMode === "list" && (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="group flex items-center gap-4 rounded-sm border border-border/60 bg-card px-4 py-3.5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/8 hover:border-primary/30 hover:-translate-y-px"
                onClick={() => setSelectedMember(member)}
              >
                {/* Barre colorée gauche */}
                <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${planBanners[member.abonnement?.plan ?? ""] ?? "bg-slate-400"} hidden`} />

                <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-border">
                  <AvatarImage src={member.logo || undefined} />
                  <AvatarFallback className={`font-bold text-sm text-white ${planBanners[member.abonnement?.plan ?? ""] ?? "bg-slate-400"}`}>
                    {displayName(member).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {displayName(member)}
                    </h3>
                    {member.abonnement && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${planPills[member.abonnement.plan] ?? "border-border text-muted-foreground"}`}>
                        {member.abonnement.plan.charAt(0).toUpperCase() + member.abonnement.plan.slice(1)}
                      </span>
                    )}
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statutColors[member.statut] ?? "border-border"}`}>
                      {statutLabels[member.statut] ?? member.statut}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {[member.secteurPrincipal?.name, member.filiere?.name].filter(Boolean).join(" · ")}
                  </p>
                </div>

                {/* Méta droite */}
                <div className="hidden md:flex items-center gap-5 flex-shrink-0 text-xs text-muted-foreground">
                  {(member.siegeVille || member.siegeRegion) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{member.siegeVille || member.siegeRegion?.name}</span>
                    </div>
                  )}
                  {member.nombre_employee && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{member.nombre_employee}</span>
                    </div>
                  )}
                  <ChevronRight className="h-4 w-4 group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && members.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">Aucun membre trouvé</h3>
              <p className="text-muted-foreground mt-2">
                Essayez de modifier vos critères de recherche
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!meta.hasPreviousPage || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {meta.page} / {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!meta.hasNextPage || isLoading}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Member Detail Modal */}
        {selectedMember && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedMember(null)}
          >
            <div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card shadow-2xl animate-in zoom-in-95 duration-200 border border-border/60"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header coloré */}
              <div className={`relative h-28 rounded-t-2xl ${planBanners[selectedMember.abonnement?.plan ?? ""] ?? "bg-gradient-to-br from-slate-400 to-slate-600"}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-3 right-3 bg-black/20 hover:bg-black/40 text-white rounded-full h-8 w-8"
                >
                  <span className="text-lg leading-none">×</span>
                </Button>
              </div>

              {/* Avatar en overlap */}
              <div className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-10 mb-4">
                  <Avatar className="h-20 w-20 ring-4 ring-card shadow-lg">
                    <AvatarImage src={selectedMember.logo || undefined} />
                    <AvatarFallback className={`font-bold text-2xl text-white ${planBanners[selectedMember.abonnement?.plan ?? ""] ?? "bg-slate-400"}`}>
                      {displayName(selectedMember).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 mb-1">
                    {selectedMember.abonnement && (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${planPills[selectedMember.abonnement.plan] ?? "border-border text-muted-foreground"}`}>
                        {selectedMember.abonnement.libelle || selectedMember.abonnement.plan}
                      </span>
                    )}
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statutColors[selectedMember.statut] ?? "border-border"}`}>
                      {statutLabels[selectedMember.statut] ?? selectedMember.statut}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-bold leading-tight">{displayName(selectedMember)}</h2>
                {selectedMember.position && (
                  <p className="text-sm text-muted-foreground mt-0.5">{selectedMember.position}</p>
                )}
                {(selectedMember.typeMembre || selectedMember.profil) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {[selectedMember.typeMembre?.name, selectedMember.profil?.name].filter(Boolean).join(" · ")}
                  </p>
                )}

                <div className="mt-6 space-y-5">
                  {selectedMember.message && (
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedMember.message}</p>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Coordonnées */}
                    <div className="rounded-xl border border-border/60 p-4 space-y-2.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coordonnées</h4>
                      {(selectedMember.siegeVille || selectedMember.siegeCommune || selectedMember.siegeRegion) && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span>
                            {[selectedMember.siegeCommune?.name, selectedMember.siegeVille, selectedMember.siegeRegion?.name]
                              .filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{selectedMember.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="break-all">{selectedMember.email}</span>
                      </div>
                      {selectedMember.website_url && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="break-all">{selectedMember.website_url}</span>
                        </div>
                      )}
                    </div>

                    {/* Infos entreprise */}
                    <div className="rounded-xl border border-border/60 p-4 space-y-2.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informations</h4>
                      {selectedMember.nombre_employee && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedMember.nombre_employee} employé(s)</span>
                        </div>
                      )}
                      {selectedMember.secteurPrincipal && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedMember.secteurPrincipal.name}</span>
                        </div>
                      )}
                      {selectedMember.filiere && (
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedMember.filiere.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedMember.activites.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Activités</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.activites.map((a) => (
                          <span key={a.name} className="text-xs px-3 py-1 rounded-lg bg-muted border border-border/60 text-muted-foreground">
                            {a.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button className="flex-1 rounded-xl" asChild>
                      <a href={`mailto:${selectedMember.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Envoyer un email
                      </a>
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-xl" asChild>
                      <a href={`tel:${selectedMember.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Appeler
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
