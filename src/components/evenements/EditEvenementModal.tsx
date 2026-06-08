import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  typeEvenementsApi, regionsApi, filieresApi,
  evenementsApi, type Evenement,
} from "@/lib/api";
import {
  SectionCard, OptionRow,
  type ObjectifRow, type ProgrammeRow, type InfosPratiques, type Intervenant,
  emptyObjectif, emptyProgrammeRow, emptyInfosPratiques, emptyIntervenant,
} from "./AjouterEvenement";
import {
  PlusCircle, Trash2, CheckCircle, Loader2, ImageIcon, ChevronRight, ChevronLeft,
  UserCircle2, Calendar, MapPin, Tag, Settings2, Sparkles, Upload, Camera,
  Globe, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Stepper ──────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Informations", icon: Tag,      color: "text-violet-500", bg: "bg-violet-500" },
  { label: "Programme",    icon: Calendar,  color: "text-blue-500",   bg: "bg-blue-500"   },
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
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                done  ? `${s.bg} border-transparent text-white shadow-md`
                      : active ? `border-2 ${s.color} bg-white dark:bg-card shadow-md`
                               : "border-border bg-muted text-muted-foreground"
              )}>
                {done ? <CheckCircle className="w-5 h-5" /> : <Icon className={cn("w-4 h-4", active ? s.color : "")} />}
              </div>
              <span className={cn(
                "text-[11px] font-semibold text-center leading-tight hidden sm:block",
                active ? s.color : done ? "text-muted-foreground" : "text-muted-foreground/50"
              )}>{s.label}</span>
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

// ── Helpers de parsing des champs JSON ───────────────────────────────────────

function safeParseArray<T>(val: unknown, fallback: T[]): T[] {
  if (!val) return fallback;
  if (Array.isArray(val)) return val as T[];
  try { const p = JSON.parse(val as string); return Array.isArray(p) ? p : fallback; } catch { return fallback; }
}

function safeParseObj<T extends object>(val: unknown, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === "object" && !Array.isArray(val)) return val as T;
  try { const p = JSON.parse(val as string); return typeof p === "object" && !Array.isArray(p) ? p : fallback; } catch { return fallback; }
}

function toDatetimeLocal(date: string, heure: string): string {
  if (!date) return "";
  const d = date.slice(0, 10);
  const h = heure ? heure.slice(0, 5) : "00:00";
  return `${d}T${h}`;
}

// ── Composant principal ───────────────────────────────────────────────────────

