import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ArrowRight,
  Building2,
  Shield,
  ShoppingCart,
  FileText,
  Users
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface DataQualityProps {
  onBack: () => void;
}

const qualityScores = [
  { 
    category: "Profil entreprise", 
    score: 85, 
    icon: Building2,
    items: [
      { label: "Informations générales", status: "complete" },
      { label: "Logo et visuels", status: "complete" },
      { label: "Description activité", status: "complete" },
      { label: "Coordonnées bancaires", status: "missing" },
    ],
    actionLabel: "Compléter profil",
    actionPath: "/mon-entreprise"
  },
  { 
    category: "KYC & Conformité", 
    score: 100, 
    icon: Shield,
    items: [
      { label: "Registre de commerce", status: "complete" },
      { label: "Documents fiscaux", status: "complete" },
      { label: "Attestations", status: "complete" },
    ],
    actionLabel: "Voir KYC",
    actionPath: "/kyc"
  },
  { 
    category: "Catalogue produits", 
    score: 65, 
    icon: ShoppingCart,
    items: [
      { label: "Fiches produits", status: "partial", detail: "12/18 complètes" },
      { label: "Photos produits", status: "partial", detail: "8 manquantes" },
      { label: "Certifications produits", status: "missing" },
      { label: "Tarification", status: "complete" },
    ],
    actionLabel: "Gérer catalogue",
    actionPath: "/marketplace"
  },
  { 
    category: "Capacités & Filières", 
    score: 40, 
    icon: FileText,
    items: [
      { label: "Filière principale (N1)", status: "complete" },
      { label: "Sous-filière (N2/N3)", status: "missing" },
      { label: "Capacité de production", status: "missing" },
      { label: "Zones de couverture", status: "partial" },
    ],
    actionLabel: "Définir capacités",
    actionPath: "/mon-entreprise"
  },
  { 
    category: "Équipe & Rôles", 
    score: 50, 
    icon: Users,
    items: [
      { label: "Administrateur principal", status: "complete" },
      { label: "Contacts commerciaux", status: "missing" },
      { label: "Rôles définis", status: "partial" },
    ],
    actionLabel: "Gérer équipe",
    actionPath: "/mon-entreprise"
  },
];

const expiringItems = [
  { label: "Certificat ISO 22000", expiresIn: "45 jours", type: "warning" },
  { label: "Attestation CNPS", expiresIn: "12 jours", type: "danger" },
  { label: "Licence d'exportation", expiresIn: "90 jours", type: "info" },
];

export function DataQuality({ onBack }: DataQualityProps) {
  const globalScore = Math.round(
    qualityScores.reduce((acc, curr) => acc + curr.score, 0) / qualityScores.length
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Qualité des données</h1>
          <p className="text-muted-foreground">Diagnostic et recommandations</p>
        </div>
      </div>

      {/* Global Score */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Score global de complétude</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold ${getScoreColor(globalScore)}`}>
                  {globalScore}%
                </span>
                <span className="text-muted-foreground">/ 100%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Améliorez votre score pour optimiser votre visibilité sur le Hub
              </p>
            </div>
            <div className="hidden md:block w-48">
              <Progress value={globalScore} className="h-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expiring Items */}
      {expiringItems.length > 0 && (
        <Card className="border-yellow-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Documents à renouveler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {item.type === "danger" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    {item.type === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                    {item.type === "info" && <AlertTriangle className="h-5 w-5 text-blue-500" />}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <Badge variant={item.type === "danger" ? "destructive" : "secondary"}>
                    Expire dans {item.expiresIn}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Scores */}
      <div className="grid gap-4 md:grid-cols-2">
        {qualityScores.map((category, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{category.category}</CardTitle>
                    <CardDescription>
                      <span className={`font-medium ${getScoreColor(category.score)}`}>
                        {category.score}% complet
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  {category.actionLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Progress 
                value={category.score} 
                className={`h-2 mb-4 [&>div]:${getProgressColor(category.score)}`} 
              />
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {item.status === "complete" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {item.status === "partial" && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      {item.status === "missing" && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>{item.label}</span>
                    </div>
                    {item.detail && (
                      <span className="text-muted-foreground text-xs">{item.detail}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Actions recommandées</CardTitle>
          <CardDescription>Priorisez ces actions pour améliorer votre score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { priority: "Haute", action: "Compléter les sous-filières (N2/N3)", impact: "+15%" },
              { priority: "Haute", action: "Définir la capacité de production", impact: "+10%" },
              { priority: "Moyenne", action: "Ajouter les photos produits manquantes", impact: "+8%" },
              { priority: "Moyenne", action: "Renseigner les coordonnées bancaires", impact: "+5%" },
            ].map((rec, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={rec.priority === "Haute" ? "destructive" : "secondary"}>
                    {rec.priority}
                  </Badge>
                  <span>{rec.action}</span>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500/50">
                  {rec.impact}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
