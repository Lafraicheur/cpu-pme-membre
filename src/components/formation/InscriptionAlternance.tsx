import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Building2, Calendar, ChevronRight, ChevronLeft, CheckCircle2, Send,
  Briefcase, Clock, MapPin, GraduationCap, Users, FileText, Wrench, HardHat,
  Zap, Cog, ShieldCheck, Filter
} from "lucide-react";
import { toast } from "sonner";

// === Types ===
type Secteur = "mecanique" | "construction" | "electricite" | "gestion" | "informatique" | "all";

const secteurConfig: Record<Exclude<Secteur, "all">, { label: string; icon: React.ReactNode; color: string }> = {
  mecanique: { label: "Mécanique", icon: <Cog className="w-4 h-4" />, color: "text-orange-600 dark:text-orange-400" },
  construction: { label: "Construction / BTP", icon: <HardHat className="w-4 h-4" />, color: "text-amber-700 dark:text-amber-400" },
  electricite: { label: "Électricité", icon: <Zap className="w-4 h-4" />, color: "text-yellow-600 dark:text-yellow-400" },
  gestion: { label: "Gestion & Commerce", icon: <Briefcase className="w-4 h-4" />, color: "text-blue-600 dark:text-blue-400" },
  informatique: { label: "Informatique", icon: <Wrench className="w-4 h-4" />, color: "text-purple-600 dark:text-purple-400" },
};

interface Formation {
  id: string;
  titre: string;
  duree: string;
  rythme: string;
  secteur: Exclude<Secteur, "all">;
  niveau: string;
  epiRequis?: string[];
  atelierEquipements?: string[];
}

