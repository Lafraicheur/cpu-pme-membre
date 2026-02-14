import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ClipboardCheck, Users, Award, ChevronRight, ChevronLeft, CheckCircle2,
  FileText, Star, Clock, AlertTriangle, Download, Eye, UserCheck, Send,
  BookOpen, ArrowLeft, Wrench, HardHat, Zap, Cog, Filter, Search
} from "lucide-react";
import { toast } from "sonner";

// === Domain / Filière Configuration ===
type Filiere = "mecanique" | "construction" | "electricite" | "gestion" | "informatique" | "all";

const filiereConfig: Record<Exclude<Filiere, "all">, { label: string; icon: React.ReactNode; color: string }> = {
  mecanique: { label: "Mécanique", icon: <Cog className="w-4 h-4" />, color: "text-orange-600 dark:text-orange-400" },
  construction: { label: "Construction / BTP", icon: <HardHat className="w-4 h-4" />, color: "text-amber-700 dark:text-amber-400" },
  electricite: { label: "Électricité", icon: <Zap className="w-4 h-4" />, color: "text-yellow-600 dark:text-yellow-400" },
  gestion: { label: "Gestion & Commerce", icon: <BookOpen className="w-4 h-4" />, color: "text-blue-600 dark:text-blue-400" },
  informatique: { label: "Informatique & Numérique", icon: <Wrench className="w-4 h-4" />, color: "text-purple-600 dark:text-purple-400" },
};

interface RACCandidat {
  id: string;
  nom: string;
  domaine: string;
  filiere: Exclude<Filiere, "all">;
  metier: string;
  experience: string;
  statut: "en_attente" | "questionnaire" | "jury" | "valide" | "refuse";
  score?: number;
  dateDepot: string;
  prerequis?: string[];
}

const mockCandidats: RACCandidat[] = [
  { id: "1", nom: "Yao Konan Pierre", domaine: "Mécanique automobile", filiere: "mecanique", metier: "Mécanicien auto", experience: "12 ans", statut: "jury", score: 82, dateDepot: "2025-01-15", prerequis: ["Diagnostic moteur", "Système injection", "Embrayage & transmission"] },
  { id: "2", nom: "Coulibaly Drissa", domaine: "Électricité bâtiment", filiere: "electricite", metier: "Électricien bâtiment", experience: "9 ans", statut: "jury", score: 76, dateDepot: "2025-01-18", prerequis: ["Câblage domestique", "Tableau électrique", "Normes NF C 15-100"] },
  { id: "3", nom: "Traoré Moussa", domaine: "Maçonnerie", filiere: "construction", metier: "Maçon coffreur", experience: "15 ans", statut: "valide", score: 88, dateDepot: "2025-01-10", prerequis: ["Lecture de plans", "Coffrage", "Béton armé"] },
  { id: "4", nom: "Bamba Fatou", domaine: "Logistique & Supply Chain", filiere: "gestion", metier: "Responsable logistique", experience: "5 ans", statut: "valide", score: 85, dateDepot: "2025-01-10" },
  { id: "5", nom: "Koné Ibrahim", domaine: "Mécanique industrielle", filiere: "mecanique", metier: "Tourneur-fraiseur", experience: "8 ans", statut: "questionnaire", dateDepot: "2025-02-01", prerequis: ["Usinage conventionnel", "Lecture de plans méca", "Métrologie"] },
  { id: "6", nom: "Diallo Seydou", domaine: "Plomberie", filiere: "construction", metier: "Plombier sanitaire", experience: "7 ans", statut: "en_attente", dateDepot: "2025-02-05", prerequis: ["Soudure cuivre", "Installation sanitaire", "Réseau PVC"] },
  { id: "7", nom: "N'Guessan Akissi", domaine: "Électricité industrielle", filiere: "electricite", metier: "Électromécanicien", experience: "10 ans", statut: "questionnaire", dateDepot: "2025-01-22", prerequis: ["Automates programmables", "Moteurs triphasés", "Maintenance préventive"] },
  { id: "8", nom: "Dembélé Aminata", domaine: "Comptabilité-Finance", filiere: "gestion", metier: "Comptable", experience: "10 ans", statut: "refuse", score: 42, dateDepot: "2024-12-20" },
  { id: "9", nom: "Ouattara Salam", domaine: "Soudure", filiere: "mecanique", metier: "Soudeur TIG/MIG", experience: "14 ans", statut: "en_attente", dateDepot: "2025-02-08", prerequis: ["Soudure TIG", "Soudure MIG/MAG", "Soudure à l'arc"] },
  { id: "10", nom: "Koffi Adjoua", domaine: "Carrelage & Finition", filiere: "construction", metier: "Carreleur", experience: "6 ans", statut: "jury", score: 71, dateDepot: "2025-01-25", prerequis: ["Pose carrelage sol/mur", "Découpe", "Joints & finitions"] },
];

