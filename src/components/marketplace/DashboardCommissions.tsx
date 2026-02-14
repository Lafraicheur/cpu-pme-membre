import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Star,
  Sparkles,
  Crown,
  Eye,
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";

const revenusParMois = [
  { mois: "Août", commissions: 45000, ventes: 850000, vedette: 32000 },
  { mois: "Sep", commissions: 52000, ventes: 920000, vedette: 41000 },
  { mois: "Oct", commissions: 38000, ventes: 780000, vedette: 28000 },
  { mois: "Nov", commissions: 67000, ventes: 1100000, vedette: 55000 },
  { mois: "Déc", commissions: 89000, ventes: 1450000, vedette: 72000 },
  { mois: "Jan", commissions: 102000, ventes: 1680000, vedette: 85000 },
];

const performanceProduits = [
  { nom: "Cacao Premium", vues: 1250, clics: 340, commandes: 45, revenu: 850000, type: "premium" as const, roi: 320 },
  { nom: "Attiéké séché", vues: 890, clics: 210, commandes: 32, revenu: 420000, type: "vedette" as const, roi: 280 },
  { nom: "Huile de palme", vues: 650, clics: 180, commandes: 28, revenu: 380000, type: "special" as const, roi: 190 },
  { nom: "Beurre de karité", vues: 420, clics: 95, commandes: 12, revenu: 180000, type: "vedette" as const, roi: 150 },
  { nom: "Café torréfié", vues: 380, clics: 88, commandes: 10, revenu: 150000, type: "premium" as const, roi: 210 },
];

const repartitionTypes = [
  { name: "Vedette (5%)", value: 35, color: "hsl(45, 93%, 47%)" },
  { name: "Spécial (8%)", value: 30, color: "hsl(270, 70%, 60%)" },
  { name: "Premium (12%)", value: 35, color: "hsl(var(--primary))" },
];

const typeVedetteConfig = {
  vedette: { label: "Vedette", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
  special: { label: "Spécial", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10" },
  premium: { label: "Premium", icon: Crown, color: "text-primary", bg: "bg-primary/10" },
};

export function DashboardCommissions() {
  const [periode, setPeriode] = useState("6mois");

  const kpis = {
    totalCommissions: 393000,
    evolutionCommissions: 14.6,
    totalVedetteRevenu: 313000,
    evolutionVedette: 18.1,
    produitsEnVedette: 5,
    roiMoyen: 230,
    tauxConversion: 12.8,
    vuesMoyennes: 718,
  };

  return (
    <div className="space-y-6">
      {/* Période */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Dashboard Commissions & Vedette
          </h2>
          <p className="text-sm text-muted-foreground">Suivi des revenus et performances de vos produits en vedette</p>
        </div>
        <Select value={periode} onValueChange={setPeriode}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1mois">Dernier mois</SelectItem>
            <SelectItem value="3mois">3 derniers mois</SelectItem>
            <SelectItem value="6mois">6 derniers mois</SelectItem>
            <SelectItem value="1an">1 an</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total commissions</p>
                  <p className="text-2xl font-bold text-primary">{kpis.totalCommissions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 gap-1">
                <TrendingUp className="w-3 h-3" />
                +{kpis.evolutionCommissions}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenus vedette</p>
                  <p className="text-2xl font-bold text-amber-500">{kpis.totalVedetteRevenu.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 gap-1">
                <TrendingUp className="w-3 h-3" />
                +{kpis.evolutionVedette}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ROI moyen vedette</p>
                <p className="text-2xl font-bold text-green-500">{kpis.roiMoyen}%</p>
                <Progress value={Math.min(kpis.roiMoyen / 5, 100)} className="h-1.5 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux conversion</p>
                <p className="text-2xl font-bold text-blue-500">{kpis.tauxConversion}%</p>
                <p className="text-xs text-muted-foreground">{kpis.vuesMoyennes} vues moy./produit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenus" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenus">Revenus</TabsTrigger>
          <TabsTrigger value="produits">Produits vedette</TabsTrigger>
          <TabsTrigger value="repartition">Répartition</TabsTrigger>
        </TabsList>

        {/* Onglet Revenus */}
        <TabsContent value="revenus" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Évolution des revenus</CardTitle>
                <CardDescription>Commissions et revenus vedette par mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenusParMois}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="mois" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number) => `${value.toLocaleString()} FCFA`}
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                      />
                      <Area type="monotone" dataKey="vedette" stackId="1" stroke="hsl(45, 93%, 47%)" fill="hsl(45, 93%, 47%)" fillOpacity={0.3} name="Vedette" />
                      <Area type="monotone" dataKey="commissions" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Commissions" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ventes générées par les vedettes</CardTitle>
                <CardDescription>Impact des mises en vedette sur les ventes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenusParMois}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="mois" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                      <Tooltip
                        formatter={(value: number) => `${value.toLocaleString()} FCFA`}
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                      />
                      <Bar dataKey="ventes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Ventes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Produits Vedette */}
        <TabsContent value="produits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Performance des produits en vedette
              </CardTitle>
              <CardDescription>Analyse détaillée par produit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceProduits.map((produit, idx) => {
                  const config = typeVedetteConfig[produit.type];
                  const TypeIcon = config.icon;
                  const tauxConversion = ((produit.commandes / produit.clics) * 100).toFixed(1);

                  return (
                    <div key={idx} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", config.bg)}>
                            <TypeIcon className={cn("w-5 h-5", config.color)} />
                          </div>
                          <div>
                            <p className="font-semibold">{produit.nom}</p>
                            <Badge variant="outline" className={cn("text-xs", config.color)}>
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{produit.revenu.toLocaleString()} FCFA</p>
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs gap-1">
                            ROI {produit.roi}%
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Vues</span>
                          </div>
                          <p className="font-bold">{produit.vues.toLocaleString()}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Clics</span>
                          </div>
                          <p className="font-bold">{produit.clics}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-center gap-1">
                            <ShoppingCart className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Commandes</span>
                          </div>
                          <p className="font-bold">{produit.commandes}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-center gap-1">
                            <Target className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Conversion</span>
                          </div>
                          <p className="font-bold">{tauxConversion}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Répartition */}
        <TabsContent value="repartition" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Répartition par type de mise en vedette</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={repartitionTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {repartitionTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Résumé des commissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Vedette (5%)", montant: 137550, pct: 35, color: "bg-amber-500", textColor: "text-amber-500" },
                  { label: "Spécial (8%)", montant: 117900, pct: 30, color: "bg-purple-500", textColor: "text-purple-500" },
                  { label: "Premium (12%)", montant: 137550, pct: 35, color: "bg-primary", textColor: "text-primary" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={cn("font-medium", item.textColor)}>{item.label}</span>
                      <span className="font-bold">{item.montant.toLocaleString()} FCFA</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={cn("h-2 rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total commissions période</span>
                    <span className="text-xl font-bold text-primary">{kpis.totalCommissions.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
