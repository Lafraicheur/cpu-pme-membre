import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Calendar,
  DollarSign,
  Building2,
  Users,
  Filter,
  Download,
  Send,
  MoreVertical,
  Star,
  MessageSquare,
  FileUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type AOStatus = "draft" | "published" | "closing_soon" | "closed" | "evaluating" | "awarded";
type SubmissionStatus = "pending" | "reviewed" | "shortlisted" | "rejected" | "awarded";

interface ManagedAO {
  id: string;
  title: string;
  reference: string;
  type: string;
  prestation: string;
  sector: string;
  budgetMin?: number;
  budgetMax?: number;
  deadline: string;
  status: AOStatus;
  submissionsCount: number;
  views: number;
  createdAt: string;
  publishedAt?: string;
}

interface ReceivedSubmission {
  id: string;
  aoId: string;
  aoTitle: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  amount: number;
  submittedAt: string;
  status: SubmissionStatus;
  technicalScore?: number;
  financialScore?: number;
  totalScore?: number;
  notes?: string;
}

const mockManagedAOs: ManagedAO[] = [
  {
    id: "MY-AO-001",
    title: "Audit comptable exercice 2024",
    reference: "MY-AO-2024-001",
    type: "Consultation",
    prestation: "Services",
    sector: "Finance & Assurance",
    budgetMin: 15000000,
    budgetMax: 25000000,
    deadline: "2024-02-28",
    status: "published",
    submissionsCount: 8,
    views: 156,
    createdAt: "2024-01-10",
    publishedAt: "2024-01-12",
  },
  {
    id: "MY-AO-002",
    title: "Fourniture de matériel informatique",
    reference: "MY-AO-2024-002",
    type: "Marché",
    prestation: "Fournitures",
    sector: "Économie Numérique & Innovation",
    budgetMin: 50000000,
    budgetMax: 75000000,
    deadline: "2024-03-15",
    status: "draft",
    submissionsCount: 0,
    views: 0,
    createdAt: "2024-01-18",
  },
  {
    id: "MY-AO-003",
    title: "Services de nettoyage des locaux",
    reference: "MY-AO-2023-015",
    type: "Consultation",
    prestation: "Services",
    sector: "Services aux entreprises",
    budgetMin: 8000000,
    budgetMax: 12000000,
    deadline: "2024-01-20",
    status: "evaluating",
    submissionsCount: 12,
    views: 234,
    createdAt: "2023-12-15",
    publishedAt: "2023-12-18",
  },
];

const mockReceivedSubmissions: ReceivedSubmission[] = [
  {
    id: "REC-001",
    aoId: "MY-AO-001",
    aoTitle: "Audit comptable exercice 2024",
    companyName: "Cabinet KPMG CI",
    contactName: "Jean Kouassi",
    contactEmail: "j.kouassi@kpmg.ci",
    amount: 22000000,
    submittedAt: "2024-01-15",
    status: "reviewed",
    technicalScore: 85,
    financialScore: 78,
    totalScore: 82,
  },
  {
    id: "REC-002",
    aoId: "MY-AO-001",
    aoTitle: "Audit comptable exercice 2024",
    companyName: "Ernst & Young Côte d'Ivoire",
    contactName: "Marie Bamba",
    contactEmail: "m.bamba@ey.com",
    amount: 24500000,
    submittedAt: "2024-01-16",
    status: "shortlisted",
    technicalScore: 92,
    financialScore: 72,
    totalScore: 84,
  },
  {
    id: "REC-003",
    aoId: "MY-AO-001",
    aoTitle: "Audit comptable exercice 2024",
    companyName: "Cabinet Diallo & Associés",
    contactName: "Amadou Diallo",
    contactEmail: "a.diallo@diallo-audit.ci",
    amount: 18000000,
    submittedAt: "2024-01-17",
    status: "pending",
  },
  {
    id: "REC-004",
    aoId: "MY-AO-003",
    aoTitle: "Services de nettoyage des locaux",
    companyName: "CleanPro Services",
    contactName: "Fatou Koné",
    contactEmail: "f.kone@cleanpro.ci",
    amount: 9500000,
    submittedAt: "2024-01-05",
    status: "shortlisted",
    technicalScore: 88,
    financialScore: 90,
    totalScore: 89,
  },
];

const aoStatusConfig: Record<AOStatus, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: "Brouillon", color: "bg-muted text-muted-foreground", icon: FileText },
  published: { label: "Publié", color: "bg-secondary/10 text-secondary", icon: CheckCircle2 },
  closing_soon: { label: "Clôture proche", color: "bg-primary/10 text-primary", icon: AlertCircle },
  closed: { label: "Clôturé", color: "bg-muted text-muted-foreground", icon: Clock },
  evaluating: { label: "En évaluation", color: "bg-amber-500/10 text-amber-600", icon: Users },
  awarded: { label: "Attribué", color: "bg-blue-500/10 text-blue-600", icon: Award },
};

const submissionStatusConfig: Record<SubmissionStatus, { label: string; color: string }> = {
  pending: { label: "À évaluer", color: "bg-muted text-muted-foreground" },
  reviewed: { label: "Évalué", color: "bg-blue-500/10 text-blue-600" },
  shortlisted: { label: "Présélectionné", color: "bg-primary/10 text-primary" },
  rejected: { label: "Rejeté", color: "bg-destructive/10 text-destructive" },
  awarded: { label: "Attribué", color: "bg-secondary/10 text-secondary" },
};

interface GestionAOProps {
  onCreateAO: () => void;
}