// === Domain-specific questionnaires ===
interface Question {
  id: number;
  section: string;
  question: string;
  type: "textarea" | "radio" | "checkbox";
  options?: string[];
  filiere?: Exclude<Filiere, "all">;
}

const questionnaireQuestions: Question[] = [
  // General
  { id: 1, section: "Expérience générale", question: "Décrivez votre parcours professionnel et vos principales réalisations.", type: "textarea" },
  { id: 2, section: "Expérience générale", question: "Depuis combien d'années exercez-vous dans votre métier actuel ?", type: "radio", options: ["Moins de 3 ans", "3-5 ans", "5-10 ans", "Plus de 10 ans"] },
  // Mécanique
  { id: 10, section: "Compétences Mécanique", question: "Quels types de moteurs maîtrisez-vous ?", type: "checkbox", options: ["Moteur essence", "Moteur diesel", "Moteur électrique/hybride", "Moteurs industriels", "Moteurs 2 temps"], filiere: "mecanique" },
  { id: 11, section: "Compétences Mécanique", question: "Maîtrisez-vous les équipements de diagnostic électronique (valise, oscilloscope) ?", type: "radio", options: ["Non", "Notions de base", "Utilisation courante", "Expert / formateur"], filiere: "mecanique" },
  { id: 12, section: "Compétences Mécanique", question: "Décrivez une réparation complexe que vous avez réalisée (type de panne, diagnostic, solution).", type: "textarea", filiere: "mecanique" },
  { id: 13, section: "Compétences Mécanique", question: "Quels procédés de soudure maîtrisez-vous ?", type: "checkbox", options: ["Soudure à l'arc (SMAW)", "TIG", "MIG/MAG", "Soudure oxyacétylénique", "Brasage"], filiere: "mecanique" },
  { id: 14, section: "Sécurité Mécanique", question: "Quels EPI utilisez-vous systématiquement en atelier ?", type: "checkbox", options: ["Lunettes de protection", "Gants de travail", "Chaussures de sécurité", "Protection auditive", "Masque soudure", "Combinaison de travail"], filiere: "mecanique" },
  // Construction / BTP
  { id: 20, section: "Compétences BTP", question: "Quels types de travaux maîtrisez-vous ?", type: "checkbox", options: ["Maçonnerie générale", "Coffrage / ferraillage", "Plomberie sanitaire", "Carrelage / faïence", "Peinture bâtiment", "Charpente / couverture", "Étanchéité"], filiere: "construction" },
  { id: 21, section: "Compétences BTP", question: "Savez-vous lire et interpréter des plans architecturaux ?", type: "radio", options: ["Non", "Plans simples", "Plans détaillés avec coupes", "Expert — je fais mes propres métrés"], filiere: "construction" },
  { id: 22, section: "Compétences BTP", question: "Décrivez le chantier le plus important sur lequel vous avez travaillé.", type: "textarea", filiere: "construction" },
  { id: 23, section: "Sécurité BTP", question: "Avez-vous une formation sécurité chantier ?", type: "radio", options: ["Non", "Formation informelle", "CACES / habilitation", "Responsable sécurité chantier"], filiere: "construction" },
  { id: 24, section: "Matériaux BTP", question: "Quels matériaux maîtrisez-vous ?", type: "checkbox", options: ["Béton / mortier", "Brique / parpaing", "Bois de construction", "Acier / ferraille", "PVC / cuivre (plomberie)", "Carrelage / faïence", "Plâtre / enduit"], filiere: "construction" },
  // Électricité
  { id: 30, section: "Compétences Électricité", question: "Quels domaines de l'électricité maîtrisez-vous ?", type: "checkbox", options: ["Électricité bâtiment résidentiel", "Électricité bâtiment tertiaire", "Électricité industrielle", "Énergie solaire / photovoltaïque", "Domotique / automatisme", "Haute tension"], filiere: "electricite" },
  { id: 31, section: "Compétences Électricité", question: "Quelle est votre habilitation électrique ?", type: "radio", options: ["Aucune habilitation", "B0 / H0 (non-électricien)", "B1 / B2 (exécutant/chargé)", "BR / BC (intervention/consignation)", "H1 / H2 (haute tension)"], filiere: "electricite" },
  { id: 32, section: "Compétences Électricité", question: "Décrivez une installation électrique complète que vous avez réalisée.", type: "textarea", filiere: "electricite" },
  { id: 33, section: "Normes Électricité", question: "Connaissez-vous les normes NF C 15-100 ?", type: "radio", options: ["Non", "Notions de base", "Application courante", "Expert / formateur"], filiere: "electricite" },
  { id: 34, section: "Équipements Électricité", question: "Quels appareils de mesure utilisez-vous ?", type: "checkbox", options: ["Multimètre", "Pince ampèremétrique", "Mégohmmètre", "Oscilloscope", "Testeur de terre", "Luxmètre"], filiere: "electricite" },
  // Motivation (all)
  { id: 40, section: "Motivation & Projet", question: "Pourquoi souhaitez-vous obtenir une reconnaissance officielle de vos acquis ?", type: "textarea" },
  { id: 41, section: "Motivation & Projet", question: "Quel est votre projet professionnel après l'obtention du certificat RAC ?", type: "textarea" },
];