const formationsAlternance: Formation[] = [
  // Mécanique
  { id: "m1", titre: "CAP Mécanique Automobile", duree: "18 mois", rythme: "2 sem. entreprise / 2 sem. centre", secteur: "mecanique", niveau: "CAP", epiRequis: ["Combinaison", "Chaussures sécurité", "Gants", "Lunettes"], atelierEquipements: ["Pont élévateur", "Valise diagnostic", "Outillage mécanique"] },
  { id: "m2", titre: "BT Mécanique Industrielle — Tournage & Fraisage", duree: "24 mois", rythme: "3j entreprise / 2j centre", secteur: "mecanique", niveau: "BT", epiRequis: ["Lunettes", "Chaussures sécurité", "Protections auditives"], atelierEquipements: ["Tour conventionnel", "Fraiseuse", "Métrologie"] },
  { id: "m3", titre: "BTS Soudure — Procédés TIG/MIG/MAG", duree: "24 mois", rythme: "3j entreprise / 2j centre", secteur: "mecanique", niveau: "BTS", epiRequis: ["Masque soudure", "Gants haute température", "Tablier cuir", "Chaussures sécurité"], atelierEquipements: ["Poste TIG", "Poste MIG/MAG", "Poste à l'arc"] },
  { id: "m4", titre: "CQP Maintenance Engins & Véhicules Lourds", duree: "12 mois", rythme: "4j entreprise / 1j centre", secteur: "mecanique", niveau: "CQP", epiRequis: ["Combinaison", "Casque", "Chaussures sécurité", "Gants"], atelierEquipements: ["Engins TP", "Outillage hydraulique", "Diagnostic embarqué"] },
  // Construction / BTP
  { id: "c1", titre: "CAP Maçonnerie Générale & Coffrage", duree: "18 mois", rythme: "2 sem. entreprise / 2 sem. centre", secteur: "construction", niveau: "CAP", epiRequis: ["Casque chantier", "Chaussures sécurité", "Gants", "Gilet haute visibilité"], atelierEquipements: ["Échafaudage", "Bétonnière", "Outillage maçon"] },
  { id: "c2", titre: "BT Plomberie Sanitaire & Thermique", duree: "24 mois", rythme: "3j entreprise / 2j centre", secteur: "construction", niveau: "BT", epiRequis: ["Chaussures sécurité", "Gants", "Lunettes"], atelierEquipements: ["Poste soudure cuivre", "Outillage plomberie", "Cintreuse"] },
  { id: "c3", titre: "BTS Génie Civil — Conduite de Travaux", duree: "24 mois", rythme: "3j entreprise / 2j centre", secteur: "construction", niveau: "BTS", epiRequis: ["Casque", "Chaussures sécurité", "Gilet"], atelierEquipements: ["Station topographique", "Logiciel DAO", "Matériel de métrés"] },
  { id: "c4", titre: "CQP Carrelage, Faïence & Finitions", duree: "12 mois", rythme: "4j entreprise / 1j centre", secteur: "construction", niveau: "CQP", epiRequis: ["Genouillères", "Lunettes", "Gants", "Chaussures sécurité"], atelierEquipements: ["Carrelette", "Disqueuse", "Niveau laser"] },
  { id: "c5", titre: "CAP Peinture Bâtiment & Décoration", duree: "18 mois", rythme: "2 sem. entreprise / 2 sem. centre", secteur: "construction", niveau: "CAP", epiRequis: ["Masque respiratoire", "Combinaison", "Gants", "Lunettes"], atelierEquipements: ["Pistolet peinture", "Échafaudage roulant", "Enduit/ponceuse"] },
  // Électricité
  { id: "e1", titre: "CAP Électricité Bâtiment Résidentiel", duree: "18 mois", rythme: "2 sem. entreprise / 2 sem. centre", secteur: "electricite", niveau: "CAP", epiRequis: ["Gants isolants", "Chaussures isolantes", "Casque", "Outillage isolé"], atelierEquipements: ["Tableau didactique", "Multimètre", "Testeur"] },
  { id: "e2", titre: "BT Électricité Industrielle & Automatisme", duree: "24 mois", rythme: "3j entreprise / 2j centre", secteur: "electricite", niveau: "BT", epiRequis: ["Gants isolants HT", "Chaussures isolantes", "VAT", "Cadenas consignation"], atelierEquipements: ["Automate programmable", "Variateur", "Moteurs triphasés"] },
  { id: "e3", titre: "BTS Énergie Solaire & Photovoltaïque", duree: "24 mois", rythme: "3j entreprise / 2j centre", secteur: "electricite", niveau: "BTS", epiRequis: ["Harnais antichute", "Gants isolants", "Casque", "Lunettes UV"], atelierEquipements: ["Panneaux solaires", "Onduleurs", "Batteries", "Multimètre solaire"] },
  { id: "e4", titre: "CQP Domotique & Maisons Connectées", duree: "12 mois", rythme: "4j entreprise / 1j centre", secteur: "electricite", niveau: "CQP", epiRequis: ["Chaussures isolantes", "Outillage isolé"], atelierEquipements: ["Box domotique", "Capteurs IoT", "Réseau KNX"] },
  // Gestion
  { id: "g1", titre: "BTS Comptabilité & Gestion", duree: "24 mois", rythme: "3j entreprise / 2j centre", secteur: "gestion", niveau: "BTS" },
  { id: "g2", titre: "Licence Pro Marketing Digital", duree: "12 mois", rythme: "4j entreprise / 1j centre", secteur: "gestion", niveau: "Licence" },
  { id: "g3", titre: "Bachelor Ressources Humaines", duree: "12 mois", rythme: "3j entreprise / 2j centre", secteur: "gestion", niveau: "Bachelor" },
];

interface Entreprise {
  id: string;
  nom: string;
  secteur: Exclude<Secteur, "all">;
  specialite: string;
  ville: string;
  postes: number;
  tuteur: string;
}