export function GestionAO({ onCreateAO }: GestionAOProps) {
  const [activeTab, setActiveTab] = useState("mes-ao");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAO, setSelectedAO] = useState<ManagedAO | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ReceivedSubmission | null>(null);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  
  // Evaluation form
  const [evaluation, setEvaluation] = useState({
    technicalScore: "",
    financialScore: "",
    notes: "",
    decision: "",
  });

  const filteredAOs = mockManagedAOs.filter(ao =>
    ao.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSubmissionsForAO = (aoId: string) =>
    mockReceivedSubmissions.filter(s => s.aoId === aoId);

  const handleEvaluate = () => {
    if (!selectedSubmission) return;
    toast.success(`Évaluation enregistrée pour ${selectedSubmission.companyName}`);
    setShowEvaluationDialog(false);
    setSelectedSubmission(null);
  };

  const handleAward = (submission: ReceivedSubmission) => {
    toast.success(`Marché attribué à ${submission.companyName}`);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="mes-ao">Mes Appels d'Offres</TabsTrigger>
            <TabsTrigger value="soumissions">Soumissions Reçues</TabsTrigger>
          </TabsList>
          <Button onClick={onCreateAO} className="gap-2">
            <Plus className="w-4 h-4" />
            Créer un AO
          </Button>
        </div>

        {/* Mes AO Tab */}
        <TabsContent value="mes-ao" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockManagedAOs.length}</p>
                  <p className="text-sm text-muted-foreground">Total AO</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <CheckCircle2 className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockManagedAOs.filter(ao => ao.status === "published").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Publiés</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Send className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockReceivedSubmissions.length}</p>
                  <p className="text-sm text-muted-foreground">Soumissions reçues</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/10">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockReceivedSubmissions.filter(s => s.status === "pending").length}
                  </p>
                  <p className="text-sm text-muted-foreground">À évaluer</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un appel d'offres..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* AO List */}
          <div className="space-y-4">
            {filteredAOs.map(ao => {
              const status = aoStatusConfig[ao.status];
              const StatusIcon = status.icon;
              const submissions = getSubmissionsForAO(ao.id);

              return (
                <Card key={ao.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          <Badge variant="outline">{ao.type}</Badge>
                          <Badge variant="outline">{ao.prestation}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold">{ao.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Réf: {ao.reference} • Créé le {new Date(ao.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Limite: {new Date(ao.deadline).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {ao.submissionsCount} soumissions
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="w-4 h-4" />
                            {ao.views} vues
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {ao.budgetMin && ao.budgetMax && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Budget</p>
                            <p className="font-semibold text-primary">
                              {(ao.budgetMin / 1000000).toFixed(0)}-{(ao.budgetMax / 1000000).toFixed(0)} M
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="w-4 h-4" />
                            Voir
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Edit className="w-4 h-4" />
                            Modifier
                          </Button>
                          {ao.status === "draft" && (
                            <Button size="sm" className="gap-1">
                              <Send className="w-4 h-4" />
                              Publier
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick submissions preview */}
                    {submissions.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Dernières soumissions</span>
                          <Button 
                            variant="link" 
                            size="sm"
                            onClick={() => setActiveTab("soumissions")}
                          >
                            Voir tout
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {submissions.slice(0, 3).map(sub => (
                            <div 
                              key={sub.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                            >
                              <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{sub.companyName}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-primary font-medium">
                                  {(sub.amount / 1000000).toFixed(1)} M
                                </span>
                                <Badge className={submissionStatusConfig[sub.status].color} variant="outline">
                                  {submissionStatusConfig[sub.status].label}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {filteredAOs.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Aucun appel d'offres</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Créez votre premier AO pour recevoir des soumissions
                  </p>
                  <Button onClick={onCreateAO} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Créer un AO
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Soumissions Reçues Tab */}
        <TabsContent value="soumissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Soumissions reçues</CardTitle>
              <CardDescription>
                Évaluez et comparez les offres reçues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Appel d'offres</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReceivedSubmissions.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sub.companyName}</p>
                          <p className="text-sm text-muted-foreground">{sub.contactEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{sub.aoTitle}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-primary">
                          {(sub.amount / 1000000).toFixed(1)} M FCFA
                        </p>
                      </TableCell>
                      <TableCell>
                        {sub.totalScore ? (
                          <div className="flex items-center gap-2">
                            <Progress value={sub.totalScore} className="h-2 w-16" />
                            <span className="text-sm font-medium">{sub.totalScore}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={submissionStatusConfig[sub.status].color}>
                          {submissionStatusConfig[sub.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setShowEvaluationDialog(true);
                            }}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Évaluer
                          </Button>
                          {sub.status === "shortlisted" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleAward(sub)}
                            >
                              <Award className="w-4 h-4 mr-1" />
                              Attribuer
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Evaluation Dialog */}
      <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Évaluer la soumission</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.companyName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Montant proposé</span>
                <span className="font-bold text-primary">
                  {selectedSubmission && (selectedSubmission.amount / 1000000).toFixed(1)} M FCFA
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Score technique (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluation.technicalScore}
                  onChange={e => setEvaluation(prev => ({ ...prev, technicalScore: e.target.value }))}
                  placeholder="85"
                />
              </div>
              <div className="space-y-2">
                <Label>Score financier (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluation.financialScore}
                  onChange={e => setEvaluation(prev => ({ ...prev, financialScore: e.target.value }))}
                  placeholder="78"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Décision</Label>
              <Select 
                value={evaluation.decision}
                onValueChange={v => setEvaluation(prev => ({ ...prev, decision: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shortlisted">Présélectionner</SelectItem>
                  <SelectItem value="rejected">Rejeter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes / Commentaires</Label>
              <Textarea
                placeholder="Observations sur cette soumission..."
                value={evaluation.notes}
                onChange={e => setEvaluation(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEvaluationDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleEvaluate}>
                Enregistrer l'évaluation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
