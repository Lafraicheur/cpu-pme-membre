import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  FileText,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Calendar,
  DollarSign,
  Building2,
  ChevronRight,
  Download,
  MessageSquare,
  TrendingUp,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SubmissionStatus = 
  | "draft" 
  | "submitted" 
  | "under_review" 
  | "shortlisted" 
  | "interview" 
  | "awarded" 
  | "rejected";

interface Submission {
  id: string;
  aoId: string;
  aoTitle: string;
  aoReference: string;
  organization: string;
  status: SubmissionStatus;
  submittedAt: string;
  amount: number;
  deadline: string;
  notes?: string;
  score?: number;
  ranking?: number;
  totalSubmissions?: number;
  nextStep?: string;
  nextStepDate?: string;
}

const mockSubmissions: Submission[] = [
  {
    id: "SOUM-001",
    aoId: "AO-2024-BTP-001",
    aoTitle: "Construction de 5 salles de classe à Bouaké",
    aoReference: "AO-2024-BTP-001",
    organization: "Ministère de l'Éducation Nationale",
    status: "under_review",
    submittedAt: "2024-01-12",
    amount: 68000000,
    deadline: "2024-02-15",
    score: 78,
    ranking: 3,
    totalSubmissions: 12,
    nextStep: "Évaluation technique",
    nextStepDate: "2024-01-25",
  },
  {
    id: "SOUM-002",
    aoId: "AO-2024-NUM-003",
    aoTitle: "Développement d'une application mobile de suivi agricole",
    aoReference: "AO-2024-NUM-003",
    organization: "Conseil Café-Cacao",
    status: "shortlisted",
    submittedAt: "2024-01-15",
    amount: 35000000,
    deadline: "2024-02-28",
    score: 85,
    ranking: 2,
    totalSubmissions: 15,
    nextStep: "Présentation orale",
    nextStepDate: "2024-02-05",
  },
  {
    id: "SOUM-003",
    aoId: "AO-2024-AGR-002",
    aoTitle: "Fourniture de 500 tonnes d'engrais NPK",
    aoReference: "AO-2024-AGR-002",
    organization: "ANADER",
    status: "submitted",
    submittedAt: "2024-01-18",
    amount: 125000000,
    deadline: "2024-02-01",
  },
  {
    id: "SOUM-004",
    aoId: "AO-2023-TRA-010",
    aoTitle: "Transport de marchandises zone portuaire",
    aoReference: "AO-2023-TRA-010",
    organization: "PAA",
    status: "rejected",
    submittedAt: "2023-12-10",
    amount: 250000000,
    deadline: "2024-01-05",
    notes: "Offre technique insuffisante - références non conformes",
  },
  {
    id: "SOUM-005",
    aoId: "AO-2023-BTP-008",
    aoTitle: "Réhabilitation de bâtiments administratifs",
    aoReference: "AO-2023-BTP-008",
    organization: "Ministère de la Construction",
    status: "awarded",
    submittedAt: "2023-11-20",
    amount: 180000000,
    deadline: "2023-12-15",
    score: 92,
    ranking: 1,
    totalSubmissions: 8,
  },
];

const statusConfig: Record<SubmissionStatus, { 
  label: string; 
  color: string; 
  icon: typeof Clock;
  description: string;
}> = {
  draft: {
    label: "Brouillon",
    color: "bg-muted text-muted-foreground",
    icon: FileText,
    description: "En cours de rédaction",
  },
  submitted: {
    label: "Soumise",
    color: "bg-blue-500/10 text-blue-600",
    icon: CheckCircle2,
    description: "En attente d'évaluation",
  },
  under_review: {
    label: "En évaluation",
    color: "bg-amber-500/10 text-amber-600",
    icon: Clock,
    description: "Évaluation en cours",
  },
  shortlisted: {
    label: "Présélectionné",
    color: "bg-primary/10 text-primary",
    icon: Target,
    description: "Retenu pour la suite",
  },
  interview: {
    label: "Entretien",
    color: "bg-purple-500/10 text-purple-600",
    icon: MessageSquare,
    description: "Convoqué pour présentation",
  },
  awarded: {
    label: "Attribué",
    color: "bg-secondary/10 text-secondary",
    icon: Award,
    description: "Marché remporté !",
  },
  rejected: {
    label: "Non retenu",
    color: "bg-destructive/10 text-destructive",
    icon: XCircle,
    description: "Offre non retenue",
  },
};

