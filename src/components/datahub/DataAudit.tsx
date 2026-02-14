import { useState } from "react";
import { 
  ArrowLeft, 
  Eye, 
  Download, 
  Share2, 
  FileText,
  User,
  Calendar,
  Filter,
  Search
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataAuditProps {
  onBack: () => void;
}

type ActionType = "view" | "download" | "export" | "share";

interface AuditLog {
  id: string;
  action: ActionType;
  object: string;
  objectType: string;
  user: string;
  role: string;
  date: string;
  time: string;
  details?: string;
}

const auditLogs: AuditLog[] = [
  {
    id: "1",
    action: "download",
    object: "Rapport mensuel Nov 2024",
    objectType: "Rapport",
    user: "Kouamé Jean",
    role: "Owner",
    date: "22 déc. 2024",
    time: "14:32",
    details: "Format PDF",
  },
  {
    id: "2",
    action: "view",
    object: "Dashboard Marketplace",
    objectType: "Dashboard",
    user: "Kouamé Jean",
    role: "Owner",
    date: "22 déc. 2024",
    time: "14:15",
  },
  {
    id: "3",
    action: "export",
    object: "Ventes Q3 2024",
    objectType: "Données",
    user: "Konan Marie",
    role: "Admin",
    date: "21 déc. 2024",
    time: "09:45",
    details: "Format XLSX, 156 lignes",
  },
  {
    id: "4",
    action: "share",
    object: "Rapport Performance AO",
    objectType: "Rapport",
    user: "Kouamé Jean",
    role: "Owner",
    date: "20 déc. 2024",
    time: "16:20",
    details: "Lien interne, expire 27 déc.",
  },
  {
    id: "5",
    action: "view",
    object: "Benchmarks filière",
    objectType: "Benchmark",
    user: "Diallo Fatou",
    role: "Commercial",
    date: "20 déc. 2024",
    time: "11:05",
  },
  {
    id: "6",
    action: "download",
    object: "Formation équipe - Certificats",
    objectType: "Rapport",
    user: "Konan Marie",
    role: "Admin",
    date: "19 déc. 2024",
    time: "10:30",
    details: "Format PDF",
  },
  {
    id: "7",
    action: "view",
    object: "Data Quality",
    objectType: "Dashboard",
    user: "Kouamé Jean",
    role: "Owner",
    date: "18 déc. 2024",
    time: "15:45",
  },
  {
    id: "8",
    action: "export",
    object: "Commandes clients",
    objectType: "Données",
    user: "Diallo Fatou",
    role: "Commercial",
    date: "18 déc. 2024",
    time: "09:15",
    details: "Format CSV, 89 lignes",
  },
];

const actionConfig: Record<ActionType, { label: string; icon: React.ElementType; color: string }> = {
  view: { label: "Consultation", icon: Eye, color: "text-blue-500" },
  download: { label: "Téléchargement", icon: Download, color: "text-green-500" },
  export: { label: "Export", icon: FileText, color: "text-purple-500" },
  share: { label: "Partage", icon: Share2, color: "text-orange-500" },
};

export function DataAudit({ onBack }: DataAuditProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.object.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesUser = userFilter === "all" || log.user === userFilter;
    return matchesSearch && matchesAction && matchesUser;
  });

  const uniqueUsers = [...new Set(auditLogs.map((log) => log.user))];

  // Stats
  const stats = {
    totalActions: auditLogs.length,
    downloads: auditLogs.filter((l) => l.action === "download").length,
    exports: auditLogs.filter((l) => l.action === "export").length,
    shares: auditLogs.filter((l) => l.action === "share").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Data Hub</h1>
          <p className="text-muted-foreground">Traçabilité des accès et exports</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalActions}</p>
                <p className="text-xs text-muted-foreground">Actions totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/30">
                <Download className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.downloads}</p>
                <p className="text-xs text-muted-foreground">Téléchargements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/30">
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.exports}</p>
                <p className="text-xs text-muted-foreground">Exports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/30">
                <Share2 className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.shares}</p>
                <p className="text-xs text-muted-foreground">Partages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes actions</SelectItem>
            <SelectItem value="view">Consultations</SelectItem>
            <SelectItem value="download">Téléchargements</SelectItem>
            <SelectItem value="export">Exports</SelectItem>
            <SelectItem value="share">Partages</SelectItem>
          </SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-40">
            <User className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Utilisateur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {uniqueUsers.map((user) => (
              <SelectItem key={user} value={user}>{user}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Journal d'activité</CardTitle>
          <CardDescription>Historique des accès aux données et rapports</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const config = actionConfig[log.action];
                const ActionIcon = config.icon;

                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ActionIcon className={`h-4 w-4 ${config.color}`} />
                        <span className="text-sm">{config.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.object}</p>
                        <p className="text-xs text-muted-foreground">{log.objectType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm">{log.user}</p>
                          <Badge variant="outline" className="text-xs">{log.role}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{log.date}</span>
                        <span>·</span>
                        <span>{log.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.details && (
                        <span className="text-sm text-muted-foreground">{log.details}</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredLogs.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune entrée pour ces filtres</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
