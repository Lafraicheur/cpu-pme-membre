import { useState } from "react";
import { 
  ArrowLeft, 
  BarChart3, 
  ShoppingCart, 
  FileCheck, 
  GraduationCap, 
  Wallet, 
  Rocket, 
  Calendar,
  Shield,
  Filter,
  Download
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DataHubDashboardsProps {
  onBack: () => void;
}

// Mock data for charts
const salesData = [
  { month: "Jan", ventes: 180000, commandes: 12 },
  { month: "Fév", ventes: 220000, commandes: 15 },
  { month: "Mar", ventes: 195000, commandes: 11 },
  { month: "Avr", ventes: 280000, commandes: 18 },
  { month: "Mai", ventes: 310000, commandes: 22 },
  { month: "Juin", ventes: 420000, commandes: 28 },
];

const aoData = [
  { status: "Soumis", count: 12, color: "hsl(var(--primary))" },
  { status: "En attente", count: 5, color: "hsl(var(--muted-foreground))" },
  { status: "Gagnés", count: 8, color: "hsl(142, 76%, 36%)" },
  { status: "Perdus", count: 4, color: "hsl(var(--destructive))" },
];

const formationData = [
  { formation: "Digital", heures: 12, completion: 100 },
  { formation: "Export", heures: 8, completion: 75 },
  { formation: "Qualité", heures: 6, completion: 50 },
  { formation: "Finance", heures: 4, completion: 25 },
];

const chartConfig = {
  ventes: { label: "Ventes (FCFA)", color: "hsl(var(--primary))" },
  commandes: { label: "Commandes", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function DataHubDashboards({ onBack }: DataHubDashboardsProps) {
  const [period, setPeriod] = useState("30j");
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboards</h1>
            <p className="text-muted-foreground">Analyses détaillées par module</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7j">7 jours</SelectItem>
              <SelectItem value="30j">30 jours</SelectItem>
              <SelectItem value="90j">90 jours</SelectItem>
              <SelectItem value="12m">12 mois</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="general" className="gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Général</span>
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="gap-1">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Marketplace</span>
          </TabsTrigger>
          <TabsTrigger value="ao" className="gap-1">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">AO</span>
          </TabsTrigger>
          <TabsTrigger value="formation" className="gap-1">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Formation</span>
          </TabsTrigger>
          <TabsTrigger value="financement" className="gap-1">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Finance</span>
          </TabsTrigger>
          <TabsTrigger value="incubateur" className="gap-1">
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Incubateur</span>
          </TabsTrigger>
          <TabsTrigger value="evenements" className="gap-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="conformite" className="gap-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Qualité</span>
          </TabsTrigger>
        </TabsList>

        {/* General Dashboard */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Chiffre d'affaires" value="2.4M FCFA" change="+12%" positive />
            <StatCard title="Commandes" value="106" change="+8%" positive />
            <StatCard title="AO gagnés" value="8" change="+2" positive />
            <StatCard title="Score qualité" value="72%" change="-3%" positive={false} />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Évolution des ventes</CardTitle>
              <CardDescription>Ventes et commandes sur la période</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={salesData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="ventes" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketplace Dashboard */}
        <TabsContent value="marketplace" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Ventes totales" value="2.4M FCFA" change="+12%" positive />
            <StatCard title="Commandes" value="106" change="+8%" positive />
            <StatCard title="Panier moyen" value="22,600 FCFA" change="+5%" positive />
            <StatCard title="Taux conversion" value="3.2%" change="+0.4%" positive />
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ventes mensuelles</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <LineChart data={salesData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="ventes" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top produits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Cacao Bio Premium", sales: "450,000 FCFA", qty: 45 },
                    { name: "Café Robusta", sales: "320,000 FCFA", qty: 32 },
                    { name: "Noix de Cajou", sales: "280,000 FCFA", qty: 28 },
                  ].map((product, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.qty} unités vendues</p>
                      </div>
                      <Badge variant="secondary">{product.sales}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AO Dashboard */}
        <TabsContent value="ao" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="AO soumis" value="12" change="+3" positive />
            <StatCard title="Taux succès" value="67%" change="+5%" positive />
            <StatCard title="Montant gagné" value="45M FCFA" change="+22%" positive />
            <StatCard title="En attente" value="5" change="0" positive />
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des AO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={aoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {aoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {aoData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.status}: {item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>AO récents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "AO-2024-089", org: "MINADER", status: "Gagné", amount: "15M FCFA" },
                    { name: "AO-2024-092", org: "Port Autonome", status: "En attente", amount: "8M FCFA" },
                    { name: "AO-2024-095", org: "SOTRA", status: "Soumis", amount: "12M FCFA" },
                  ].map((ao, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{ao.name}</p>
                        <p className="text-sm text-muted-foreground">{ao.org}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={ao.status === "Gagné" ? "default" : "secondary"}>{ao.status}</Badge>
                        <p className="text-sm font-medium mt-1">{ao.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Formation Dashboard */}
        <TabsContent value="formation" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Heures suivies" value="24h" change="+8h" positive />
            <StatCard title="Formations actives" value="4" change="+1" positive />
            <StatCard title="Certifications" value="2" change="+1" positive />
            <StatCard title="Taux complétion" value="68%" change="+12%" positive />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Progression par formation</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={formationData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="formation" type="category" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completion" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholder tabs */}
        {["financement", "incubateur", "evenements", "conformite"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Dashboard {tab} en construction</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  change, 
  positive 
}: { 
  title: string; 
  value: string; 
  change: string; 
  positive: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex items-end justify-between mt-1">
          <p className="text-2xl font-bold">{value}</p>
          <Badge variant={positive ? "default" : "destructive"} className="text-xs">
            {change}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