// === Jury evaluation criteria per filiere ===
const juryGridByFiliere: Record<Exclude<Filiere, "all">, string[]> = {
  mecanique: ["Diagnostic & résolution de pannes", "Maîtrise des outils & équipements", "Procédés de soudure/assemblage", "Respect normes sécurité atelier", "Lecture plans mécaniques", "Communication technique"],
  construction: ["Lecture & interprétation de plans", "Maîtrise des techniques de construction", "Connaissance des matériaux", "Sécurité chantier & EPI", "Organisation du travail", "Qualité des finitions"],
  electricite: ["Installation & câblage", "Diagnostic pannes électriques", "Respect normes NF C 15-100", "Utilisation appareils de mesure", "Habilitation & sécurité", "Schéma & lecture de plans"],
  gestion: ["Compétences techniques métier", "Compétences transversales", "Expérience professionnelle", "Capacité d'analyse", "Communication"],
  informatique: ["Compétences techniques métier", "Compétences transversales", "Expérience professionnelle", "Capacité d'analyse", "Communication"],
};

const statutConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  en_attente: { label: "En attente", color: "bg-muted text-muted-foreground", icon: <Clock className="w-3 h-3" /> },
  questionnaire: { label: "Questionnaire", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: <FileText className="w-3 h-3" /> },
  jury: { label: "Passage Jury", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: <Users className="w-3 h-3" /> },
  valide: { label: "Validé", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: <CheckCircle2 className="w-3 h-3" /> },
  refuse: { label: "Non validé", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: <AlertTriangle className="w-3 h-3" /> },
};

