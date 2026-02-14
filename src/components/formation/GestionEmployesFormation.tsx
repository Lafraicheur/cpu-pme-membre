import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, UserPlus, TrendingUp, Award, Target, Download, Send, 
  RefreshCw, MoreVertical, Calendar, FileText, Building2, Crown,
  Lock, CheckCircle, Clock, AlertTriangle, Filter, Search, Mail
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type SubscriptionTier = "bronze" | "silver" | "gold" | "platine";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  region: string;
  status: "active" | "invited" | "inactive";
  coursesAssigned: number;
  coursesCompleted: number;
  certificates: number;
  lastActivity: string;
}

interface AssignedCourse {
  id: string;
  employeeId: string;
  employeeName: string;
  courseName: string;
  progress: number;
  score: number | null;
  certified: boolean;
  deadline: string;
  status: "in_progress" | "completed" | "overdue" | "not_started";
}

const mockEmployees: Employee[] = [
  { id: "e1", name: "Kouadio Aya", email: "aya.k@entreprise.ci", department: "Achats", region: "Abidjan", status: "active", coursesAssigned: 3, coursesCompleted: 2, certificates: 2, lastActivity: "Aujourd'hui" },
  { id: "e2", name: "Traoré Ibrahim", email: "ibrahim.t@entreprise.ci", department: "Commercial", region: "Bouaké", status: "active", coursesAssigned: 2, coursesCompleted: 1, certificates: 1, lastActivity: "Hier" },
  { id: "e3", name: "Koné Mariam", email: "mariam.k@entreprise.ci", department: "Finance", region: "Abidjan", status: "active", coursesAssigned: 4, coursesCompleted: 3, certificates: 3, lastActivity: "Il y a 3 jours" },
  { id: "e4", name: "Bamba Moussa", email: "moussa.b@entreprise.ci", department: "Production", region: "San-Pédro", status: "invited", coursesAssigned: 0, coursesCompleted: 0, certificates: 0, lastActivity: "Jamais" },
  { id: "e5", name: "Coulibaly Fatou", email: "fatou.c@entreprise.ci", department: "RH", region: "Abidjan", status: "inactive", coursesAssigned: 1, coursesCompleted: 0, certificates: 0, lastActivity: "Il y a 30 jours" },
];

const mockAssignments: AssignedCourse[] = [
  { id: "a1", employeeId: "e1", employeeName: "Kouadio Aya", courseName: "Maîtriser les AO", progress: 100, score: 85, certified: true, deadline: "2025-12-31", status: "completed" },
  { id: "a2", employeeId: "e1", employeeName: "Kouadio Aya", courseName: "Négociation bancaire", progress: 65, score: null, certified: false, deadline: "2026-01-31", status: "in_progress" },
  { id: "a3", employeeId: "e2", employeeName: "Traoré Ibrahim", courseName: "Vente & Marketplace", progress: 100, score: 92, certified: true, deadline: "2025-12-15", status: "completed" },
  { id: "a4", employeeId: "e2", employeeName: "Traoré Ibrahim", courseName: "Export CEDEAO", progress: 30, score: null, certified: false, deadline: "2025-12-20", status: "overdue" },
  { id: "a5", employeeId: "e3", employeeName: "Koné Mariam", courseName: "Finance PME", progress: 100, score: 88, certified: true, deadline: "2025-11-30", status: "completed" },
];

const subscriptionLimits: Record<SubscriptionTier, { employees: number; reports: boolean }> = {
  bronze: { employees: 0, reports: false },
  silver: { employees: 5, reports: false },
  gold: { employees: 20, reports: true },
  platine: { employees: -1, reports: true }, // -1 = illimité
};

const topCompetences = [
  { name: "Appels d'offres", count: 8 },
  { name: "Vente & Commercial", count: 6 },
  { name: "Finance", count: 5 },
  { name: "Production & Qualité", count: 4 },
  { name: "Digital", count: 3 },
];