interface Props {
  event: Evenement | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function EditEvenementModal({ event, open, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);

  // ── Référentiels ────────────────────────────────────────────────────────────
  const { data: typeEvenements = [] } = useQuery({ queryKey: ["type-evenements"], queryFn: () => typeEvenementsApi.getAll(), staleTime: 10 * 60 * 1000, enabled: open });
  const { data: regions = [] }        = useQuery({ queryKey: ["regions"],         queryFn: regionsApi.getAll,  staleTime: 10 * 60 * 1000, enabled: open });
  const { data: filieres = [] }       = useQuery({ queryKey: ["filieres"],        queryFn: filieresApi.getAll, staleTime: 10 * 60 * 1000, enabled: open });

  // ── Étape 1 ─────────────────────────────────────────────────────────────────
  const [titre, setTitre]                             = useState("");
  const [description, setDescription]                 = useState("");
  const [format, setFormat]                           = useState("presentiel");
  const [descriptionTypeFormat, setDescriptionTypeFormat] = useState("");
  const [typeEvenementId, setTypeEvenementId]         = useState("");
  const [regionId, setRegionId]                       = useState("");
  const [filiereId, setFiliereId]                     = useState("");
  const [filiereConcerner, setFiliereConcerner]       = useState<ObjectifRow[]>([emptyObjectif()]);
  const [audience, setAudience]                       = useState("");
  const [imageFile, setImageFile]                     = useState<File | null>(null);
  const [imagePreview, setImagePreview]               = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Étape 2 ─────────────────────────────────────────────────────────────────
  const [dateDebut, setDateDebut]                     = useState("");
  const [dateFin, setDateFin]                         = useState("");
  const [objectifs, setObjectifs]                     = useState<ObjectifRow[]>([emptyObjectif()]);
  const [programme, setProgramme]                     = useState<ProgrammeRow[]>([emptyProgrammeRow()]);
  const [informationsPratiques, setInformationsPratiques] = useState<InfosPratiques>(emptyInfosPratiques());
  const [lieu, setLieu]                               = useState("");
  const [lienUrl, setLienUrl]                         = useState("");
  const [intervenants, setIntervenants]               = useState<Intervenant[]>([emptyIntervenant()]);
  const intervenantImgRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [exigerKyc, setExigerKyc]                     = useState(false);
  const [matchmakingB2b, setMatchmakingB2b]           = useState(false);
  const [listeAttente, setListeAttente]               = useState(false);
  const [qrCheckin, setQrCheckin]                     = useState(false);
  const [attestation, setAttestation]                 = useState(false);
  const [partagePhotos, setPartagePhotos]             = useState(false);
  const [alaUne, setAlaUne]                           = useState(false);
  const [isActive, setIsActive]                       = useState(true);


  // ── Pré-remplissage depuis l'événement existant ──────────────────────────────
  useEffect(() => {
    if (!event || !open) return;
    setStep(0);

    // Étape 1
    setTitre(event.titre ?? "");
    setDescription(event.description ?? "");
    setFormat(event.format ?? "presentiel");
    setDescriptionTypeFormat(event.description_type_format ?? "");
    setTypeEvenementId(event.type_evenement_id ?? "");
    setRegionId(event.region_id ?? "");
    setFiliereId(event.filiere_id ?? "");
    setImageFile(null);
    setImagePreview(event.image_flayer ?? null);

    const fc = safeParseArray<string>(event.filiere_concerner, []);
    setFiliereConcerner(fc.length > 0 ? fc.map((t) => ({ texte: t })) : [emptyObjectif()]);
    setAudience(event.type_audience ?? "");

    // Étape 2
    setDateDebut(toDatetimeLocal(event.date_debut, event.heure_debut));
    setDateFin(toDatetimeLocal(event.date_fin, event.heure_fin));
    setLieu(event.lieu ?? "");
    setLienUrl(event.lien_url ?? "");

    const obj = safeParseArray<string>(event.objectifs, []);
    setObjectifs(obj.length > 0 ? obj.map((t) => ({ texte: t })) : [emptyObjectif()]);

    const prog = safeParseArray<{ heure: string; activite: string }>(event.programme, []);
    setProgramme(prog.length > 0 ? prog : [emptyProgrammeRow()]);

    const ip = safeParseObj<InfosPratiques>(event.informations_pratiques, emptyInfosPratiques());
    setInformationsPratiques({ parking: ip.parking ?? "", restauration: ip.restauration ?? "", accessibilite: ip.accessibilite ?? "" });

    const apiUrl = import.meta.env.VITE_API_URL || "";
    const ivRaw = safeParseArray<{ nom_complet?: string; titre_fonction?: string; entreprise_organisation?: string; image?: string | null }>(event.intervenants, []);
    setIntervenants(ivRaw.length > 0
      ? ivRaw.map((iv) => {
          const imgUrl = iv.image
            ? iv.image.startsWith("http") ? iv.image : `${apiUrl}${iv.image}`
            : null;
          return { nom_complet: iv.nom_complet ?? "", titre_fonction: iv.titre_fonction ?? "", entreprise_organisation: iv.entreprise_organisation ?? "", imageFile: null, imagePreview: imgUrl };
        })
      : [emptyIntervenant()]
    );

    setExigerKyc(event.exiger_kyc_verifie ?? false);
    setMatchmakingB2b(event.activer_matchmaking_b2b ?? false);
    setListeAttente(event.autoriser_liste_attente ?? false);
    setQrCheckin(event.generer_qr_checkin ?? false);
    setAttestation(event.attestation_participation ?? false);
    setPartagePhotos(event.partage_photos_autorise ?? false);
    setAlaUne(event.ala_une ?? false);
    setIsActive(event.isActive ?? true);

  }, [event, open]);

  // ── Mutation sauvegarde ──────────────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!event) return;
      const validObjectifs  = objectifs.filter((o) => o.texte.trim()).map((o) => o.texte);
      const validProgramme  = programme.filter((r) => r.heure.trim() || r.activite.trim());
      const validFiliereConcerner = filiereConcerner.filter((o) => o.texte.trim()).map((o) => o.texte);
      const typeAudience    = audience.trim() || null;
      const infoPratiques   = (informationsPratiques.parking || informationsPratiques.restauration || informationsPratiques.accessibilite)
        ? informationsPratiques : null;
      const intervenantsData = intervenants
        .filter((iv) => iv.nom_complet.trim())
        .map(({ nom_complet, titre_fonction, entreprise_organisation }) => ({ nom_complet, titre_fonction, entreprise_organisation, image: null as string | null }));

      const dateDebutIso = dateDebut ? new Date(dateDebut).toISOString() : undefined;
      const dateFinIso   = dateFin   ? new Date(dateFin).toISOString()   : undefined;
      const heureDebut   = dateDebut ? dateDebut.slice(11, 16) : undefined;
      const heureFin     = dateFin   ? dateFin.slice(11, 16)   : undefined;

      if (imageFile) {
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
        if (dateDebutIso) { fd.append("date_debut", dateDebutIso); if (heureDebut) fd.append("heure_debut", heureDebut); }
        if (dateFinIso)   { fd.append("date_fin",   dateFinIso);   if (heureFin)   fd.append("heure_fin",   heureFin);   }
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
        if (intervenantsData.length > 0) {
          fd.append("intervenants", JSON.stringify(intervenantsData));
          intervenants.filter((iv) => iv.nom_complet.trim()).forEach((iv) => {
            if (iv.imageFile) fd.append("intervenant_images", iv.imageFile);
          });
        }
        fd.append("image_flayer", imageFile);
        await evenementsApi.updateMultipart(event.id, fd);
      } else {
        await evenementsApi.update(event.id, {
          titre,
          description: description || undefined,
          format,
          description_type_format: descriptionTypeFormat || null,
          type_evenement_id: typeEvenementId || undefined,
          region_id: regionId || null,
          filiere_id: filiereId || null,
          filiere_concerner: validFiliereConcerner.length > 0 ? validFiliereConcerner.join(",") : null,
          type_audience: typeAudience,
          date_debut: dateDebutIso,
          heure_debut: heureDebut,
          date_fin: dateFinIso,
          heure_fin: heureFin,
          lieu: lieu || null,
          lien_url: lienUrl || null,
          objectifs: validObjectifs.length > 0 ? JSON.stringify(validObjectifs) : null,
          programme: validProgramme.length > 0 ? JSON.stringify(validProgramme) : null,
          informations_pratiques: infoPratiques ? JSON.stringify(infoPratiques) : null,
          exiger_kyc_verifie: exigerKyc,
          activer_matchmaking_b2b: matchmakingB2b,
          autoriser_liste_attente: listeAttente,
          generer_qr_checkin: qrCheckin,
          attestation_participation: attestation,
          partage_photos_autorise: partagePhotos,
          ala_une: alaUne,
          isActive,
          intervenants: intervenantsData.length > 0 ? intervenantsData : null,
        });
      }
    },
    onSuccess: () => {
      toast({ title: "Événement mis à jour !", description: "Les modifications ont été enregistrées." });
      onSaved();
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  // ── Handlers image ───────────────────────────────────────────────────────────
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── Handlers intervenants ────────────────────────────────────────────────────
  const addIntervenant    = () => setIntervenants((p) => [...p, emptyIntervenant()]);
  const removeIntervenant = (i: number) => setIntervenants((p) => p.filter((_, idx) => idx !== i));
  const updateIntervenant = (i: number, field: keyof Omit<Intervenant, "imageFile" | "imagePreview">, val: string) =>
    setIntervenants((p) => p.map((iv, idx) => idx === i ? { ...iv, [field]: val } : iv));
  const handleIntervenantImage = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIntervenants((p) => p.map((iv, idx) =>
      idx === i ? { ...iv, imageFile: file, imagePreview: URL.createObjectURL(file) } : iv
    ));
  };

