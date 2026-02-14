import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShoppingCart,
  FileCheck,
  GraduationCap,
  Wallet,
  Rocket,
  Calendar,
  Database,
  Download,
  Activity,
  Shield
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DataHubOverviewProps {
  onNavigateDashboards: () => void;
  onNavigateQuality: () => void;
  onNavigateReports: () => void;
  onNavigateBenchmarks: () => void;
  onNavigateInsights: () => void;
  onNavigateAudit: () => void;
  canExport: boolean;
}

// Mock KPI data
const kpiData = {
  marketplace: { value: "2.4M FCFA", trend: 12, label: "Ventes Marketplace" },
  ao: { value: "8", trend: -5, label: "AO en cours" },
  formation: { value: "24h", trend: 8, label: "Heures formation" },
  financement: { value: "3", trend: 0, label: "Dossiers actifs" },
  incubateur: { value: "Gate 2", trend: 100, label: "Progression" },
  evenements: { value: "5", trend: 25, label: "Événements inscrits" },
};

const alerts = [
  { type: "warning", message: "KYC expire dans 15 jours", action: "Renouveler", module: "KYC" },
  { type: "warning", message: "3 produits en rupture de stock", action: "Gérer stock", module: "Marketplace" },
  { type: "info", message: "AO MINADER clôture dans 48h", action: "Voir AO", module: "Appels d'offres" },
  { type: "success", message: "Certification ISO obtenue", action: "Voir détails", module: "Conformité" },
];

const quickActions = [
  { icon: BarChart3, label: "Dashboards", description: "Analyses détaillées", onClick: "dashboards" },
  { icon: FileText, label: "Rapports", description: "Bibliothèque rapports", onClick: "reports" },
  { icon: Database, label: "Qualité données", description: "Score complétude", onClick: "quality" },
  { icon: TrendingUp, label: "Benchmarks", description: "Comparatifs filière", onClick: "benchmarks" },
  { icon: Activity, label: "Insights", description: "Alertes & recommandations", onClick: "insights" },
  { icon: Shield, label: "Audit", description: "Traçabilité accès", onClick: "audit" },
];

export function DataHubOverview({
  onNavigateDashboards,
  onNavigateQuality,
  onNavigateReports,
  onNavigateBenchmarks,
  onNavigateInsights,
  onNavigateAudit,
  canExport,
}: DataHubOverviewProps) {
  const navigationMap: Record<string, () => void> = {
    dashboards: onNavigateDashboards,
    quality: onNavigateQuality,
    reports: onNavigateReports,
    benchmarks: onNavigateBenchmarks,
    insights: onNavigateInsights,
    audit: onNavigateAudit,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Hub</h1>
          <p className="text-muted-foreground">
            Vue 360° de vos activités sur le Hub CPU-PME
          </p>
        </div>
        <div className="flex gap-2">
          {canExport && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          )}
          <Button onClick={onNavigateDashboards}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Voir dashboards
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <Alert className="bg-muted/50 border-muted">
        <BarChart3 className="h-4 w-4" />
        <AlertDescription>
          <strong>Data Hub</strong> centralise vos données d'activité. Les exports avancés sont disponibles selon votre plan d'abonnement.
        </AlertDescription>
      </Alert>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KPICard
          icon={ShoppingCart}
          label={kpiData.marketplace.label}
          value={kpiData.marketplace.value}
          trend={kpiData.marketplace.trend}
        />
        <KPICard
          icon={FileCheck}
          label={kpiData.ao.label}
          value={kpiData.ao.value}
          trend={kpiData.ao.trend}
        />
        <KPICard
          icon={GraduationCap}
          label={kpiData.formation.label}
          value={kpiData.formation.value}
          trend={kpiData.formation.trend}
        />
        <KPICard
          icon={Wallet}
          label={kpiData.financement.label}
          value={kpiData.financement.value}
          trend={kpiData.financement.trend}
        />
        <KPICard
          icon={Rocket}
          label={kpiData.incubateur.label}
          value={kpiData.incubateur.value}
          trend={kpiData.incubateur.trend}
        />
        <KPICard
          icon={Calendar}
          label={kpiData.evenements.label}
          value={kpiData.evenements.value}
          trend={kpiData.evenements.trend}
        />
      </div>

      {/* Data Quality Score */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Qualité des données</CardTitle>
              <CardDescription>Complétude de votre profil entreprise</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onNavigateQuality}>
              Améliorer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Score global</span>
                  <span className="text-muted-foreground">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-4">
              <QualityIndicator label="Profil" score={85} />
              <QualityIndicator label="KYC" score={100} />
              <QualityIndicator label="Catalogue" score={65} />
              <QualityIndicator label="Capacités" score={40} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Alertes récentes</CardTitle>
              <Button variant="ghost" size="sm" onClick={onNavigateInsights}>
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {alert.type === "warning" && (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    {alert.type === "info" && (
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                    )}
                    {alert.type === "success" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.module}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    {alert.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accès rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigationMap[action.onClick]?.()}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Gating Notice */}
      {!canExport && (
        <Card className="border-dashed">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <Download className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Exports avancés</p>
                  <p className="text-sm text-muted-foreground">
                    Passez au plan Argent ou Or pour accéder aux exports XLSX et rapports détaillés
                  </p>
                </div>
              </div>
              <Button variant="outline">
                Voir les plans
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {trend !== 0 && (
            <Badge variant={trend > 0 ? "default" : "destructive"} className="text-xs">
              {trend > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(trend)}%
            </Badge>
          )}
        </div>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function QualityIndicator({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return "text-green-500";
    if (s >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
      <span className="text-sm">{label}</span>
      <span className={`font-medium ${getColor(score)}`}>{score}%</span>
    </div>
  );
}