export function GestionEmployesFormation() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employees] = useState<Employee[]>(mockEmployees);
  const [assignments] = useState<AssignedCourse[]>(mockAssignments);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Simulated subscription
  const subscriptionTier: SubscriptionTier = "gold";
  const limits = subscriptionLimits[subscriptionTier];
  const activeEmployees = employees.filter(e => e.status === "active").length;
  const canAddMore = limits.employees === -1 || activeEmployees < limits.employees;

  // KPIs
  const totalActive = employees.filter(e => e.status === "active").length;
  const avgCompletion = Math.round(employees.filter(e => e.coursesAssigned > 0).reduce((acc, e) => acc + (e.coursesCompleted / e.coursesAssigned * 100), 0) / employees.filter(e => e.coursesAssigned > 0).length) || 0;
  const totalCertificates = employees.reduce((acc, e) => acc + e.certificates, 0);

  const getStatusBadge = (status: Employee["status"]) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500">Actif</Badge>;
      case "invited": return <Badge variant="outline" className="border-amber-500 text-amber-500">Invité</Badge>;
      case "inactive": return <Badge variant="secondary">Inactif</Badge>;
    }
  };

  const getCourseStatusBadge = (status: AssignedCourse["status"]) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500">Terminé</Badge>;
      case "in_progress": return <Badge variant="outline" className="border-blue-500 text-blue-500">En cours</Badge>;
      case "overdue": return <Badge variant="destructive">En retard</Badge>;
      case "not_started": return <Badge variant="secondary">Non démarré</Badge>;
    }
  };

  const passerelles = [
    { title: "Former l'équipe Achats", description: "Préparer aux AO publics", module: "AO", icon: Target },
    { title: "Former l'équipe Vente", description: "Maîtriser la Marketplace", module: "Marketplace", icon: TrendingUp },
    { title: "Former l'équipe Finance", description: "Bancabilité & dossiers", module: "Financement", icon: FileText },
    { title: "Former l'équipe Qualité", description: "Certifications & normes", module: "Incubateur", icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Gestion Équipe - Formation
          </h2>
          <p className="text-muted-foreground">Gérez les formations de vos collaborateurs</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Crown className="w-3 h-3 text-amber-500" />
            {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
          </Badge>
          {limits.employees !== -1 && (
            <span className="text-sm text-muted-foreground">
              {activeEmployees}/{limits.employees} collaborateurs
            </span>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2">
            <TrendingUp className="w-4 h-4" /> Dashboard RH
          </TabsTrigger>
          <TabsTrigger value="collaborateurs" className="gap-2">
            <Users className="w-4 h-4" /> Collaborateurs
          </TabsTrigger>
          <TabsTrigger value="assigner" className="gap-2">
            <Target className="w-4 h-4" /> Assigner
          </TabsTrigger>
          <TabsTrigger value="suivi" className="gap-2">
            <FileText className="w-4 h-4" /> Suivi & Reporting
          </TabsTrigger>
          <TabsTrigger value="budget" className="gap-2">
            <FileText className="w-4 h-4" /> Budget
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Collaborateurs actifs</span>
                </div>
                <p className="text-2xl font-bold">{totalActive}</p>
                <p className="text-xs text-green-500">+2 ce mois</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Complétion moyenne</span>
                </div>
                <p className="text-2xl font-bold">{avgCompletion}%</p>
                <Progress value={avgCompletion} className="h-1 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">Certificats délivrés</span>
                </div>
                <p className="text-2xl font-bold">{totalCertificates}</p>
                <p className="text-xs text-green-500">+3 cette semaine</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Top compétence</span>
                </div>
                <p className="text-lg font-bold">Appels d'offres</p>
                <p className="text-xs text-muted-foreground">8 certifiés</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top compétences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Compétences renforcées (Top 5)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topCompetences.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm">{comp.name}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(comp.count / 10) * 100} className="w-24 h-2" />
                      <span className="text-sm text-muted-foreground w-8">{comp.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Passerelles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Passerelles Formations</CardTitle>
                <CardDescription>Former vos équipes par métier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {passerelles.map((p, idx) => (
                  <Button key={idx} variant="outline" className="w-full justify-start gap-3">
                    <p.icon className="w-4 h-4 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Alertes */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Alertes & Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">2 formations en retard</p>
                    <p className="text-xs text-muted-foreground">Traoré Ibrahim - Export CEDEAO</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Relancer</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">1 invitation en attente</p>
                    <p className="text-xs text-muted-foreground">Bamba Moussa - depuis 5 jours</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Renvoyer</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaborateurs">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Rechercher un collaborateur..." className="pl-9" />
                </div>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Département" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="achats">Achats</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="rh">RH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowInviteModal(true)} disabled={!canAddMore}>
                <UserPlus className="w-4 h-4 mr-2" /> Inviter
                {!canAddMore && <Lock className="w-3 h-3 ml-1" />}
              </Button>
            </div>

            {!canAddMore && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Limite atteinte</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Votre abonnement {subscriptionTier} est limité à {limits.employees} collaborateurs. 
                  Passez au plan supérieur pour en ajouter plus.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Crown className="w-4 h-4 mr-2" /> Voir les plans
                </Button>
              </div>
            )}

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox 
                        checked={selectedEmployees.length === employees.length}
                        onCheckedChange={(checked) => {
                          setSelectedEmployees(checked ? employees.map(e => e.id) : []);
                        }}
                      />
                    </TableHead>
                    <TableHead>Collaborateur</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Région</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Certificats</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedEmployees.includes(emp.id)}
                          onCheckedChange={(checked) => {
                            setSelectedEmployees(checked 
                              ? [...selectedEmployees, emp.id]
                              : selectedEmployees.filter(id => id !== emp.id)
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.region}</TableCell>
                      <TableCell>{getStatusBadge(emp.status)}</TableCell>
                      <TableCell>
                        {emp.coursesAssigned > 0 ? (
                          <div className="flex items-center gap-2">
                            <Progress value={(emp.coursesCompleted / emp.coursesAssigned) * 100} className="w-16 h-2" />
                            <span className="text-xs">{emp.coursesCompleted}/{emp.coursesAssigned}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{emp.certificates}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{emp.lastActivity}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                            <DropdownMenuItem>Assigner des cours</DropdownMenuItem>
                            {emp.status === "invited" && (
                              <DropdownMenuItem>Relancer l'invitation</DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600">Désactiver</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {selectedEmployees.length > 0 && (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border rounded-lg shadow-lg p-4 flex items-center gap-4">
                <span className="text-sm">{selectedEmployees.length} sélectionné(s)</span>
                <Button size="sm" variant="outline">
                  <Target className="w-4 h-4 mr-2" /> Assigner un parcours
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="w-4 h-4 mr-2" /> Envoyer un rappel
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assigner">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assigner un parcours</CardTitle>
                <CardDescription>Attribuez une formation à un groupe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Parcours / Formation</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Choisir un parcours" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ao">Accès Marchés (AO)</SelectItem>
                      <SelectItem value="vente">Vente & Marketplace</SelectItem>
                      <SelectItem value="finance">Financement & Bancabilité</SelectItem>
                      <SelectItem value="production">Production++</SelectItem>
                      <SelectItem value="pilotage">Pilotage & Data</SelectItem>
                      <SelectItem value="leadership">Leadership & RH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Groupe cible</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Choisir un groupe" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les collaborateurs</SelectItem>
                      <SelectItem value="achats">Équipe Achats</SelectItem>
                      <SelectItem value="commercial">Équipe Commercial</SelectItem>
                      <SelectItem value="finance">Équipe Finance</SelectItem>
                      <SelectItem value="production">Équipe Production</SelectItem>
                      <SelectItem value="abidjan">Région Abidjan</SelectItem>
                      <SelectItem value="bouake">Région Bouaké</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date limite</Label>
                  <Input type="date" />
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm">3 collaborateurs seront assignés</span>
                </div>

                <Button className="w-full">
                  <Send className="w-4 h-4 mr-2" /> Assigner
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assignations récentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignments.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{a.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{a.courseName}</p>
                    </div>
                    <div className="text-right">
                      {getCourseStatusBadge(a.status)}
                      <p className="text-xs text-muted-foreground mt-1">{a.progress}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suivi">
          {!limits.reports ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Reporting avancé</h3>
                <p className="text-muted-foreground mb-4">
                  Les rapports détaillés sont disponibles à partir du plan Or.
                </p>
                <Button>
                  <Crown className="w-4 h-4 mr-2" /> Passer au plan Or
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                      <SelectItem value="quarter">Ce trimestre</SelectItem>
                      <SelectItem value="year">Cette année</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Équipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="achats">Achats</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" /> Excel
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" /> PDF
                  </Button>
                </div>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Collaborateur</TableHead>
                      <TableHead>Formation</TableHead>
                      <TableHead>Progression</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Certificat</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.employeeName}</TableCell>
                        <TableCell>{a.courseName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={a.progress} className="w-16 h-2" />
                            <span className="text-xs">{a.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{a.score !== null ? `${a.score}%` : "-"}</TableCell>
                        <TableCell>
                          {a.certified ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{a.deadline}</TableCell>
                        <TableCell>{getCourseStatusBadge(a.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Achats, licences et factures de formation</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
