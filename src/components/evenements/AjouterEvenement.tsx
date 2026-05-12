import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  typeEvenementsApi,
  regionsApi,
  filieresApi,
  publicCiblesApi,
  ticketTypesApi,
  createEvenementApi,
  createEvenementApiJson,
  TypeEvenement,
  Region,
  Filiere,
  PublicCible,
} from "@/lib/api";
import {
  PlusCircle,
  Trash2,
  CheckCircle,
  Loader2,
  ImageIcon,
  Ticket,
  ChevronRight,
  ChevronLeft,
  UserCircle2,
  Calendar,
  MapPin,
  Tag,
  Users,
  Settings2,
  Sparkles,
  Upload,
  Camera,
  Globe,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Intervenant {
  nom_complet: string;
  titre_fonction: string;
  entreprise_organisation: string;
  imageFile: File | null;
  imagePreview: string | null;
}

interface ObjectifRow {
  texte: string;
}

interface ProgrammeRow {
  heure: string;
  activite: string;
}

interface TicketRow {
  nom: string;
  prix: string;
  prix_membre: string;
  quantite_totale: string;
}

interface InfosPratiques {
  parking: string;
  restauration: string;
  accessibilite: string;
}

const emptyObjectif = (): ObjectifRow => ({ texte: "" });
const emptyProgrammeRow = (): ProgrammeRow => ({ heure: "", activite: "" });
const emptyInfosPratiques = (): InfosPratiques => ({ parking: "", restauration: "", accessibilite: "" });

const emptyIntervenant = (): Intervenant => ({
  nom_complet: "",
  titre_fonction: "",
  entreprise_organisation: "",
  imageFile: null,
  imagePreview: null,
});

const emptyTicket = (): TicketRow => ({
  nom: "",
  prix: "0",
  prix_membre: "0",
  quantite_totale: "100",
});

// ─────────────────────────────────────────────────────────────────────────────
// Stepper
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Informations", icon: Tag, color: "text-violet-500", bg: "bg-violet-500" },
  { label: "Programme",    icon: Calendar, color: "text-blue-500", bg: "bg-blue-500" },
  { label: "Tarification", icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-start justify-center gap-0 mb-10">
      {STEPS.map((s, i) => {
        const done   = i < current;
        const active = i === current;
        const Icon   = s.icon;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-2 min-w-[72px]">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  done
                    ? `${s.bg} border-transparent text-white shadow-md`
                    : active
                    ? `border-2 ${s.color} bg-white dark:bg-card shadow-md`
                    : "border-border bg-muted text-muted-foreground"
                )}
              >
                {done ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className={cn("w-4 h-4", active ? s.color : "")} />
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-semibold text-center leading-tight hidden sm:block",
                  active ? s.color : done ? "text-muted-foreground" : "text-muted-foreground/50"
                )}
              >
                {s.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 w-10 sm:w-16 mx-1 mb-5 rounded-full transition-all duration-500", done ? s.bg : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section card wrapper
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  color = "text-primary",
  accent = "border-primary/30",
  children,
}: {
  icon: React.ElementType;
  title: string;
  color?: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border bg-card shadow-sm overflow-hidden")}>
      <div className={cn("flex items-center gap-2.5 px-5 py-3.5 border-b bg-muted/30", accent.replace("border", "border-l-4"))}>
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center bg-background border", accent)}>
          <Icon className={cn("w-3.5 h-3.5", color)} />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Option toggle row
// ─────────────────────────────────────────────────────────────────────────────

function OptionRow({ label, description, checked, onCheckedChange }: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between rounded-xl px-4 py-3 border transition-colors",
      checked ? "bg-primary/5 border-primary/30" : "bg-background border-border"
    )}>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────

export function AjouterEvenement({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();

  const { data: typeEvenements = [] } = useQuery({
    queryKey: ["type-evenements"],
    queryFn: () => typeEvenementsApi.getAll(),
    staleTime: 10 * 60 * 1000,
  });
  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: regionsApi.getAll,
    staleTime: 10 * 60 * 1000,
  });
  const { data: filieres = [] } = useQuery({
    queryKey: ["filieres"],
    queryFn: filieresApi.getAll,
    staleTime: 10 * 60 * 1000,
  });
  const { data: publicCibles = [] } = useQuery({
    queryKey: ["public-cibles"],
    queryFn: publicCiblesApi.getAll,
    staleTime: 10 * 60 * 1000,
  });

  const [step, setStep] = useState(0);

  // Étape 1
  const [titre, setTitre]                   = useState("");
  const [description, setDescription]       = useState("");
  const [format, setFormat]                 = useState("presentiel");
  const [descriptionTypeFormat, setDescriptionTypeFormat] = useState("");
  const [typeEvenementId, setTypeEvenementId] = useState("");
  const [regionId, setRegionId]             = useState("");
  const [filiereId, setFiliereId]           = useState("");
  const [filiereConcerner, setFiliereConcerner] = useState<ObjectifRow[]>([emptyObjectif()]);
  const [publicCibleIds, setPublicCibleIds] = useState<string[]>([]);
  const [imageFile, setImageFile]           = useState<File | null>(null);
  const [imagePreview, setImagePreview]     = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Étape 2
  const [dateDebut, setDateDebut]     = useState("");
  const [dateFin, setDateFin]         = useState("");
  const [objectifs, setObjectifs]     = useState<ObjectifRow[]>([emptyObjectif()]);
  const [programme, setProgramme]     = useState<ProgrammeRow[]>([emptyProgrammeRow()]);
  const [informationsPratiques, setInformationsPratiques] = useState<InfosPratiques>(emptyInfosPratiques());
  const [lieu, setLieu]               = useState("");
  const [lienUrl, setLienUrl]         = useState("");
  const [intervenants, setIntervenants] = useState<Intervenant[]>([emptyIntervenant()]);
  const intervenantImgRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [exigerKyc, setExigerKyc]           = useState(false);
  const [matchmakingB2b, setMatchmakingB2b] = useState(false);
  const [listeAttente, setListeAttente]     = useState(false);
  const [qrCheckin, setQrCheckin]           = useState(false);
  const [attestation, setAttestation]       = useState(false);
  const [partagePhotos, setPartagePhotos]   = useState(false);
  const [alaUne, setAlaUne]                 = useState(false);
  const [isActive, setIsActive]             = useState(true);

  // Étape 3
  const [cequiInclu, setCequiInclu]                   = useState<ObjectifRow[]>([emptyObjectif()]);
  const [prix, setPrix]                               = useState("0");
  const [prixMembre, setPrixMembre]                   = useState("0");
  const [capaciteMax, setCapaciteMax]                 = useState("100");
  const [gratuitPourTous, setGratuitPourTous]         = useState(false);
  const [gratuitMembreUniquement, setGratuitMembreUniquement] = useState(false);
  const [tickets, setTickets]                         = useState<TicketRow[]>([emptyTicket()]);

  // Soumission
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);


  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addIntervenant    = () => setIntervenants((p) => [...p, emptyIntervenant()]);
  const removeIntervenant = (i: number) => setIntervenants((p) => p.filter((_, idx) => idx !== i));
  const updateIntervenant = (i: number, field: keyof Omit<Intervenant, "imageFile" | "imagePreview">, val: string) =>
    setIntervenants((p) => p.map((iv, idx) => (idx === i ? { ...iv, [field]: val } : iv)));
  const handleIntervenantImage = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIntervenants((p) => p.map((iv, idx) =>
      idx === i ? { ...iv, imageFile: file, imagePreview: URL.createObjectURL(file) } : iv
    ));
  };

  const addObjectif    = () => setObjectifs((p) => [...p, emptyObjectif()]);
  const removeObjectif = (i: number) => setObjectifs((p) => p.filter((_, idx) => idx !== i));
  const updateObjectif = (i: number, val: string) =>
    setObjectifs((p) => p.map((o, idx) => (idx === i ? { texte: val } : o)));

  const addFiliereConcerner    = () => setFiliereConcerner((p) => [...p, emptyObjectif()]);
  const removeFiliereConcerner = (i: number) => setFiliereConcerner((p) => p.filter((_, idx) => idx !== i));
  const updateFiliereConcerner = (i: number, val: string) =>
    setFiliereConcerner((p) => p.map((o, idx) => (idx === i ? { texte: val } : o)));

  const addCequiInclu    = () => setCequiInclu((p) => [...p, emptyObjectif()]);
  const removeCequiInclu = (i: number) => setCequiInclu((p) => p.filter((_, idx) => idx !== i));
  const updateCequiInclu = (i: number, val: string) =>
    setCequiInclu((p) => p.map((o, idx) => (idx === i ? { texte: val } : o)));

  const addProgrammeRow    = () => setProgramme((p) => [...p, emptyProgrammeRow()]);
  const removeProgrammeRow = (i: number) => setProgramme((p) => p.filter((_, idx) => idx !== i));
  const updateProgrammeRow = (i: number, field: keyof ProgrammeRow, val: string) =>
    setProgramme((p) => p.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  const addTicket    = () => setTickets((p) => [...p, emptyTicket()]);
  const removeTicket = (i: number) => setTickets((p) => p.filter((_, idx) => idx !== i));
  const updateTicket = (i: number, field: keyof TicketRow, val: string) =>
    setTickets((p) => p.map((t, idx) => (idx === i ? { ...t, [field]: val } : t)));

  const validateStep1 = () => {
    if (!titre.trim()) {
      toast({ title: "Champ requis", description: "Le titre est obligatoire.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmitEvent = async () => {
    setLoading(true);
    try {
      // Champs communs
      const validObjectifs  = objectifs.filter((o) => o.texte.trim()).map((o) => o.texte);
      const validProgramme  = programme.filter((r) => r.heure.trim() || r.activite.trim());
      const validFiliereConcerner = filiereConcerner.filter((o) => o.texte.trim()).map((o) => o.texte);
      const validCequiInclu = cequiInclu.filter((o) => o.texte.trim()).map((o) => o.texte);
      const selectedPc      = publicCibles.filter((p) => publicCibleIds.includes(p.id));
      const typeAudience    = selectedPc.length > 0 ? selectedPc.map((p) => p.libelle).join(", ") : null;
      const infoPratiques   = (informationsPratiques.parking || informationsPratiques.restauration || informationsPratiques.accessibilite)
        ? informationsPratiques : null;
      const intervenantsData = intervenants
        .filter((iv) => iv.nom_complet.trim())
        .map(({ nom_complet, titre_fonction, entreprise_organisation }) => ({
          nom_complet, titre_fonction, entreprise_organisation, image: null as string | null,
        }));

      let ev: import("@/lib/api").Evenement;

      if (imageFile) {
        // Multipart quand un fichier image est sélectionné
        const fd = new FormData();
        fd.append("titre", titre);
        if (description) fd.append("description", description);
        fd.append("format", format);
        if (descriptionTypeFormat) fd.append("description_type_format", descriptionTypeFormat);
        if (typeEvenementId) fd.append("type_evenement_id", typeEvenementId);
        if (regionId) fd.append("region_id", regionId);
        if (filiereId) fd.append("filiere_id", filiereId);
        if (validFiliereConcerner.length > 0) fd.append("filiere_concerner", JSON.stringify(validFiliereConcerner));
        if (typeAudience) fd.append("type_audience", typeAudience);
        if (dateDebut) {
          fd.append("date_debut", new Date(dateDebut).toISOString());
          fd.append("heure_debut", dateDebut.slice(11, 16));
        }
        if (dateFin) {
          fd.append("date_fin", new Date(dateFin).toISOString());
          fd.append("heure_fin", dateFin.slice(11, 16));
        }
        if (lieu) fd.append("lieu", lieu);
        if (lienUrl) fd.append("lien_url", lienUrl);
        if (validObjectifs.length > 0) fd.append("objectifs", JSON.stringify(validObjectifs));
        if (validProgramme.length > 0) fd.append("programme", JSON.stringify(validProgramme));
        if (infoPratiques) fd.append("informations_pratiques", JSON.stringify(infoPratiques));
        fd.append("exiger_kyc_verifie", String(exigerKyc));
        fd.append("activer_matchmaking_b2b", String(matchmakingB2b));
        fd.append("autoriser_liste_attente", String(listeAttente));
        fd.append("generer_qr_checkin", String(qrCheckin));
        fd.append("attestation_participation", String(attestation));
        fd.append("partage_photos_autorise", String(partagePhotos));
        fd.append("ala_une", String(alaUne));
        fd.append("isActive", String(isActive));
        fd.append("prix", prix);
        fd.append("prix_membre", prixMembre);
        fd.append("capacite_max", capaciteMax);
        fd.append("gratuit_pour_tous", String(gratuitPourTous));
        fd.append("gratuit_membre_uniquement", String(gratuitMembreUniquement));
        if (validCequiInclu.length > 0) fd.append("cequiInclu", JSON.stringify(validCequiInclu));
        if (intervenantsData.length > 0) {
          fd.append("intervenants", JSON.stringify(intervenantsData));
          intervenants.filter((iv) => iv.nom_complet.trim()).forEach((iv) => {
            if (iv.imageFile) fd.append("intervenant_images", iv.imageFile);
          });
        }
        fd.append("image_flayer", imageFile);
        ev = await createEvenementApi(fd);
      } else {
        // JSON quand pas de fichier (token récupéré automatiquement via Authorization header)
        ev = await createEvenementApiJson({
          titre,
          description:              description || null,
          format,
          description_type_format:  descriptionTypeFormat || null,
          type_evenement_id:        typeEvenementId || undefined,
          region_id:                regionId || null,
          filiere_id:               filiereId || null,
          filiere_concerner:        validFiliereConcerner.length > 0 ? validFiliereConcerner : null,
          type_audience:            typeAudience,
          date_debut:               dateDebut ? new Date(dateDebut).toISOString() : null,
          heure_debut:              dateDebut ? dateDebut.slice(11, 16) : undefined,
          date_fin:                 dateFin ? new Date(dateFin).toISOString() : null,
          heure_fin:                dateFin ? dateFin.slice(11, 16) : undefined,
          lieu:                     lieu || null,
          lien_url:                 lienUrl || null,
          objectifs:                validObjectifs.length > 0 ? validObjectifs : null,
          programme:                validProgramme.length > 0 ? validProgramme : null,
          informations_pratiques:   infoPratiques as unknown as Record<string, string> | null,
          exiger_kyc_verifie:       exigerKyc,
          activer_matchmaking_b2b:  matchmakingB2b,
          autoriser_liste_attente:  listeAttente,
          generer_qr_checkin:       qrCheckin,
          attestation_participation: attestation,
          partage_photos_autorise:  partagePhotos,
          ala_une:                  alaUne,
          isActive,
          prix,
          prix_membre:              prixMembre,
          capacite_max:             parseInt(capaciteMax) || 100,
          gratuit_pour_tous:        gratuitPourTous,
          gratuit_membre_uniquement: gratuitMembreUniquement,
          cequiInclu:               validCequiInclu.length > 0 ? validCequiInclu : null,
          intervenants:             intervenantsData.length > 0 ? intervenantsData : null,
          image_flayer:             null,
        });
      }

      // Créer les billets configurés à l'étape 3
      const validTickets = tickets.filter((t) => t.nom.trim());
      if (validTickets.length > 0) {
        await Promise.all(validTickets.map((t) =>
          ticketTypesApi.create({
            event_id: ev.id,
            nom: t.nom,
            prix: gratuitPourTous ? 0 : parseFloat(t.prix) || 0,
            prix_membre: gratuitMembreUniquement ? 0 : parseFloat(t.prix_membre) || 0,
            quantite_totale: parseInt(t.quantite_totale) || 100,
          })
        ));
      }

      setDone(true);
      toast({ title: "Événement publié !", description: "L'événement et ses billets sont créés." });
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Impossible de créer l'événement.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0); setTitre(""); setDescription(""); setFormat("presentiel");
    setDescriptionTypeFormat(""); setFiliereConcerner([emptyObjectif()]);
    setTypeEvenementId(""); setRegionId(""); setFiliereId(""); setPublicCibleIds([]);
    setImageFile(null); setImagePreview(null);
    setDateDebut(""); setDateFin("");
    setObjectifs([emptyObjectif()]); setProgramme([emptyProgrammeRow()]); setInformationsPratiques(emptyInfosPratiques());
    setLieu(""); setLienUrl(""); setIntervenants([emptyIntervenant()]);
    setExigerKyc(false); setMatchmakingB2b(false); setListeAttente(false);
    setQrCheckin(false); setAttestation(false); setPartagePhotos(false);
    setAlaUne(false); setIsActive(true);
    setCequiInclu([emptyObjectif()]); setPrix("0"); setPrixMembre("0"); setCapaciteMax("100");
    setGratuitPourTous(false); setGratuitMembreUniquement(false);
    setTickets([emptyTicket()]); setDone(false);
  };

  const handleClose = () => { reset(); onOpenChange(false); };

  // ─────────────────────────────────────────────────────────────────────────
  // Contenu selon l'état
  // ─────────────────────────────────────────────────────────────────────────

  const renderContent = () => {

  // ── Écran succès ──────────────────────────────────────────────────────────
  if (done) return (
      <div className="flex flex-col items-center justify-center py-12 gap-6 text-center max-w-sm mx-auto">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center ring-8 ring-emerald-500/5">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-yellow-900" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Événement publié !</h2>
          <p className="text-muted-foreground text-sm">L'événement et ses billets sont créés et visibles sur la plateforme.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="px-6">Fermer</Button>
          <Button onClick={reset} className="gap-2 px-6">
            <PlusCircle className="w-4 h-4" /> Créer un autre
          </Button>
        </div>
      </div>
  );

  // ── Formulaire 3 étapes ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <StepIndicator current={step} />

      {/* ── ÉTAPE 1 ────────────────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center pb-2">
            <h2 className="text-xl font-bold">Informations générales</h2>
            <p className="text-sm text-muted-foreground mt-1">Décrivez votre événement et choisissez sa catégorie.</p>
          </div>

          {/* Titre & Description */}
          <SectionCard icon={Tag} title="Présentation" color="text-violet-500" accent="border-violet-300">
            <div className="space-y-1.5">
              <Label htmlFor="titre" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Titre de l'événement *
              </Label>
              <Input id="titre" value={titre} onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex : Forum PME Abidjan 2026"
                className="h-11 text-base" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Description
              </Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez l'objectif, le contexte et le contenu de l'événement…"
                rows={4} className="resize-none" />
            </div>
          </SectionCard>

          {/* Catégorie */}
          <SectionCard icon={Settings2} title="Catégorie & Audience" color="text-blue-500" accent="border-blue-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presentiel">🏢 Présentiel</SelectItem>
                    <SelectItem value="en_ligne">💻 En ligne</SelectItem>
                    <SelectItem value="webinaire">🎙️ Webinaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description du format</Label>
                <Input value={descriptionTypeFormat} onChange={(e) => setDescriptionTypeFormat(e.target.value)}
                  placeholder="Ex : Conférence plénière suivie d'ateliers…" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type d'événement</Label>
                <Select value={typeEvenementId} onValueChange={setTypeEvenementId}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                  <SelectContent>
                    {typeEvenements.map((t) => <SelectItem key={t.id} value={t.id}>{t.nom}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Région</Label>
                <Select value={regionId} onValueChange={setRegionId}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filière</Label>
                <Select value={filiereId} onValueChange={setFiliereId}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                  <SelectContent>
                    {filieres.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name} — {f.secteur?.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filière(s) concernée(s)</Label>
                <div className="space-y-2">
                  {filiereConcerner.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={o.texte} onChange={(e) => updateFiliereConcerner(i, e.target.value)}
                        placeholder="Ex : Agro-industrie" className="h-10 flex-1" />
                      {filiereConcerner.length > 1 && (
                        <button type="button" onClick={() => removeFiliereConcerner(i)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addFiliereConcerner}
                    className="w-full h-9 rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all flex items-center justify-center gap-2">
                    <PlusCircle className="w-3.5 h-3.5" /> Ajouter une filière
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Public cible
                  {publicCibleIds.length > 0 && (
                    <span className="ml-2 normal-case font-normal text-primary">{publicCibleIds.length} sélectionné{publicCibleIds.length > 1 ? "s" : ""}</span>
                  )}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {publicCibles.map((pc) => {
                    const selected = publicCibleIds.includes(pc.id);
                    return (
                      <button
                        key={pc.id}
                        type="button"
                        onClick={() => setPublicCibleIds((prev) =>
                          selected ? prev.filter((id) => id !== pc.id) : [...prev, pc.id]
                        )}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                          selected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                        )}
                      >
                        {selected && <CheckCircle className="w-3 h-3 shrink-0" />}
                        {pc.libelle}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Image flyer */}
          <SectionCard icon={ImageIcon} title="Affiche / Flyer" color="text-pink-500" accent="border-pink-300">
            <div
              onClick={() => imageInputRef.current?.click()}
              className={cn(
                "relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden",
                imagePreview
                  ? "border-primary/30 hover:border-primary/60"
                  : "border-border hover:border-primary/40 hover:bg-primary/5"
              )}
            >
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Aperçu" className="w-full max-h-52 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-medium">
                    <Camera className="w-4 h-4" /> Changer l'image
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Importer une image</p>
                    <p className="text-xs">PNG, JPG jusqu'à 10 Mo</p>
                  </div>
                </div>
              )}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </SectionCard>

          <div className="flex justify-end pt-2">
            <Button onClick={() => { if (validateStep1()) setStep(1); }} size="lg" className="gap-2 px-8 rounded-xl">
              Suivant <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 ────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center pb-2">
            <h2 className="text-xl font-bold">Programme & Intervenants</h2>
            <p className="text-sm text-muted-foreground mt-1">Planifiez les dates, le lieu et présentez vos intervenants.</p>
          </div>

          {/* Dates */}
          <SectionCard icon={Calendar} title="Dates & Horaires" color="text-blue-500" accent="border-blue-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date_debut" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date & heure de début</Label>
                <Input id="date_debut" type="datetime-local" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date_fin" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date & heure de fin</Label>
                <Input id="date_fin" type="datetime-local" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="h-11" />
              </div>
            </div>
          </SectionCard>

          {/* Lieu */}
          <SectionCard icon={MapPin} title="Lieu & Lien" color="text-orange-500" accent="border-orange-300">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lieu / Adresse</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={lieu} onChange={(e) => setLieu(e.target.value)}
                  placeholder="Ex : Sofitel Hôtel Ivoire, Abidjan" className="h-11 pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lien URL (si en ligne)</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="url" value={lienUrl} onChange={(e) => setLienUrl(e.target.value)}
                  placeholder="https://zoom.us/j/…" className="h-11 pl-9" />
              </div>
            </div>
          </SectionCard>

          {/* Objectifs */}
          <SectionCard icon={Sparkles} title="Objectifs" color="text-indigo-500" accent="border-indigo-300">
            <div className="space-y-2">
              {objectifs.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-xs font-bold text-indigo-500">{i + 1}</div>
                  <Input
                    value={o.texte}
                    onChange={(e) => updateObjectif(i, e.target.value)}
                    placeholder={`Objectif ${i + 1}…`}
                    className="h-10 flex-1"
                  />
                  {objectifs.length > 1 && (
                    <button type="button" onClick={() => removeObjectif(i)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addObjectif}
              className="w-full h-10 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" /> Ajouter un objectif
            </button>
          </SectionCard>

          {/* Programme */}
          <SectionCard icon={Calendar} title="Programme détaillé" color="text-blue-500" accent="border-blue-300">
            <div className="space-y-2">
              {programme.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-xs font-bold text-blue-500">{i + 1}</div>
                  <Input
                    value={r.heure}
                    onChange={(e) => updateProgrammeRow(i, "heure", e.target.value)}
                    placeholder="09h00"
                    className="h-10 w-24 shrink-0"
                  />
                  <Input
                    value={r.activite}
                    onChange={(e) => updateProgrammeRow(i, "activite", e.target.value)}
                    placeholder="Activité / description…"
                    className="h-10 flex-1"
                  />
                  {programme.length > 1 && (
                    <button type="button" onClick={() => removeProgrammeRow(i)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addProgrammeRow}
              className="w-full h-10 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" /> Ajouter une entrée
            </button>
          </SectionCard>

          {/* Informations pratiques */}
          <SectionCard icon={Settings2} title="Informations pratiques" color="text-orange-500" accent="border-orange-300">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Parking</Label>
                <Input value={informationsPratiques.parking}
                  onChange={(e) => setInformationsPratiques((p) => ({ ...p, parking: e.target.value }))}
                  placeholder="Ex : Parking gratuit disponible" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Restauration</Label>
                <Input value={informationsPratiques.restauration}
                  onChange={(e) => setInformationsPratiques((p) => ({ ...p, restauration: e.target.value }))}
                  placeholder="Ex : Déjeuner inclus" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accessibilité</Label>
                <Input value={informationsPratiques.accessibilite}
                  onChange={(e) => setInformationsPratiques((p) => ({ ...p, accessibilite: e.target.value }))}
                  placeholder="Ex : Accessible aux personnes à mobilité réduite" className="h-10" />
              </div>
            </div>
          </SectionCard>

          {/* Intervenants */}
          <SectionCard icon={Users} title="Intervenants" color="text-violet-500" accent="border-violet-300">
            <div className="space-y-3">
              {intervenants.map((iv, i) => (
                <div key={i} className="rounded-xl border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">Intervenant {i + 1}</Badge>
                    {intervenants.length > 1 && (
                      <button type="button" onClick={() => removeIntervenant(i)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      onClick={() => intervenantImgRefs.current[i]?.click()}
                      className="shrink-0 w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden group relative"
                    >
                      {iv.imagePreview ? (
                        <>
                          <img src={iv.imagePreview} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <UserCircle2 className="w-7 h-7 text-muted-foreground" />
                      )}
                    </div>
                    <input ref={(el) => { intervenantImgRefs.current[i] = el; }}
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => handleIntervenantImage(i, e)} />

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs text-muted-foreground">Nom complet</Label>
                        <Input placeholder="Jean Dupont" value={iv.nom_complet}
                          onChange={(e) => updateIntervenant(i, "nom_complet", e.target.value)} className="h-10" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Titre / Fonction</Label>
                        <Input placeholder="Directeur Général" value={iv.titre_fonction}
                          onChange={(e) => updateIntervenant(i, "titre_fonction", e.target.value)} className="h-10" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Organisation</Label>
                        <Input placeholder="CPU-PME" value={iv.entreprise_organisation}
                          onChange={(e) => updateIntervenant(i, "entreprise_organisation", e.target.value)} className="h-10" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addIntervenant}
              className="w-full h-10 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-violet-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" /> Ajouter un intervenant
            </button>
          </SectionCard>

          {/* Options */}
          <SectionCard icon={Settings2} title="Options & Paramètres" color="text-slate-500" accent="border-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <OptionRow label="Exiger KYC vérifié" description="Réservé aux membres vérifiés" checked={exigerKyc} onCheckedChange={setExigerKyc} />
              <OptionRow label="Matchmaking B2B" description="Activer la mise en relation" checked={matchmakingB2b} onCheckedChange={setMatchmakingB2b} />
              <OptionRow label="Liste d'attente" description="Si capacité max atteinte" checked={listeAttente} onCheckedChange={setListeAttente} />
              <OptionRow label="QR code check-in" description="Accès par scan QR" checked={qrCheckin} onCheckedChange={setQrCheckin} />
              <OptionRow label="Attestation" description="Délivrer une attestation" checked={attestation} onCheckedChange={setAttestation} />
              <OptionRow label="Partage photos" description="Autoriser le partage" checked={partagePhotos} onCheckedChange={setPartagePhotos} />
            </div>
          </SectionCard>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(0)} size="lg" className="gap-2 rounded-xl">
              <ChevronLeft className="w-4 h-4" /> Précédent
            </Button>
            <Button onClick={() => setStep(2)} size="lg" className="gap-2 px-8 rounded-xl">
              Suivant <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 3 ────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center pb-2">
            <h2 className="text-xl font-bold">Tarification & Billets</h2>
            <p className="text-sm text-muted-foreground mt-1">Définissez les prix et créez vos types de billets.</p>
          </div>

          {/* Tarification */}
          <SectionCard icon={Banknote} title="Tarification" color="text-emerald-500" accent="border-emerald-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <OptionRow
                label="Gratuit pour tous"
                description="Aucun paiement requis"
                checked={gratuitPourTous}
                onCheckedChange={(v) => { setGratuitPourTous(v); if (v) setGratuitMembreUniquement(false); }}
              />
              <OptionRow
                label="Gratuit membres uniquement"
                description="Gratuit pour les membres"
                checked={gratuitMembreUniquement}
                onCheckedChange={(v) => { setGratuitMembreUniquement(v); if (v) setGratuitPourTous(false); }}
              />
            </div>

            <div className="pt-1 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Capacité max</Label>
                <div className="relative">
                  <Input type="number" min="1" value={capaciteMax} onChange={(e) => setCapaciteMax(e.target.value)} className="h-11 pr-10" />
                  <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ce qui est inclus</Label>
                <div className="space-y-2">
                  {cequiInclu.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      </div>
                      <Input value={o.texte} onChange={(e) => updateCequiInclu(i, e.target.value)}
                        placeholder="Ex : Déjeuner offert" className="h-9 flex-1" />
                      {cequiInclu.length > 1 && (
                        <button type="button" onClick={() => removeCequiInclu(i)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addCequiInclu}
                    className="w-full h-9 rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-center gap-2">
                    <PlusCircle className="w-3.5 h-3.5" /> Ajouter un élément
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Billets */}
          <SectionCard icon={Ticket} title="Types de billets" color="text-primary" accent="border-primary/30">
            <div className="space-y-3">
              {tickets.map((t, i) => (
                <div key={i} className="rounded-xl border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                      <span className="text-sm font-medium">Billet {i + 1}</span>
                    </div>
                    {tickets.length > 1 && (
                      <button type="button" onClick={() => removeTicket(i)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-xs text-muted-foreground">Nom du billet *</Label>
                      <Input placeholder="ex. Standard, VIP, Gratuit…" value={t.nom}
                        onChange={(e) => updateTicket(i, "nom", e.target.value)} className="h-10" />
                    </div>
                    {/* Prix public : visible sauf si gratuit pour tous */}
                    {!gratuitPourTous && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Prix public</Label>
                        <div className="relative">
                          <Input type="number" min="0" value={t.prix}
                            onChange={(e) => updateTicket(i, "prix", e.target.value)} className="h-10 pr-14" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">FCFA</span>
                        </div>
                      </div>
                    )}
                    {/* Prix membre : masqué si gratuit pour tous OU gratuit membre uniquement */}
                    {!gratuitPourTous && !gratuitMembreUniquement && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Prix membre</Label>
                        <div className="relative">
                          <Input type="number" min="0" value={t.prix_membre}
                            onChange={(e) => updateTicket(i, "prix_membre", e.target.value)} className="h-10 pr-14" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">FCFA</span>
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Quantité</Label>
                      <Input type="number" min="1" value={t.quantite_totale}
                        onChange={(e) => updateTicket(i, "quantite_totale", e.target.value)} className="h-10" />
                    </div>
                  </div>

                  {gratuitPourTous && (
                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">Gratuit pour tous — aucun prix à renseigner.</p>
                    </div>
                  )}
                  {gratuitMembreUniquement && (
                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <p className="text-xs text-blue-700 dark:text-blue-400">Gratuit membres uniquement — renseignez uniquement le prix public.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button type="button" onClick={addTicket}
              className="w-full h-11 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" /> Ajouter un type de billet
            </button>
          </SectionCard>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)} size="lg" className="gap-2 rounded-xl">
              <ChevronLeft className="w-4 h-4" /> Précédent
            </Button>
            <Button onClick={handleSubmitEvent} disabled={loading} size="lg" className="gap-2 px-8 rounded-xl">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Créer l'événement
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  }; // fin renderContent

  // ─────────────────────────────────────────────────────────────────────────
  // Rendu principal — Modal
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(v); }}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header fixe */}
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-lg font-bold">Nouvel événement</DialogTitle>
        </DialogHeader>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