export function MesSoumissions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const filteredSubmissions = mockSubmissions.filter(sub => {
    const matchesSearch = 
      sub.aoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeSubmissions = mockSubmissions.filter(s => 
    ["submitted", "under_review", "shortlisted", "interview"].includes(s.status)
  );
  const wonSubmissions = mockSubmissions.filter(s => s.status === "awarded");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockSubmissions.length}</p>
              <p className="text-sm text-muted-foreground">Total soumissions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeSubmissions.length}</p>
              <p className="text-sm text-muted-foreground">En cours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary/10">
              <Award className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{wonSubmissions.length}</p>
              <p className="text-sm text-muted-foreground">Marchés gagnés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {((wonSubmissions.length / mockSubmissions.length) * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-muted-foreground">Taux de succès</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, organisation..."
                className="pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map(submission => {
          const status = statusConfig[submission.status];
          const StatusIcon = status.icon;
          
          return (
            <Card 
              key={submission.id} 
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedSubmission(submission)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Réf: {submission.aoReference}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {submission.aoTitle}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {submission.organization}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Soumis le {new Date(submission.submittedAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Montant</p>
                      <p className="font-semibold text-primary">
                        {(submission.amount / 1000000).toFixed(1)} M FCFA
                      </p>
                    </div>
                    
                    {submission.ranking && (
                      <div className="text-center px-4 py-2 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground">Classement</p>
                        <p className="text-lg font-bold">
                          #{submission.ranking}
                          <span className="text-xs text-muted-foreground font-normal">
                            /{submission.totalSubmissions}
                          </span>
                        </p>
                      </div>
                    )}

                    <Button variant="ghost" size="icon">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Progress info for active submissions */}
                {submission.nextStep && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Prochaine étape: <span className="font-medium text-foreground">{submission.nextStep}</span>
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(submission.nextStepDate!).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Rejection reason */}
                {submission.status === "rejected" && submission.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{submission.notes}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredSubmissions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Aucune soumission trouvée</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSubmission.aoTitle}</DialogTitle>
                <DialogDescription>
                  Réf: {selectedSubmission.aoReference} • {selectedSubmission.organization}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-4">
                  <Badge className={statusConfig[selectedSubmission.status].color}>
                    {React.createElement(statusConfig[selectedSubmission.status].icon, { className: "w-3 h-3 mr-1" })}
                    {statusConfig[selectedSubmission.status].label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {statusConfig[selectedSubmission.status].description}
                  </span>
                </div>

                {/* Score & Ranking */}
                {selectedSubmission.score && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Score d'évaluation</span>
                        <span className="font-bold text-lg">{selectedSubmission.score}/100</span>
                      </div>
                      <Progress value={selectedSubmission.score} className="h-2" />
                      {selectedSubmission.ranking && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Classé {selectedSubmission.ranking}ème sur {selectedSubmission.totalSubmissions} soumissions
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Details */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Montant proposé</p>
                    <p className="text-xl font-bold text-primary">
                      {(selectedSubmission.amount / 1000000).toFixed(1)} M FCFA
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Date de soumission</p>
                    <p className="text-xl font-bold">
                      {new Date(selectedSubmission.submittedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                {/* Next Step */}
                {selectedSubmission.nextStep && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="font-medium">Prochaine étape</span>
                    </div>
                    <p className="text-foreground">{selectedSubmission.nextStep}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Prévu le {new Date(selectedSubmission.nextStepDate!).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Eye className="w-4 h-4" />
                    Voir l'AO
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    Télécharger ma soumission
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