export function EvaluationRAC() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedFiliere, setSelectedFiliere] = useState<Filiere>("all");
  const [selectedQuestionnaireFiliere, setSelectedQuestionnaireFiliere] = useState<Exclude<Filiere, "all">>("mecanique");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [selectedCandidat, setSelectedCandidat] = useState<RACCandidat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedAnswers, setCheckedAnswers] = useState<Record<number, string[]>>({});

  const filteredCandidats = mockCandidats.filter(c => {
    const matchFiliere = selectedFiliere === "all" || c.filiere === selectedFiliere;
    const matchSearch = !searchQuery || c.nom.toLowerCase().includes(searchQuery.toLowerCase()) || c.domaine.toLowerCase().includes(searchQuery.toLowerCase()) || c.metier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFiliere && matchSearch;
  });

  // Build questionnaire for selected filiere
  const activeQuestions = questionnaireQuestions.filter(q => !q.filiere || q.filiere === selectedQuestionnaireFiliere);

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxAnswer = (questionId: number, option: string, checked: boolean) => {
    setCheckedAnswers(prev => {
      const current = prev[questionId] || [];
      return { ...prev, [questionId]: checked ? [...current, option] : current.filter(o => o !== option) };
    });
  };

  const handleSubmitQuestionnaire = () => {
    toast.success("Questionnaire de positionnement soumis avec succès ! Vous serez convoqué(e) devant le jury.");
    setActiveTab("dashboard");
    setAnswers({});
    setCheckedAnswers({});
    setCurrentQuestion(0);
  };

  const handleJuryDecision = (candidatId: string, decision: "valide" | "refuse") => {
    toast.success(
      decision === "valide"
        ? "Candidat validé ! Le certificat RAC sera généré automatiquement."
        : "Candidat non validé. Un rapport détaillé sera envoyé."
    );
    setSelectedCandidat(null);
  };

  const handleGenerateCertificat = (candidat: RACCandidat) => {
    toast.success(`Certificat RAC « ${candidat.metier} » généré pour ${candidat.nom} — disponible au téléchargement.`);
  };

  const progressPercent = activeQuestions.length > 0 ? Math.round(((currentQuestion + 1) / activeQuestions.length) * 100) : 0;

  const kpis = {
    total: mockCandidats.length,
    enEval: mockCandidats.filter(c => c.statut === "questionnaire" || c.statut === "jury").length,
    valides: mockCandidats.filter(c => c.statut === "valide").length,
    techniques: mockCandidats.filter(c => ["mecanique", "construction", "electricite"].includes(c.filiere)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            Module RAC — Reconnaissance des Acquis
          </h2>
          <p className="text-muted-foreground">Évaluation, positionnement et certification des métiers techniques et tertiaires</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="dashboard" className="gap-2"><BookOpen className="w-4 h-4" /> Tableau de bord</TabsTrigger>
          <TabsTrigger value="questionnaire" className="gap-2"><FileText className="w-4 h-4" /> Questionnaire</TabsTrigger>
          <TabsTrigger value="jury" className="gap-2"><Users className="w-4 h-4" /> Espace Jury</TabsTrigger>
          <TabsTrigger value="certificats" className="gap-2"><Award className="w-4 h-4" /> Certificats</TabsTrigger>
        </TabsList>

        {/* ===== DASHBOARD ===== */}
        <TabsContent value="dashboard">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Candidatures", value: String(kpis.total), icon: <FileText className="w-5 h-5" />, color: "text-blue-600 dark:text-blue-400" },
                { label: "En évaluation", value: String(kpis.enEval), icon: <ClipboardCheck className="w-5 h-5" />, color: "text-amber-600 dark:text-amber-400" },
                { label: "Validés", value: String(kpis.valides), icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Métiers techniques", value: String(kpis.techniques), icon: <Wrench className="w-5 h-5" />, color: "text-primary" },
              ].map((kpi, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${kpi.color}`}>{kpi.icon}</div>
                    <div>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Rechercher par nom, domaine, métier..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Select value={selectedFiliere} onValueChange={v => setSelectedFiliere(v as Filiere)}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filière" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les filières</SelectItem>
                  {Object.entries(filiereConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Candidats list */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dossiers RAC ({filteredCandidats.length})</CardTitle>
                <CardDescription>Suivi des candidatures à la reconnaissance des acquis — métiers techniques & tertiaires</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredCandidats.map(c => {
                    const s = statutConfig[c.statut];
                    const f = filiereConfig[c.filiere];
                    return (
                      <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors gap-2 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {c.nom.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">{c.nom}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`flex items-center gap-1 text-xs ${f.color}`}>{f.icon} {c.metier}</span>
                              <span className="text-xs text-muted-foreground">• {c.experience}</span>
                            </div>
                            {c.prerequis && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {c.prerequis.slice(0, 3).map((p, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">{p}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {c.score !== undefined && <span className="text-sm font-medium">{c.score}/100</span>}
                          <Badge className={`${s.color} gap-1`} variant="secondary">{s.icon} {s.label}</Badge>
                          {c.statut === "jury" && (
                            <Button size="sm" variant="outline" onClick={() => { setSelectedCandidat(c); setActiveTab("jury"); }}>
                              <Eye className="w-3 h-3 mr-1" /> Évaluer
                            </Button>
                          )}
                          {c.statut === "valide" && (
                            <Button size="sm" variant="outline" onClick={() => handleGenerateCertificat(c)}>
                              <Download className="w-3 h-3 mr-1" /> Certificat
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredCandidats.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Aucun candidat trouvé pour ces critères</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== QUESTIONNAIRE ===== */}
        <TabsContent value="questionnaire">
          <div className="space-y-4">
            {/* Filiere selector */}
            <Card>
              <CardContent className="p-4">
                <Label className="font-semibold text-sm mb-3 block">Sélectionnez votre filière pour adapter le questionnaire :</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filiereConfig).map(([key, cfg]) => (
                    <Button
                      key={key}
                      variant={selectedQuestionnaireFiliere === key ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      onClick={() => { setSelectedQuestionnaireFiliere(key as Exclude<Filiere, "all">); setCurrentQuestion(0); }}
                    >
                      {cfg.icon} {cfg.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {filiereConfig[selectedQuestionnaireFiliere].icon}
                      Questionnaire — {filiereConfig[selectedQuestionnaireFiliere].label}
                    </CardTitle>
                    <CardDescription>
                      Question {currentQuestion + 1} sur {activeQuestions.length} — {activeQuestions[currentQuestion]?.section}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{Math.round((Object.keys(answers).length + Object.keys(checkedAnswers).length) / activeQuestions.length * 100)}%</Badge>
                </div>
                <Progress value={progressPercent} className="h-2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-6">
                {activeQuestions[currentQuestion] && (
                  <div className="min-h-[220px]">
                    <h3 className="font-semibold text-lg mb-4">
                      {currentQuestion + 1}. {activeQuestions[currentQuestion].question}
                    </h3>

                    {activeQuestions[currentQuestion].type === "textarea" && (
                      <Textarea
                        placeholder="Votre réponse détaillée..."
                        className="min-h-[120px]"
                        value={(answers[activeQuestions[currentQuestion].id] as string) || ""}
                        onChange={e => handleAnswer(activeQuestions[currentQuestion].id, e.target.value)}
                      />
                    )}

                    {activeQuestions[currentQuestion].type === "radio" && (
                      <RadioGroup
                        value={(answers[activeQuestions[currentQuestion].id] as string) || ""}
                        onValueChange={v => handleAnswer(activeQuestions[currentQuestion].id, v)}
                        className="space-y-3"
                      >
                        {activeQuestions[currentQuestion].options?.map((opt, i) => (
                          <div key={i} className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                            <RadioGroupItem value={opt} id={`q${currentQuestion}-${i}`} />
                            <Label htmlFor={`q${currentQuestion}-${i}`} className="cursor-pointer flex-1">{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {activeQuestions[currentQuestion].type === "checkbox" && (
                      <div className="space-y-3">
                        {activeQuestions[currentQuestion].options?.map((opt, i) => {
                          const qId = activeQuestions[currentQuestion].id;
                          const isChecked = (checkedAnswers[qId] || []).includes(opt);
                          return (
                            <div key={i} className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                              <Checkbox
                                id={`q${currentQuestion}-cb-${i}`}
                                checked={isChecked}
                                onCheckedChange={checked => handleCheckboxAnswer(qId, opt, !!checked)}
                              />
                              <Label htmlFor={`q${currentQuestion}-cb-${i}`} className="cursor-pointer flex-1">{opt}</Label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
                </Button>
                {currentQuestion < activeQuestions.length - 1 ? (
                  <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                    Suivant <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmitQuestionnaire} className="gap-2">
                    <Send className="w-4 h-4" /> Soumettre
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* ===== JURY ===== */}
        <TabsContent value="jury">
          <div className="space-y-6">
            {selectedCandidat ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCandidat(null)}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        Évaluation Jury — {selectedCandidat.nom}
                        <Badge variant="outline" className={`${filiereConfig[selectedCandidat.filiere].color} gap-1`}>
                          {filiereConfig[selectedCandidat.filiere].icon} {filiereConfig[selectedCandidat.filiere].label}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{selectedCandidat.metier} • {selectedCandidat.domaine} • {selectedCandidat.experience} d'expérience</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prerequis attestés */}
                  {selectedCandidat.prerequis && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Prérequis déclarés par le candidat</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidat.prerequis.map((p, i) => (
                          <Badge key={i} variant="secondary" className="gap-1">{p}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scoring grid adapted to filiere */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Grille d'évaluation — {filiereConfig[selectedCandidat.filiere].label}</h4>
                    {(juryGridByFiliere[selectedCandidat.filiere] || juryGridByFiliere.gestion).map((comp, i) => (
                      <div key={i} className="flex items-center justify-between border rounded-lg p-3">
                        <span className="text-sm font-medium">{comp}</span>
                        <Select defaultValue="3">
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 — Insuffisant</SelectItem>
                            <SelectItem value="2">2 — À améliorer</SelectItem>
                            <SelectItem value="3">3 — Satisfaisant</SelectItem>
                            <SelectItem value="4">4 — Très bien</SelectItem>
                            <SelectItem value="5">5 — Excellent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>

                  {/* Épreuve pratique */}
                  {["mecanique", "construction", "electricite"].includes(selectedCandidat.filiere) && (
                    <Card className="border-dashed">
                      <CardContent className="p-4 space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-primary" />
                          Épreuve pratique en atelier / chantier
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Tâche réalisée</Label>
                            <Input placeholder="Ex: Installation tableau électrique triphasé" className="mt-1" />
                          </div>
                          <div>
                            <Label className="text-xs">Durée de l'épreuve</Label>
                            <Select defaultValue="2h">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1h">1 heure</SelectItem>
                                <SelectItem value="2h">2 heures</SelectItem>
                                <SelectItem value="3h">3 heures</SelectItem>
                                <SelectItem value="4h">4 heures (journée)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Résultat de l'épreuve pratique</Label>
                          <Select defaultValue="3">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Non réalisée</SelectItem>
                              <SelectItem value="2">Partiellement réalisée</SelectItem>
                              <SelectItem value="3">Réalisée avec aide</SelectItem>
                              <SelectItem value="4">Réalisée en autonomie</SelectItem>
                              <SelectItem value="5">Excellente maîtrise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Textarea placeholder="Observations sur l'épreuve pratique : gestes professionnels, respect des normes, autonomie..." className="min-h-[80px]" />
                      </CardContent>
                    </Card>
                  )}

                  <div>
                    <Label className="font-semibold">Observations générales du jury</Label>
                    <Textarea placeholder="Commentaires, recommandations, points forts et axes d'amélioration..." className="mt-2 min-h-[100px]" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox id="confirm-jury" />
                    <Label htmlFor="confirm-jury" className="text-sm">Je confirme avoir évalué le candidat en toute impartialité</Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="destructive" onClick={() => handleJuryDecision(selectedCandidat.id, "refuse")}>
                    <AlertTriangle className="w-4 h-4 mr-1" /> Non validé
                  </Button>
                  <Button onClick={() => handleJuryDecision(selectedCandidat.id, "valide")} className="gap-2">
                    <UserCheck className="w-4 h-4" /> Valider & Générer certificat
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Candidats en attente de jury</CardTitle>
                  <CardDescription>Sélectionnez un candidat pour procéder à l'évaluation technique ou tertiaire</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockCandidats.filter(c => c.statut === "jury").map(c => {
                      const f = filiereConfig[c.filiere];
                      return (
                        <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                              {c.nom.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{c.nom}</p>
                              <div className="flex items-center gap-2">
                                <span className={`flex items-center gap-1 text-xs ${f.color}`}>{f.icon} {c.metier}</span>
                                <span className="text-xs text-muted-foreground">• {c.experience}</span>
                              </div>
                              {c.prerequis && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {c.prerequis.map((p, i) => (
                                    <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">{p}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Score : {c.score}/100</span>
                            <Button onClick={() => setSelectedCandidat(c)} className="gap-2">
                              <Users className="w-4 h-4" /> Évaluer
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {mockCandidats.filter(c => c.statut === "jury").length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Aucun candidat en attente d'évaluation jury</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ===== CERTIFICATS ===== */}
        <TabsContent value="certificats">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Certificats RAC émis</CardTitle>
              <CardDescription>Certificats générés automatiquement après validation par le jury — métiers techniques & tertiaires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCandidats.filter(c => c.statut === "valide").map(c => {
                  const f = filiereConfig[c.filiere];
                  return (
                    <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Award className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{c.nom}</p>
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1 text-xs ${f.color}`}>{f.icon} {c.metier}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Score : {c.score}/100 • Délivré le {c.dateDepot}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1"><Eye className="w-3 h-3" /> Aperçu</Button>
                        <Button size="sm" className="gap-1" onClick={() => handleGenerateCertificat(c)}>
                          <Download className="w-3 h-3" /> Télécharger
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {mockCandidats.filter(c => c.statut === "valide").length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Aucun certificat émis pour le moment</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
