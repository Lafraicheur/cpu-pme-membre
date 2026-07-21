import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  Search, Download, Users, Loader2, AlertCircle,
  MoreHorizontal, Eye, Edit, Trash2, RefreshCw,
  Mail, Phone, MapPin, Building2, Briefcase, Globe, Calendar, Hash, Tag,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  adhesionsApi, AdhesionMembre, AdhesionDetail,
  secteursApi, regionsApi, villesApi,
  Secteur, Region, Commune, Ville,
} from "@/lib/api";

// ── Config ──────────────────────────────────────────────────────────────────
const statutConfig: Record<string, { label: string; className: string }> = {
  approved:  { label: "Approuvé",    className: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100" },
  pending:   { label: "En attente",  className: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100" },
  in_review: { label: "En révision", className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100" },
  completed: { label: "Complété",    className: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100" },
  rejected:  { label: "Rejeté",      className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100" },
  suspended: { label: "Suspendu",    className: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100" },
  inactive:  { label: "Inactif",     className: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100" },
};

type StatutValue = "pending" | "in_review" | "approved" | "rejected" | "completed" | "suspended" | "inactive";

const statutOptions: { value: StatutValue; label: string; dot: string }[] = [
  { value: "approved",  label: "Activer",       dot: "bg-green-500"  },
  { value: "rejected",  label: "Refuser",        dot: "bg-red-500"    },
  { value: "suspended", label: "Suspendre",      dot: "bg-orange-500" },
  { value: "inactive",  label: "Rendre inactif", dot: "bg-gray-400"   },
];

const scopeLabels: Record<string, string> = {
  national:            "National",
  regions_specifiques: "Régions spécifiques",
  international:       "International",
};

const orgTypeLabels: Record<string, string> = {
  federation:  "Fédération",
  association: "Association",
  cooperative: "Coopérative",
  gie:         "GIE",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function calculateCompletionScore(m: AdhesionMembre): number {
  const fields = [
    m.name,
    m.email,
    m.phone,
    m.customOrganisationName,
    m.position,
    m.typeMembre?.name,
    m.profil?.name,
    m.abonnement?.libelle,
    m.secteurPrincipal?.name,
    m.filiere?.name,
    m.siegeRegion?.name,
    m.website_url,
    m.nombre_employee,
    m.activites?.length ? m.activites.map((a) => a.name + (a.sousFiliere ? ` (${a.sousFiliere.name})` : "")).join(", ") : null,
  ];
  const filled = fields.filter((f) => f && f !== "").length;
  return Math.round((filled / fields.length) * 100);
}

function ComplianceBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-100 text-green-700 border-green-200"
    : score >= 50 ? "bg-yellow-100 text-yellow-700 border-yellow-200"
    : "bg-red-100 text-red-700 border-red-200";
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${color}`}>{score}%</span>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FormField({ id, label, children }: { id?: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

// ── État initial formulaire ───────────────────────────────────────────────────
const EMPTY_FORM = {
  // Entreprise
  customOrganisationName: "",
  email: "",
  phone: "",
  message: "",
  website_url: "",
  nombre_employee: "",
  // Représentant
  name: "",
  position: "",
  // Localisation
  siegeRegionId: "",
  siegeCommuneId: "",
  siegeVille: "",
  siegeVillage: "",
  interventionScope: "",
};

// ── Composant ─────────────────────────────────────────────────────────────────
export default function Membres() {
  const { user } = useAuth();

  const [membres, setMembres]       = useState<AdhesionMembre[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [searchQuery, setSearch]    = useState("");
  const [statutFilter, setStatut]   = useState("all");
  const [secteurFilter, setSecteur] = useState("all");
  const [regionFilter, setRegion]   = useState("all");

  // Détails
  const [detailOpen, setDetailOpen]       = useState(false);
  const [detail, setDetail]               = useState<AdhesionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError]     = useState<string | null>(null);

  // Changement de statut
  const [statutTarget, setstatutTarget]   = useState<AdhesionMembre | null>(null);
  const [newStatut, setNewStatut]         = useState<StatutValue>("pending");
  const [statutNotes, setStatutNotes]     = useState("");
  const [isChangingStatut, setIsChangingStatut] = useState(false);

  // Suppression
  const [deleteTarget, setDeleteTarget] = useState<AdhesionMembre | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  // Modification
  const [editOpen, setEditOpen]         = useState(false);
  const [editTarget, setEditTarget]     = useState<AdhesionMembre | null>(null);
  const [editLoading, setEditLoading]   = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [editForm, setEditForm]         = useState(EMPTY_FORM);
  const [logoFile, setLogoFile]         = useState<File | null>(null);
  const [logoPreview, setLogoPreview]   = useState<string | null>(null);
  const fileInputRef                    = useRef<HTMLInputElement>(null);

  // Données de référence
  const [secteurs, setSecteurs]         = useState<Secteur[]>([]);
  const [regions, setRegions]           = useState<Region[]>([]);
  const [allVilles, setAllVilles]       = useState<Ville[]>([]);
  const [communes, setCommunes]         = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  // ── Chargement membres ───────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!user?.organisationName) { setIsLoading(false); return; }
      try {
        setIsLoading(true); setError(null);
        let all: AdhesionMembre[] = [], page = 1, hasMore = true;
        while (hasMore) {
          const res = await adhesionsApi.getForSiteWeb({ page, limit: 100 });
          all = [...all, ...res.data];
          hasMore = res.meta.hasNextPage;
          page++;
        }
        setMembres(all.filter((m) => m.hasAffiliation && m.organisationName === user.organisationName));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      } finally { setIsLoading(false); }
    };
    load();
  }, [user?.organisationName]);

  // ── Charger secteurs et régions pour les filtres ────────────────────────
  useEffect(() => {
    secteursApi.getAll()
      .then((data) => setSecteurs(data.sort((a, b) => a.name.localeCompare(b.name, "fr"))))
      .catch(() => {});
    regionsApi.getAll()
      .then((data) => setRegions(data.sort((a, b) => a.name.localeCompare(b.name, "fr"))))
      .catch(() => {});
    villesApi.getAll()
      .then((data) => setAllVilles(data.sort((a, b) => a.name.localeCompare(b.name, "fr"))))
      .catch(() => {});
  }, []);

  // ── Charger communes depuis la ville sélectionnée ────────────────────────
  useEffect(() => {
    if (!editForm.siegeVille) { setCommunes([]); return; }
    setLoadingCommunes(true);
    villesApi.getById(editForm.siegeVille)
      .then((v) => setCommunes((v.communes ?? []).filter((c) => c.isActive) as Commune[]))
      .catch(() => setCommunes([]))
      .finally(() => setLoadingCommunes(false));
  }, [editForm.siegeVille]);

  // ── Voir détails ─────────────────────────────────────────────────────────
  const handleViewDetail = async (id: string) => {
    setDetailOpen(true); setDetail(null); setDetailError(null); setDetailLoading(true);
    try { setDetail(await adhesionsApi.getById(id)); }
    catch (err) { setDetailError(err instanceof Error ? err.message : "Erreur"); }
    finally { setDetailLoading(false); }
  };

  // ── Ouvrir modification ───────────────────────────────────────────────────
  const handleOpenEdit = async (membre: AdhesionMembre) => {
    setEditTarget(membre);
    setLogoFile(null); setLogoPreview(membre.logo ?? null);
    setEditForm(EMPTY_FORM);
    setEditOpen(true);
    setEditLoading(true);

    try {
      const d = await adhesionsApi.getById(membre.id);
      setLogoPreview(d.logo ?? null);

      setEditForm({
        customOrganisationName: d.customOrganisationName ?? "",
        email:                  d.email,
        phone:                  d.phone,
        message:                d.message ?? "",
        website_url:            d.website_url ?? "",
        nombre_employee:        d.nombre_employee ?? "",
        name:                   d.name,
        position:               d.position ?? "",
        siegeRegionId:          d.siegeRegion?.id ?? "",
        siegeCommuneId:         d.siegeCommune?.id ?? "",
        siegeVille:             d.siegeVille ?? "",
        siegeVillage:           d.siegeVillage ?? "",
        interventionScope:      d.interventionScope ?? "",
      });
    } catch {
      setEditForm((f) => ({
        ...f,
        name:                   membre.name,
        email:                  membre.email,
        phone:                  membre.phone,
        customOrganisationName: membre.customOrganisationName ?? "",
        nombre_employee:        membre.nombre_employee ?? "",
        website_url:            membre.website_url ?? "",
        position:               membre.position ?? "",
      }));
    } finally { setEditLoading(false); }
  };

  const set = (key: keyof typeof EMPTY_FORM, value: string) =>
    setEditForm((f) => ({ ...f, [key]: value }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setIsSaving(true);
    try {
      const updated = await adhesionsApi.update(editTarget.id, {
        ...editForm,
        logo: logoFile ?? undefined,
      });
      setMembres((prev) => prev.map((m) => m.id === editTarget.id ? { ...m, ...updated } : m));
      setEditOpen(false); setEditTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la modification");
    } finally { setIsSaving(false); }
  };

  // ── Changer statut ───────────────────────────────────────────────────────
  const handleOpenStatut = (membre: AdhesionMembre) => {
    setstatutTarget(membre);
    const defaultAction: StatutValue =
      membre.statut === "approved" ? "suspended"
      : membre.statut === "suspended" || membre.statut === "inactive" ? "approved"
      : "approved";
    setNewStatut(defaultAction);
    setStatutNotes("");
  };

  const handleChangeStatut = async () => {
    if (!statutTarget) return;
    setIsChangingStatut(true);
    try {
      const updated = await adhesionsApi.changeStatut(
        statutTarget.id, newStatut, statutNotes || undefined
      );
      setMembres((prev) => prev.map((m) => m.id === statutTarget.id ? { ...m, ...updated } : m));
      setstatutTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du changement de statut");
      setstatutTarget(null);
    } finally { setIsChangingStatut(false); }
  };

  // ── Supprimer ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adhesionsApi.delete(deleteTarget.id);
      setMembres((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
      setDeleteTarget(null);
    } finally { setIsDeleting(false); }
  };

  // ── Filtre ───────────────────────────────────────────────────────────────
  const filteredMembres = membres.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      (!q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.phone?.includes(q)) &&
      (statutFilter  === "all" || m.statut === statutFilter) &&
      (secteurFilter === "all" || m.secteurPrincipal?.id === secteurFilter) &&
      (regionFilter  === "all" || m.siegeRegion?.id === regionFilter)
    );
  });


  const stats = {
    total:    membres.length,
    approved: membres.filter((m) => m.statut === "approved").length,
    pending:  membres.filter((m) => m.statut === "pending").length,
    autres:   membres.filter((m) => m.statut !== "approved" && m.statut !== "pending").length,
  };

  // ── Rendu ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Membres affiliés</h1>
            <p className="text-muted-foreground mt-1">
              {user?.organisationName ? `Membres affiliés à ${user.organisationName}` : "Chargement…"}
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Exporter
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total affiliés", value: stats.total,    color: "text-foreground" },
            { label: "Approuvés",      value: stats.approved, color: "text-success" },
            { label: "En attente",     value: stats.pending,  color: "text-warning" },
            { label: "Autres",         value: stats.autres,   color: "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-sm border border-border p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{isLoading ? "…" : s.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-card rounded-sm border border-border p-4">
          <div className="flex flex-col md:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par nom, email, téléphone…" value={searchQuery}
                onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>

            <Select value={secteurFilter} onValueChange={setSecteur}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Secteur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les secteurs</SelectItem>
                {secteurs.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statutFilter} onValueChange={setStatut}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in_review">En révision</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>

            <Select value={regionFilter} onValueChange={setRegion}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(secteurFilter !== "all" || statutFilter !== "all" || regionFilter !== "all" || searchQuery) && (
              <Button variant="ghost" size="sm" className="text-muted-foreground"
                onClick={() => { setSecteur("all"); setStatut("all"); setRegion("all"); setSearch(""); }}>
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Tableau */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-sm border border-destructive/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0" /><p>{error}</p>
          </div>
        ) : filteredMembres.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium">
              {membres.length === 0 ? "Aucun membre affilié trouvé" : "Aucun résultat pour cette recherche"}
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-sm border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membre</TableHead>
                  <TableHead>N° Membre</TableHead>
                  <TableHead>Secteur</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Conformité</TableHead>
                  <TableHead>Date d'adhésion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembres.map((membre) => {
                  const s = statutConfig[membre.statut] ?? { label: membre.statut, className: "bg-muted text-muted-foreground border-border" };
                  return (
                    <TableRow key={membre.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            {membre.logo && <AvatarImage src={membre.logo} alt={membre.name} />}
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                              {getInitials(membre.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{membre.name}</p>
                            <p className="text-xs text-muted-foreground">{membre.position || membre.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-sm font-mono">{membre.numero_membre ?? "—"}</span></TableCell>
                      <TableCell>{membre.secteurPrincipal?.name ?? "—"}</TableCell>
                      <TableCell>{membre.siegeRegion?.name ?? "—"}</TableCell>
                      <TableCell>{membre.typeMembre?.name ?? "—"}</TableCell>
                      <TableCell><Badge variant="outline" className={s.className}>{s.label}</Badge></TableCell>
                      <TableCell><ComplianceBadge score={calculateCompletionScore(membre)} /></TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(membre.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onSelect={() => handleViewDetail(membre.id)}>
                              <Eye className="h-4 w-4" /> Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onSelect={() => handleOpenEdit(membre)}>
                              <Edit className="h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onSelect={() => handleOpenStatut(membre)}>
                              <RefreshCw className="h-4 w-4" /> Changer le statut
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive"
                              onSelect={() => setDeleteTarget(membre)}>
                              <Trash2 className="h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ── Dialog changement de statut ── */}
      <AlertDialog open={!!statutTarget} onOpenChange={(open) => { if (!open) setstatutTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Changer le statut</AlertDialogTitle>
            <AlertDialogDescription>
              Modifier le statut de{" "}
              <span className="font-semibold text-foreground">{statutTarget?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nouveau statut</Label>
              <Select value={newStatut} onValueChange={(v) => setNewStatut(v as StatutValue)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statutOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${opt.dot}`} />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="statut-notes">Notes internes <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
              <Textarea
                id="statut-notes"
                rows={3}
                placeholder="Ajouter une note…"
                value={statutNotes}
                onChange={(e) => setStatutNotes(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingStatut}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangeStatut}
              disabled={isChangingStatut}
            >
              {isChangingStatut && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Dialog suppression ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce membre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de supprimer{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Sheet Modification ── */}
      <Sheet open={editOpen} onOpenChange={(open) => { if (!open) { setEditOpen(false); setEditTarget(null); } }}>
        <SheetContent className="w-full sm:max-w-xl flex flex-col overflow-hidden">
          <SheetHeader className="pb-2 flex-shrink-0">
            <SheetTitle>Modifier le membre</SheetTitle>
            {editTarget && <p className="text-sm text-muted-foreground">{editTarget.name}</p>}
          </SheetHeader>

          {editLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-1">
                <Tabs defaultValue="entreprise" className="mt-1">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="entreprise">Entreprise</TabsTrigger>
                    <TabsTrigger value="representant">Représentant</TabsTrigger>
                    <TabsTrigger value="localisation">Localisation</TabsTrigger>
                  </TabsList>

                  {/* ── Entreprise ── */}
                  <TabsContent value="entreprise" className="space-y-4 pt-4">
                    {/* Logo */}
                    <div className="space-y-1.5">
                      <Label>Logo</Label>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                          {logoPreview && <AvatarImage src={logoPreview} />}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                            {editTarget ? getInitials(editTarget.name) : ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <input ref={fileInputRef} type="file" accept="image/*"
                            className="hidden" onChange={handleLogoChange} />
                          <Button type="button" variant="outline" size="sm"
                            onClick={() => fileInputRef.current?.click()}>
                            Changer le logo
                          </Button>
                          {logoFile && <p className="text-xs text-muted-foreground mt-1">{logoFile.name}</p>}
                        </div>
                      </div>
                    </div>

                    <FormField id="e-org" label="Nom de l'entreprise">
                      <Input id="e-org" value={editForm.customOrganisationName}
                        onChange={(e) => set("customOrganisationName", e.target.value)} />
                    </FormField>

                    <FormField id="e-email" label="Email de l'entreprise">
                      <Input id="e-email" type="email" value={editForm.email}
                        onChange={(e) => set("email", e.target.value)} />
                    </FormField>

                    <FormField id="e-phone" label="Téléphone de l'entreprise">
                      <Input id="e-phone" value={editForm.phone}
                        onChange={(e) => set("phone", e.target.value)} />
                    </FormField>

                    <FormField id="e-msg" label="Description de l'entreprise">
                      <Textarea id="e-msg" rows={4} value={editForm.message}
                        onChange={(e) => set("message", e.target.value)}
                        placeholder="Décrivez l'activité de l'entreprise…" />
                    </FormField>

                    <FormField id="e-web" label="Site Web">
                      <Input id="e-web" type="url" placeholder="https://…" value={editForm.website_url}
                        onChange={(e) => set("website_url", e.target.value)} />
                    </FormField>

                    <FormField id="e-emp" label="Nombre d'employés">
                      <Input id="e-emp" value={editForm.nombre_employee}
                        onChange={(e) => set("nombre_employee", e.target.value)} />
                    </FormField>
                  </TabsContent>

                  {/* ── Représentant ── */}
                  <TabsContent value="representant" className="space-y-4 pt-4">
                    <FormField id="e-name" label="Nom du représentant">
                      <Input id="e-name" value={editForm.name}
                        onChange={(e) => set("name", e.target.value)} />
                    </FormField>

                    <FormField id="e-pos" label="Fonction / Poste">
                      <Input id="e-pos" value={editForm.position}
                        onChange={(e) => set("position", e.target.value)} />
                    </FormField>
                  </TabsContent>

                  {/* ── Localisation ── */}
                  <TabsContent value="localisation" className="space-y-4 pt-4">
                    <FormField label="Région">
                      <Select value={editForm.siegeRegionId}
                        onValueChange={(v) => {
                          set("siegeRegionId", v);
                          set("siegeCommuneId", "");
                          set("siegeVille", "");
                        }}>
                        <SelectTrigger><SelectValue placeholder="Choisir une région" /></SelectTrigger>
                        <SelectContent>
                          {regions.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Ville">
                      <Select value={editForm.siegeVille}
                        onValueChange={(v) => { set("siegeVille", v); set("siegeCommuneId", ""); }}
                        disabled={!editForm.siegeRegionId}>
                        <SelectTrigger>
                          <SelectValue placeholder={editForm.siegeRegionId ? "Choisir une ville" : "Sélectionnez d'abord une région"} />
                        </SelectTrigger>
                        <SelectContent>
                          {allVilles
                            .filter((v) => v.region_id === editForm.siegeRegionId)
                            .map((v) => (
                              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Commune">
                      <Select value={editForm.siegeCommuneId} onValueChange={(v) => set("siegeCommuneId", v)}
                        disabled={!editForm.siegeVille}>
                        <SelectTrigger>
                          {loadingCommunes
                            ? <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Chargement…</span>
                            : <SelectValue placeholder={editForm.siegeVille ? "Choisir une commune" : "Sélectionnez d'abord une ville"} />
                          }
                        </SelectTrigger>
                        <SelectContent>
                          {communes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField id="e-village" label="Quartier / Village">
                      <Input id="e-village" value={editForm.siegeVillage}
                        onChange={(e) => set("siegeVillage", e.target.value)} />
                    </FormField>

                    <FormField label="Zone d'intervention">
                      <Select value={editForm.interventionScope}
                        onValueChange={(v) => set("interventionScope", v)}>
                        <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="national">National</SelectItem>
                          <SelectItem value="regions_specifiques">Régions spécifiques</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </TabsContent>
                </Tabs>
              </div>

              <SheetFooter className="flex gap-2 pt-4 border-t flex-shrink-0">
                <Button variant="outline" className="flex-1"
                  onClick={() => { setEditOpen(false); setEditTarget(null); }} disabled={isSaving}>
                  Annuler
                </Button>
                <Button className="flex-1" onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Enregistrer
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Sheet Détails ── */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detailLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : detailError ? (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-sm mt-6">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{detailError}</p>
            </div>
          ) : detail ? (
            <div className="space-y-6 pb-6">
              <SheetHeader>
                <div className="flex items-center gap-4 pt-2">
                  <Avatar className="h-16 w-16">
                    {detail.logo && <AvatarImage src={detail.logo} alt={detail.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {getInitials(detail.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-lg leading-tight">{detail.name}</SheetTitle>
                    {detail.position && <p className="text-sm text-muted-foreground">{detail.position}</p>}
                    {detail.customOrganisationName && (
                      <p className="text-sm font-medium text-primary truncate">{detail.customOrganisationName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    const s = statutConfig[detail.statut] ?? { label: detail.statut, className: "bg-muted text-muted-foreground border-border" };
                    return <Badge variant="outline" className={s.className}>{s.label}</Badge>;
                  })()}
                  {detail.numero_membre && (
                    <Badge variant="outline" className="font-mono text-xs">{detail.numero_membre}</Badge>
                  )}
                  {detail.abonnement && <Badge variant="secondary">{detail.abonnement.libelle}</Badge>}
                </div>
              </SheetHeader>
              <Separator />
              <Section title="Contact">
                <DetailRow icon={Mail}  label="Email"     value={detail.email} />
                <DetailRow icon={Phone} label="Téléphone" value={detail.phone} />
                {detail.website_url && <DetailRow icon={Globe} label="Site web" value={detail.website_url} />}
              </Section>
              <Separator />
              <Section title="Adhésion">
                <DetailRow icon={Hash}     label="Type de membre"    value={detail.typeMembre?.name} />
                <DetailRow icon={Tag}      label="Profil"            value={detail.profil?.name} />
                <DetailRow icon={Users}    label="Nombre d'employés" value={detail.nombre_employee ?? undefined} />
                <DetailRow icon={Calendar} label="Date d'adhésion"   value={
                  new Date(detail.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                } />
                {detail.date_debut_abonnement && (
                  <DetailRow icon={Calendar} label="Début abonnement" value={
                    new Date(detail.date_debut_abonnement).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                  } />
                )}
              </Section>
              <Separator />
              <Section title="Affiliation">
                <DetailRow icon={Building2} label="Organisation affiliée" value={detail.organisationName} />
                <DetailRow icon={Tag}       label="Type d'organisation"
                  value={detail.organisationType ? (orgTypeLabels[detail.organisationType] ?? detail.organisationType) : undefined} />
              </Section>
              <Separator />
              <Section title="Activité économique">
                <DetailRow icon={Briefcase} label="Secteur principal" value={detail.secteurPrincipal?.name} />
                <DetailRow icon={Briefcase} label="Filière"           value={detail.filiere?.name} />
                {detail.sousFilieres?.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Tag className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Sous-filières</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {detail.sousFilieres.map((sf) => (
                          <Badge key={sf.id} variant="outline" className="text-xs">{sf.name}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {detail.activites?.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Tag className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Activités</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {detail.activites.map((a) => (
                          <Badge key={a.id} variant="outline" className="text-xs">{a.name}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Section>
              <Separator />
              <Section title="Localisation">
                <DetailRow icon={MapPin} label="Région"             value={detail.siegeRegion?.name} />
                <DetailRow icon={MapPin} label="Commune"            value={detail.siegeCommune?.name} />
                <DetailRow icon={MapPin} label="Ville"              value={detail.siegeVille ?? undefined} />
                <DetailRow icon={MapPin} label="Quartier / Village" value={detail.siegeVillage ?? undefined} />
                {detail.interventionScope && (
                  <DetailRow icon={Globe} label="Zone d'intervention"
                    value={scopeLabels[detail.interventionScope] ?? detail.interventionScope} />
                )}
              </Section>
              {detail.message && (
                <>
                  <Separator />
                  <Section title="Description">
                    <p className="text-sm text-muted-foreground leading-relaxed">{detail.message}</p>
                  </Section>
                </>
              )}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
