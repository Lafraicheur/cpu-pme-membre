import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Info,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BenchmarksProps {
  onBack: () => void;
}

const benchmarkData = [
  {
    category: "Performance commerciale",
    metrics: [
      { 
        label: "Ventes mensuelles", 
        yourValue: "2.4M FCFA", 
        median: "1.8M FCFA", 
        percentile: 72,
        trend: "above"
      },
      { 
        label: "Panier moyen", 
        yourValue: "22,600 FCFA", 
        median: "25,000 FCFA", 
        percentile: 45,
        trend: "below"
      },
      { 
        label: "Taux de conversion", 
        yourValue: "3.2%", 
        median: "2.8%", 
        percentile: 65,
        trend: "above"
      },
    ],
  },
  {
    category: "Appels d'offres",
    metrics: [
      { 
        label: "Taux de succès AO", 
        yourValue: "67%", 
        median: "45%", 
        percentile: 85,
        trend: "above"
      },
      { 
        label: "Délai réponse moyen", 
        yourValue: "5 jours", 
        median: "7 jours", 
        percentile: 70,
        trend: "above"
      },
    ],
  },
  {
    category: "Qualité & Conformité",
    metrics: [
      { 
        label: "Score KYC", 
        yourValue: "100%", 
        median: "85%", 
        percentile: 95,
        trend: "above"
      },
      { 
        label: "Certifications actives", 
        yourValue: "3", 
        median: "2", 
        percentile: 68,
        trend: "above"
      },
      { 
        label: "Taux litiges", 
        yourValue: "2.1%", 
        median: "3.5%", 
        percentile: 75,
        trend: "above"
      },
    ],
  },
  {
    category: "Formation & Compétences",
    metrics: [
      { 
        label: "Heures formation/an", 
        yourValue: "24h", 
        median: "18h", 
        percentile: 65,
        trend: "above"
      },
      { 
        label: "Taux complétion", 
        yourValue: "68%", 
        median: "72%", 
        percentile: 48,
        trend: "below"
      },
    ],
  },
];

export function Benchmarks({ onBack }: BenchmarksProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "above":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "below":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 70) return "text-green-500";
    if (percentile >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (percentile: number) => {
    if (percentile >= 70) return "bg-green-500";
    if (percentile >= 40) return "bg-yellow-500";
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
          <h1 className="text-2xl font-bold tracking-tight">Benchmarks</h1>
          <p className="text-muted-foreground">Comparez-vous à votre filière et région</p>
        </div>
      </div>

      {/* Info Banner */}
      <Alert className="bg-muted/50 border-muted">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Les comparatifs sont basés sur des données <strong>agrégées et anonymisées</strong> de votre filière (Agroalimentaire) 
          et région (Abidjan). Aucune donnée individuelle d'autres entreprises n'est révélée.
        </AlertDescription>
      </Alert>

      {/* Global Position */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Position globale dans votre filière</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">Top 25%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Basé sur 12 indicateurs clés de performance
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">8</p>
                <p className="text-xs text-muted-foreground">Au-dessus médiane</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">4</p>
                <p className="text-xs text-muted-foreground">En-dessous médiane</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benchmark Categories */}
      <div className="grid gap-6">
        {benchmarkData.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle className="text-lg">{category.category}</CardTitle>
              <CardDescription>Comparaison avec la médiane de votre filière</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {category.metrics.map((metric, metricIndex) => (
                  <div key={metricIndex} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(metric.trend)}
                        <span className="font-medium">{metric.label}</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Médiane filière : {metric.median}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{metric.yourValue}</Badge>
                        <span className={`text-sm font-medium ${getPercentileColor(metric.percentile)}`}>
                          P{metric.percentile}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={metric.percentile} className="h-2" />
                      <div 
                        className="absolute top-0 h-2 w-0.5 bg-foreground" 
                        style={{ left: "50%" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Min</span>
                      <span>Médiane</span>
                      <span>Max</span>
                    </div>
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
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Axes d'amélioration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { 
                metric: "Panier moyen", 
                current: "22,600 FCFA", 
                target: "25,000 FCFA", 
                action: "Optimiser le cross-selling" 
              },
              { 
                metric: "Taux complétion formation", 
                current: "68%", 
                target: "80%", 
                action: "Encourager la finalisation des parcours" 
              },
            ].map((rec, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium">{rec.metric}</p>
                  <p className="text-sm text-muted-foreground">
                    {rec.current} → {rec.target}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{rec.action}</p>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    Voir comment
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