  // ── Handlers listes dynamiques ───────────────────────────────────────────────
  const addObjectif    = () => setObjectifs((p) => [...p, emptyObjectif()]);
  const removeObjectif = (i: number) => setObjectifs((p) => p.filter((_, idx) => idx !== i));
  const updateObjectif = (i: number, val: string) => setObjectifs((p) => p.map((o, idx) => idx === i ? { texte: val } : o));

  const addFiliereConcerner    = () => setFiliereConcerner((p) => [...p, emptyObjectif()]);
  const removeFiliereConcerner = (i: number) => setFiliereConcerner((p) => p.filter((_, idx) => idx !== i));
  const updateFiliereConcerner = (i: number, val: string) => setFiliereConcerner((p) => p.map((o, idx) => idx === i ? { texte: val } : o));

  const addProgrammeRow    = () => setProgramme((p) => [...p, emptyProgrammeRow()]);
  const removeProgrammeRow = (i: number) => setProgramme((p) => p.filter((_, idx) => idx !== i));
  const updateProgrammeRow = (i: number, field: keyof ProgrammeRow, val: string) =>
    setProgramme((p) => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  // ── Rendu ────────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0 flex flex-col max-h-[92vh] overflow-hidden">
        <DialogHeader className="flex-row items-center justify-between px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-lg font-bold">Modifier l'événement</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <StepIndicator current={step} />

            {/* ── ÉTAPE 1 ─────────────────────────────────────────────────── */}
            {step === 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center pb-2">
                  <h2 className="text-xl font-bold">Informations générales</h2>
                  <p className="text-sm text-muted-foreground mt-1">Décrivez votre événement et choisissez sa catégorie.</p>
                </div>

                <SectionCard icon={Tag} title="Présentation" color="text-violet-500" accent="border-violet-300">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Titre de l'événement *</Label>
                    <Input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex : Forum PME Abidjan 2026" className="h-11 text-base" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez l'objectif, le contexte et le contenu de l'événement…" rows={4} className="resize-none" />
                  </div>
                </SectionCard>

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
                          {filieres.map((f) => <SelectItem key={f.id} value={f.id}>{f.name} — {f.secteur?.name}</SelectItem>)}
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
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Audience</Label>
                      <Input
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        placeholder="Ex : PME, startups, investisseurs, entrepreneurs…"
                        className="h-11"
                      />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard icon={ImageIcon} title="Affiche / Flyer" color="text-pink-500" accent="border-pink-300">
                  <div onClick={() => imageInputRef.current?.click()}
                    className={cn(
                      "relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden",
                      imagePreview ? "border-primary/30 hover:border-primary/60" : "border-border hover:border-primary/40 hover:bg-primary/5"
                    )}>
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
                  <Button onClick={() => { if (!titre.trim()) { toast({ title: "Champ requis", description: "Le titre est obligatoire.", variant: "destructive" }); return; } setStep(1); }}
                    size="lg" className="gap-2 px-8 rounded-xl">
                    Suivant <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 2 ─────────────────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center pb-2">
                  <h2 className="text-xl font-bold">Programme & Intervenants</h2>
                  <p className="text-sm text-muted-foreground mt-1">Planifiez les dates, le lieu et présentez vos intervenants.</p>
                </div>

                <SectionCard icon={Calendar} title="Dates & Horaires" color="text-blue-500" accent="border-blue-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date & heure de début</Label>
                      <Input type="datetime-local" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date & heure de fin</Label>
                      <Input type="datetime-local" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="h-11" />
                    </div>
                  </div>
                </SectionCard>

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

                <SectionCard icon={Sparkles} title="Objectifs" color="text-indigo-500" accent="border-indigo-300">
                  <div className="space-y-2">
                    {objectifs.map((o, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-6 h-6 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-xs font-bold text-indigo-500">{i + 1}</div>
                        <Input value={o.texte} onChange={(e) => updateObjectif(i, e.target.value)} placeholder={`Objectif ${i + 1}…`} className="h-10 flex-1" />
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

                <SectionCard icon={Calendar} title="Programme détaillé" color="text-blue-500" accent="border-blue-300">
                  <div className="space-y-2">
                    {programme.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-6 h-6 shrink-0 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-xs font-bold text-blue-500">{i + 1}</div>
                        <Input value={r.heure} onChange={(e) => updateProgrammeRow(i, "heure", e.target.value)} placeholder="09h00" className="h-10 w-24 shrink-0" />
                        <Input value={r.activite} onChange={(e) => updateProgrammeRow(i, "activite", e.target.value)} placeholder="Activité / description…" className="h-10 flex-1" />
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

                <SectionCard icon={Settings2} title="Informations pratiques" color="text-orange-500" accent="border-orange-300">
                  <div className="space-y-3">
                    {(["parking", "restauration", "accessibilite"] as const).map((key) => (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                        <Input value={informationsPratiques[key]}
                          onChange={(e) => setInformationsPratiques((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder={key === "parking" ? "Ex : Parking gratuit disponible" : key === "restauration" ? "Ex : Déjeuner inclus" : "Ex : Accessible PMR"}
                          className="h-10" />
                      </div>
                    ))}
                  </div>
                </SectionCard>

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
                          <div onClick={() => intervenantImgRefs.current[i]?.click()}
                            className="shrink-0 w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden group relative">
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
                          <input ref={(el) => { intervenantImgRefs.current[i] = el; }} type="file" accept="image/*" className="hidden"
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

                <SectionCard icon={Settings2} title="Options & Paramètres" color="text-slate-500" accent="border-slate-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <OptionRow label="Exiger KYC vérifié"  description="Réservé aux membres vérifiés"  checked={exigerKyc}      onCheckedChange={setExigerKyc} />
                    <OptionRow label="Matchmaking B2B"     description="Activer la mise en relation"   checked={matchmakingB2b} onCheckedChange={setMatchmakingB2b} />
                    <OptionRow label="Liste d'attente"     description="Si capacité max atteinte"     checked={listeAttente}   onCheckedChange={setListeAttente} />
                    <OptionRow label="QR code check-in"    description="Accès par scan QR"            checked={qrCheckin}      onCheckedChange={setQrCheckin} />
                    <OptionRow label="Attestation"         description="Délivrer une attestation"     checked={attestation}    onCheckedChange={setAttestation} />
                    <OptionRow label="Partage photos"      description="Autoriser le partage"         checked={partagePhotos}  onCheckedChange={setPartagePhotos} />
                  </div>
                </SectionCard>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(0)} size="lg" className="gap-2 rounded-xl">
                    <ChevronLeft className="w-4 h-4" /> Précédent
                  </Button>
                  <Button onClick={() => mutate()} disabled={isPending} size="lg" className="gap-2 px-8 rounded-xl">
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Enregistrer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