const entreprisesAccueil: Entreprise[] = [
  // Mécanique
  { id: "em1", nom: "CFAO Motors CI", secteur: "mecanique", specialite: "Concessionnaire automobile", ville: "Abidjan", postes: 4, tuteur: "M. Yao Patrick" },
  { id: "em2", nom: "Ateliers Mécaniques d'Abobo", secteur: "mecanique", specialite: "Mécanique générale & soudure", ville: "Abidjan - Abobo", postes: 3, tuteur: "M. Koné Brahima" },
  { id: "em3", nom: "SOTRA (Maintenance)", secteur: "mecanique", specialite: "Maintenance bus & véhicules lourds", ville: "Abidjan", postes: 5, tuteur: "M. Aka Jean-Baptiste" },
  { id: "em4", nom: "Caterpillar CI (Manutention)", secteur: "mecanique", specialite: "Engins TP & maintenance industrielle", ville: "Abidjan - Vridi", postes: 2, tuteur: "Mme Doumbia Awa" },
  // Construction
  { id: "ec1", nom: "SOGEA-SATOM CI", secteur: "construction", specialite: "BTP & Génie Civil", ville: "Abidjan", postes: 6, tuteur: "M. Gnamba Rodrigue" },
  { id: "ec2", nom: "PFO Africa", secteur: "construction", specialite: "Construction bâtiments & routes", ville: "Abidjan", postes: 4, tuteur: "M. Ouattara Mamadou" },
  { id: "ec3", nom: "Entreprise Fadoul", secteur: "construction", specialite: "Travaux publics & bâtiment", ville: "Yamoussoukro", postes: 3, tuteur: "M. Diabaté Moussa" },
  { id: "ec4", nom: "Koffi Plomberie & Cie", secteur: "construction", specialite: "Plomberie sanitaire", ville: "Abidjan - Cocody", postes: 2, tuteur: "M. Koffi Émile" },
  // Électricité
  { id: "ee1", nom: "CIE (Compagnie Ivoirienne d'Électricité)", secteur: "electricite", specialite: "Distribution électrique", ville: "Abidjan", postes: 5, tuteur: "M. Diallo Seydou" },
  { id: "ee2", nom: "Schneider Electric CI", secteur: "electricite", specialite: "Équipements & automatismes", ville: "Abidjan - Marcory", postes: 3, tuteur: "Mme Bamba Aïcha" },
  { id: "ee3", nom: "SolairePlus CI", secteur: "electricite", specialite: "Installation solaire photovoltaïque", ville: "Abidjan", postes: 2, tuteur: "M. Touré Mamadou" },
  { id: "ee4", nom: "EECI (Électricité & Énergie CI)", secteur: "electricite", specialite: "Installations industrielles", ville: "San-Pédro", postes: 3, tuteur: "M. Konan Yves" },
  // Gestion
  { id: "eg1", nom: "NSIA Banque", secteur: "gestion", specialite: "Services bancaires", ville: "Abidjan", postes: 4, tuteur: "Mme Bamba Mariam" },
  { id: "eg2", nom: "Orange CI", secteur: "gestion", specialite: "Marketing & commercial", ville: "Abidjan", postes: 3, tuteur: "M. Touré Lamine" },
];

const steps = ["Formation", "Entreprise", "Planning", "Équipements & EPI", "Documents", "Confirmation"];

