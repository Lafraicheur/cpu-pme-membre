import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  Users, 
  Calendar, 
  FileText, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  MapPin,
  Briefcase,
  Send,
  History,
  Settings,
  Plus,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

type AffiliationStatus = 
  | "None" 
  | "Declared" 
  | "PendingConfirmation" 
  | "Approved" 
  | "Rejected" 
  | "CancelledByMember" 
  | "RevokedByOrg" 
  | "Suspended" 
  | "Overridden";

interface Organization {
  id: string;
  name: string;
  type: "cooperative" | "federation" | "association";
  sector: string;
  region: string;
  memberCount: number;
  logo?: string;
}

interface Affiliation {
  id: string;
  organization: Organization;
  status: AffiliationStatus;
  role: string;
  sectors: string[];
  effectiveDate: string;
  requestDate?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

interface AffiliationOverviewProps {
  onDeclare: () => void;
  onChangeRequest: () => void;
  onViewHistory: () => void;
  onSettings: () => void;
  isAccountActive?: boolean;
}

const statusConfig: Record<AffiliationStatus, { label: string; color: string; icon: React.ElementType }> = {
  None: { label: "Aucune affiliation", color: "bg-muted text-muted-foreground", icon: Building2 },
  Declared: { label: "Brouillon", color: "bg-secondary text-secondary-foreground", icon: FileText },
  PendingConfirmation: { label: "En attente de confirmation", color: "bg-amber-500/20 text-amber-700", icon: Clock },
  Approved: { label: "Active", color: "bg-emerald-500/20 text-emerald-700", icon: CheckCircle2 },
  Rejected: { label: "Refusée", color: "bg-destructive/20 text-destructive", icon: XCircle },
  CancelledByMember: { label: "Annulée", color: "bg-muted text-muted-foreground", icon: XCircle },
  RevokedByOrg: { label: "Révoquée", color: "bg-destructive/20 text-destructive", icon: AlertTriangle },
  Suspended: { label: "Suspendue", color: "bg-orange-500/20 text-orange-700", icon: AlertTriangle },
  Overridden: { label: "Modifiée (Admin)", color: "bg-purple-500/20 text-purple-700", icon: RefreshCw },
};

// Mock data
const mockCurrentAffiliation: Affiliation = {
  id: "aff-1",
  organization: {
    id: "org-1",
    name: "Coopérative Agricole du Sud",
    type: "cooperative",
    sector: "Agriculture",
    region: "Abidjan",
    memberCount: 156,
  },
  status: "Approved",
  role: "Membre",
  sectors: ["Agriculture", "Agroalimentaire"],
  effectiveDate: "2024-01-15",
  requestDate: "2024-01-10",
  approvalDate: "2024-01-15",
};

const mockPendingRequest: Affiliation | null = null;

const suggestedOrganizations: Organization[] = [
  {
    id: "org-2",
    name: "Fédération des Industries Ivoiriennes",
    type: "federation",
    sector: "Industrie",
    region: "Abidjan",
    memberCount: 342,
  },
  {
    id: "org-3",
    name: "Association des Exportateurs",
    type: "association",
    sector: "Commerce International",
    region: "National",
    memberCount: 89,
  },
];

export function AffiliationOverview({ 
  onDeclare, 
  onChangeRequest, 
  onViewHistory, 
  onSettings,
  isAccountActive = true
}: AffiliationOverviewProps) {
  const [currentAffiliation] = useState<Affiliation | null>(mockCurrentAffiliation);
  const [pendingRequest] = useState<Affiliation | null>(mockPendingRequest);

  const StatusBadge = ({ status }: { status: AffiliationStatus }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge className={cn("gap-1", config.color)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Alert si compte non actif */}
      {!isAccountActive && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Compte non activé</AlertTitle>
          <AlertDescription>
            Activez votre compte (paiement) pour finaliser ou modifier votre affiliation.
          </AlertDescription>
        </Alert>
      )}

      {/* Info Banner */}
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertTitle>Affiliation ≠ Abonnement</AlertTitle>
        <AlertDescription>
          L'affiliation vous rattache à une organisation collective pour le reporting et l'animation de filière. 
          Elle n'accorde aucun accès gratuit aux modules.
        </AlertDescription>
      </Alert>

      {/* Current Affiliation Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Affiliation actuelle
              </CardTitle>
              <CardDescription>
                Votre rattachement à une organisation collective
              </CardDescription>
            </div>
            {currentAffiliation && (
              <StatusBadge status={currentAffiliation.status} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {currentAffiliation ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{currentAffiliation.organization.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="gap-1">
                      <Briefcase className="h-3 w-3" />
                      {currentAffiliation.organization.type === "cooperative" ? "Coopérative" : 
                       currentAffiliation.organization.type === "federation" ? "Fédération" : "Association"}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {currentAffiliation.organization.region}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      {currentAffiliation.organization.memberCount} membres
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Rôle</p>
                  <p className="font-medium">{currentAffiliation.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Filière(s)</p>
                  <p className="font-medium">{currentAffiliation.sectors.join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date d'effet</p>
                  <p className="font-medium">{new Date(currentAffiliation.effectiveDate).toLocaleDateString("fr-FR")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <StatusBadge status={currentAffiliation.status} />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={onChangeRequest} disabled={!isAccountActive}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Demander un changement
                </Button>
                <Button variant="outline" onClick={onViewHistory}>
                  <History className="mr-2 h-4 w-4" />
                  Historique
                </Button>
                <Button variant="outline" onClick={onSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Aucune affiliation active</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Rattachez votre entreprise à une coopérative, fédération ou association pour bénéficier du réseau et du reporting filière.
              </p>
              <Button onClick={onDeclare} disabled={!isAccountActive}>
                <Plus className="mr-2 h-4 w-4" />
                Déclarer une affiliation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Request Card */}
      {pendingRequest && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-amber-500" />
                Demande en cours
              </CardTitle>
              <StatusBadge status={pendingRequest.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{pendingRequest.organization.name}</p>
                <p className="text-sm text-muted-foreground">
                  Demande envoyée le {new Date(pendingRequest.requestDate!).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <Button variant="outline" size="sm">
                Annuler la demande
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Organizations */}
      {!currentAffiliation && suggestedOrganizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Organisations suggérées</CardTitle>
            <CardDescription>
              Basées sur votre filière et votre région
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestedOrganizations.map((org) => (
                <div 
                  key={org.id} 
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{org.sector}</span>
                        <span>•</span>
                        <span>{org.region}</span>
                        <span>•</span>
                        <span>{org.memberCount} membres</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={onDeclare}>
                    <Send className="mr-2 h-4 w-4" />
                    Demander
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {currentAffiliation?.status === "Approved" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.floor((Date.now() - new Date(currentAffiliation.effectiveDate).getTime()) / (1000 * 60 * 60 * 24 * 30))}
                  </p>
                  <p className="text-sm text-muted-foreground">Mois d'affiliation</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Opportunités reçues</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Événements filière</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
