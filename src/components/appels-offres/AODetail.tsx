import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Users,
  Eye,
  DollarSign,
  FileText,
  Download,
  Heart,
  Share2,
  AlertCircle,
  CheckCircle2,
  Send,
  Layers,
  Award,
} from "lucide-react";

interface AppelOffre {
  id: string;
  title: string;
  reference: string;
  organization: string;
  type: string;
  prestation: string;
  sector: string;
  location: string;
  budgetMin?: number;
  budgetMax?: number;
  deadline: string;
  startDate?: string;
  status: "open" | "closing_soon" | "closed" | "awarded";
  description: string;
  submissions: number;
  views: number;
  createdAt: string;
  requirements?: string[];
  documents?: string[];
  contactName?: string;
  contactEmail?: string;
}

interface AODetailProps {
  ao: AppelOffre;
  onBack: () => void;
  onSubmit: () => void;
}

const statusConfig = {
  open: { color: "bg-secondary text-secondary-foreground", label: "Ouvert", icon: CheckCircle2 },
  closing_soon: { color: "bg-primary text-primary-foreground", label: "Clôture proche", icon: AlertCircle },
  closed: { color: "bg-muted text-muted-foreground", label: "Clôturé", icon: Clock },
  awarded: { color: "bg-blue-500 text-white", label: "Attribué", icon: Award },
};

export function AODetail({ ao, onBack, onSubmit }: AODetailProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const status = statusConfig[ao.status];
  const StatusIcon = status.icon;

  const daysRemaining = Math.ceil(
    (new Date(ao.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const mockRequirements = ao.requirements || [
    "Être une entreprise légalement constituée en Côte d'Ivoire",
    "Disposer d'une expérience minimum de 3 ans dans le domaine",
    "Avoir réalisé au moins 2 projets similaires",
    "Disposer du personnel qualifié requis",
    "Être à jour de ses obligations fiscales et sociales",
  ];

  const mockDocuments = ao.documents || [
    "RCCM",
    "Attestation fiscale",
    "Attestation CNPS",
    "Références techniques",
    "Offre technique",
    "Offre financière",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge className={status.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
            <Badge variant="outline">{ao.type}</Badge>
            <Badge variant="outline">{ao.prestation}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{ao.title}</h1>
          <p className="text-muted-foreground">Réf: {ao.reference}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
          {(ao.status === "open" || ao.status === "closing_soon") && (
            <Button onClick={onSubmit} className="gap-2">
              <Send className="w-4 h-4" />
              Soumettre
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="description" className="space-y-4">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="exigences">Exigences</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Description du besoin</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {ao.description}
                  </p>
                  <Separator className="my-6" />
                  <h3 className="font-semibold mb-4">Informations complémentaires</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Organisation</p>
                        <p className="font-medium">{ao.organization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Localisation</p>
                        <p className="font-medium">{ao.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Layers className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Secteur</p>
                        <p className="font-medium">{ao.sector}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Publié le</p>
                        <p className="font-medium">
                          {new Date(ao.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exigences">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Critères d'éligibilité</h3>
                  <ul className="space-y-3">
                    {mockRequirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Documents requis</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {mockDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="flex-1">{doc}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-6" />
                  <h3 className="font-semibold mb-4">Dossier de consultation</h3>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Télécharger le DCE
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget Card */}
          {ao.budgetMin && ao.budgetMax && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Budget estimatif</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {(ao.budgetMin / 1000000).toFixed(0)} - {(ao.budgetMax / 1000000).toFixed(0)} M FCFA
                </p>
              </CardContent>
            </Card>
          )}

          {/* Deadline Card */}
          <Card className={daysRemaining <= 7 ? "border-primary/50" : ""}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium">Date limite</span>
              </div>
              <p className="text-2xl font-bold">
                {new Date(ao.deadline).toLocaleDateString("fr-FR")}
              </p>
              {daysRemaining > 0 ? (
                <p className={`text-sm mt-1 ${daysRemaining <= 7 ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {daysRemaining <= 7 ? "⚠️ " : ""}
                  {daysRemaining} jour{daysRemaining > 1 ? "s" : ""} restant{daysRemaining > 1 ? "s" : ""}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">Délai expiré</p>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>Soumissions</span>
                </div>
                <span className="font-semibold">{ao.submissions}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="w-5 h-5" />
                  <span>Vues</span>
                </div>
                <span className="font-semibold">{ao.views}</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{ao.contactName || ao.organization}</p>
              <p className="text-sm text-muted-foreground">
                {ao.contactEmail || "contact@organisation.ci"}
              </p>
              <Button variant="outline" className="w-full mt-4">
                Poser une question
              </Button>
            </CardContent>
          </Card>

          {/* CTA */}
          {(ao.status === "open" || ao.status === "closing_soon") && (
            <Button onClick={onSubmit} className="w-full gap-2" size="lg">
              <Send className="w-5 h-5" />
              Soumettre ma candidature
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