export function InscriptionAlternance() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSecteur, setSelectedSecteur] = useState<Secteur>("all");
  const [formData, setFormData] = useState({
    nom: "", prenom: "", email: "", telephone: "",
    formationId: "", entrepriseId: "", motivation: "",
    disponibilite: "", rythmePreference: "", dateDebut: "",
    niveauEtude: "", experiencePro: "",
    acceptConditions: false, cvUploaded: false, lettreMotivation: false, diplomeUploaded: false,
    epiConfirmed: false,
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.acceptConditions) {
      toast.error("Veuillez accepter les conditions avant de soumettre.");
      return;
    }
    toast.success("Inscription en alternance soumise avec succès ! Vous recevrez une confirmation sous 48h.");
    setCurrentStep(0);
    setFormData({
      nom: "", prenom: "", email: "", telephone: "", formationId: "", entrepriseId: "",
      motivation: "", disponibilite: "", rythmePreference: "", dateDebut: "",
      niveauEtude: "", experiencePro: "",
      acceptConditions: false, cvUploaded: false, lettreMotivation: false, diplomeUploaded: false,
      epiConfirmed: false,
    });
  };

  const filteredFormations = formationsAlternance.filter(f => selectedSecteur === "all" || f.secteur === selectedSecteur);
  const selectedFormation = formationsAlternance.find(f => f.id === formData.formationId);
  const filteredEntreprises = selectedFormation
    ? entreprisesAccueil.filter(e => e.secteur === selectedFormation.secteur)
    : entreprisesAccueil;
  const selectedEntreprise = entreprisesAccueil.find(e => e.id === formData.entrepriseId);
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);
  const isTechnique = selectedFormation && ["mecanique", "construction", "electricite"].includes(selectedFormation.secteur);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Inscription Formation en Alternance
        </h2>
        <p className="text-muted-foreground">Métiers techniques (mécanique, BTP, électricité) et tertiaires — théorie & pratique en entreprise</p>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Étape {currentStep + 1} sur {steps.length}</span>
          <span className="font-medium">{steps[currentStep]}</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <div className="flex justify-between">
          {steps.map((step, i) => (
            <div key={i} className={`flex items-center gap-1 text-xs ${i <= currentStep ? "text-primary font-medium" : "text-muted-foreground"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                i < currentStep ? "bg-primary text-primary-foreground" :
                i === currentStep ? "border-2 border-primary text-primary" :
                "border border-muted-foreground/30 text-muted-foreground"
              }`}>
                {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className="hidden md:inline">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">

          {/* === Step 0: Formation === */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Choisissez votre formation</h3>
                <p className="text-sm text-muted-foreground">Sélectionnez le secteur puis la formation en alternance</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nom</Label>
                  <Input placeholder="Votre nom" value={formData.nom} onChange={e => updateField("nom", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Prénom</Label>
                  <Input placeholder="Votre prénom" value={formData.prenom} onChange={e => updateField("prenom", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="votre@email.ci" value={formData.email} onChange={e => updateField("email", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input placeholder="+225 XX XX XX XX" value={formData.telephone} onChange={e => updateField("telephone", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Niveau d'études actuel</Label>
                  <Select value={formData.niveauEtude} onValueChange={v => updateField("niveauEtude", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cepe">CEPE</SelectItem>
                      <SelectItem value="bepc">BEPC</SelectItem>
                      <SelectItem value="cap">CAP / BEP</SelectItem>
                      <SelectItem value="bac">BAC</SelectItem>
                      <SelectItem value="bts">BTS / DUT</SelectItem>
                      <SelectItem value="licence">Licence</SelectItem>
                      <SelectItem value="master">Master +</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Expérience professionnelle</Label>
                  <Select value={formData.experiencePro} onValueChange={v => updateField("experiencePro", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aucune">Aucune</SelectItem>
                      <SelectItem value="stage">Stages uniquement</SelectItem>
                      <SelectItem value="1-3">1 à 3 ans</SelectItem>
                      <SelectItem value="3-5">3 à 5 ans</SelectItem>
                      <SelectItem value="5+">Plus de 5 ans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Secteur filter */}
              <div>
                <Label className="font-semibold text-sm mb-2 block">Filtrer par secteur</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant={selectedSecteur === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedSecteur("all")}>
                    <Filter className="w-3 h-3 mr-1" /> Tous
                  </Button>
                  {Object.entries(secteurConfig).map(([key, cfg]) => (
                    <Button
                      key={key}
                      variant={selectedSecteur === key ? "default" : "outline"}
                      size="sm"
                      className="gap-1"
                      onClick={() => setSelectedSecteur(key as Secteur)}
                    >
                      {cfg.icon} {cfg.label}
                    </Button>
                  ))}
                </div>
              </div>

              <RadioGroup value={formData.formationId} onValueChange={v => { updateField("formationId", v); updateField("entrepriseId", ""); }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredFormations.map(f => {
                  const sc = secteurConfig[f.secteur];
                  return (
                    <div key={f.id} className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.formationId === f.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}>
                      <RadioGroupItem value={f.id} id={`form-${f.id}`} className="mt-1" />
                      <Label htmlFor={`form-${f.id}`} className="cursor-pointer flex-1">
                        <p className="font-medium">{f.titre}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {f.duree}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {f.rythme}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          <span className={`flex items-center gap-1 text-xs ${sc.color}`}>{sc.icon} {sc.label}</span>
                          <Badge variant="secondary" className="text-[10px]">{f.niveau}</Badge>
                          {f.epiRequis && <Badge variant="outline" className="text-[10px]"><ShieldCheck className="w-3 h-3 mr-0.5" /> EPI requis</Badge>}
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {/* === Step 1: Entreprise === */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Entreprise d'accueil</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedFormation
                    ? `Entreprises partenaires en ${secteurConfig[selectedFormation.secteur].label}`
                    : "Sélectionnez d'abord une formation"}
                </p>
              </div>

              <RadioGroup value={formData.entrepriseId} onValueChange={v => updateField("entrepriseId", v)} className="grid sm:grid-cols-2 lg:grid-cols-3">
                {filteredEntreprises.map(e => {
                  const sc = secteurConfig[e.secteur];
                  return (
                    <div key={e.id} className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.entrepriseId === e.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={e.id} id={`ent-${e.id}`} />
                        <Label htmlFor={`ent-${e.id}`} className="cursor-pointer flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <p className="font-medium">{e.nom}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                                <span className={`flex items-center gap-1 ${sc.color}`}>{sc.icon} {e.specialite}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.ville}</span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {e.postes} postes</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Tuteur entreprise : {e.tuteur}</p>
                            </div>
                            <Badge variant="outline" className="shrink-0">{e.postes} places</Badge>
                          </div>
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {/* === Step 2: Planning === */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Planning & Disponibilité</h3>
                <p className="text-sm text-muted-foreground">Rythme d'alternance entre centre de formation et entreprise</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Date de début souhaitée</Label>
                  <Input type="date" value={formData.dateDebut} onChange={e => updateField("dateDebut", e.target.value)} className="mt-1" />
                </div>

                <div>
                  <Label>Rythme d'alternance préféré</Label>
                  <Select value={formData.rythmePreference} onValueChange={v => updateField("rythmePreference", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir un rythme" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2sem">2 semaines centre / 2 semaines entreprise</SelectItem>
                      <SelectItem value="3j-2j">3 jours entreprise / 2 jours centre</SelectItem>
                      <SelectItem value="4j-1j">4 jours entreprise / 1 jour centre</SelectItem>
                      <SelectItem value="1mois">1 mois / 1 mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Disponibilité actuelle</Label>
                  <Select value={formData.disponibilite} onValueChange={v => updateField("disponibilite", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Votre disponibilité" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immédiate</SelectItem>
                      <SelectItem value="1mois">Dans 1 mois</SelectItem>
                      <SelectItem value="3mois">Dans 3 mois</SelectItem>
                      <SelectItem value="rentrée">Prochaine rentrée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedFormation && selectedEntreprise && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-3">Aperçu du planning</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-primary">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium">Entreprise</span>
                          </div>
                          <p className="text-muted-foreground">{selectedEntreprise.nom}</p>
                          <p className="text-xs text-muted-foreground">Tuteur : {selectedEntreprise.tuteur}</p>
                          <p className="text-xs text-muted-foreground">{selectedEntreprise.specialite}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-primary">
                            <GraduationCap className="w-4 h-4" />
                            <span className="font-medium">Centre de formation</span>
                          </div>
                          <p className="text-muted-foreground">CPU Academy</p>
                          <p className="text-xs text-muted-foreground">{selectedFormation.rythme}</p>
                          <p className="text-xs text-muted-foreground">Durée : {selectedFormation.duree}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* === Step 3: Équipements & EPI === */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Équipements & Protection Individuelle
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isTechnique ? "Les EPI et équipements requis pour votre formation technique" : "Matériel requis pour votre formation"}
                </p>
              </div>

              {selectedFormation?.epiRequis && (
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      EPI obligatoires — {selectedFormation.titre}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {selectedFormation.epiRequis.map((epi, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 border rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm">{epi}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedFormation?.atelierEquipements && (
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-primary" />
                      Équipements atelier / chantier fournis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {selectedFormation.atelierEquipements.map((eq, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                          <Cog className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">{eq}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!isTechnique && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center text-muted-foreground">
                    <p>Aucun EPI spécifique requis pour cette formation tertiaire.</p>
                    <p className="text-sm mt-1">Un ordinateur portable est recommandé.</p>
                  </CardContent>
                </Card>
              )}

              {isTechnique && (
                <div className="flex items-center gap-2 border rounded-lg p-3">
                  <Checkbox id="epi-confirm" checked={formData.epiConfirmed} onCheckedChange={v => updateField("epiConfirmed", !!v)} />
                  <Label htmlFor="epi-confirm" className="text-sm cursor-pointer">
                    Je m'engage à me munir des EPI obligatoires avant le début de la formation
                  </Label>
                </div>
              )}
            </div>
          )}

          {/* === Step 4: Documents === */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Documents & Motivation</h3>
                <p className="text-sm text-muted-foreground">Complétez votre dossier de candidature</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Lettre de motivation</Label>
                  <Textarea
                    placeholder={isTechnique
                      ? "Décrivez votre parcours technique, vos motivations pour l'alternance, et votre projet professionnel..."
                      : "Expliquez votre projet professionnel et pourquoi vous souhaitez cette formation en alternance..."}
                    className="mt-1 min-h-[120px]"
                    value={formData.motivation}
                    onChange={e => updateField("motivation", e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Documents requis</Label>
                  <div className="space-y-2">
                    {[
                      { id: "cv", label: "CV à jour (PDF)", field: "cvUploaded" },
                      { id: "lettre", label: "Lettre de motivation (PDF)", field: "lettreMotivation" },
                      { id: "diplome", label: "Dernier diplôme ou attestation (PDF)", field: "diplomeUploaded" },
                    ].map(doc => (
                      <div key={doc.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{doc.label}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { updateField(doc.field, true); toast.success("Document marqué comme joint"); }}>
                          {formData[doc.field as keyof typeof formData] ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Joint</>
                          ) : "Joindre"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === Step 5: Confirmation === */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Récapitulatif</h3>
                <p className="text-sm text-muted-foreground">Vérifiez vos informations avant de soumettre</p>
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> Formation</h4>
                      <p className="text-sm">{selectedFormation?.titre || "—"}</p>
                      <p className="text-xs text-muted-foreground">{selectedFormation?.duree} • {selectedFormation?.rythme}</p>
                      {selectedFormation && <Badge variant="secondary" className="mt-1">{secteurConfig[selectedFormation.secteur].label}</Badge>}
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Entreprise</h4>
                      <p className="text-sm">{selectedEntreprise?.nom || "—"}</p>
                      <p className="text-xs text-muted-foreground">{selectedEntreprise?.specialite} • {selectedEntreprise?.ville}</p>
                      <p className="text-xs text-muted-foreground">Tuteur : {selectedEntreprise?.tuteur}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="p-4 space-y-2">
                    <h4 className="font-semibold text-sm">Candidat</h4>
                    <p className="text-sm">{formData.prenom} {formData.nom}</p>
                    <p className="text-xs text-muted-foreground">{formData.email} • {formData.telephone}</p>
                    <p className="text-xs text-muted-foreground">Début souhaité : {formData.dateDebut || "Non précisé"}</p>
                  </CardContent>
                </Card>

                {isTechnique && selectedFormation?.epiRequis && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> EPI confirmés</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedFormation.epiRequis.map((epi, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{epi}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex items-center gap-2 border rounded-lg p-3">
                  <Checkbox id="conditions" checked={formData.acceptConditions} onCheckedChange={v => updateField("acceptConditions", v as boolean)} />
                  <Label htmlFor="conditions" className="text-sm cursor-pointer">
                    J'accepte les conditions générales d'inscription et le règlement intérieur de la formation en alternance
                  </Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Suivant <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="gap-2">
              <Send className="w-4 h-4" /> Soumettre l'inscription
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
