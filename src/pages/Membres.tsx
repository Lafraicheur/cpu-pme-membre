import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

const members = [
  {
    id: 1,
    name: "SARL TechCongo",
    sector: "Technologies",
    region: "Kinshasa",
    status: "active",
    size: "PME",
    compliance: 95,
    cotisation: "Payée",
    joinDate: "15 Jan 2024",
    initials: "TC",
  },
  {
    id: 2,
    name: "Coop Agricole Bas-Congo",
    sector: "Agriculture",
    region: "Kongo Central",
    status: "active",
    size: "Coopérative",
    compliance: 88,
    cotisation: "Payée",
    joinDate: "22 Fév 2024",
    initials: "CA",
  },
  {
    id: 3,
    name: "ETS Commerce Plus",
    sector: "Commerce",
    region: "Lubumbashi",
    status: "pending",
    size: "PME",
    compliance: 72,
    cotisation: "En attente",
    joinDate: "10 Mar 2024",
    initials: "CP",
  },
  {
    id: 4,
    name: "SARL BTP Services",
    sector: "Construction",
    region: "Goma",
    status: "active",
    size: "PME",
    compliance: 100,
    cotisation: "Payée",
    joinDate: "05 Avr 2024",
    initials: "BS",
  },
  {
    id: 5,
    name: "PME Textile Mode",
    sector: "Textile",
    region: "Kinshasa",
    status: "suspended",
    size: "PME",
    compliance: 45,
    cotisation: "Impayée",
    joinDate: "18 Mai 2024",
    initials: "TM",
  },
  {
    id: 6,
    name: "Société Minière Alpha",
    sector: "Mines",
    region: "Kolwezi",
    status: "active",
    size: "Grande entreprise",
    compliance: 92,
    cotisation: "Payée",
    joinDate: "28 Juin 2024",
    initials: "MA",
  },
];

const statusConfig = {
  active: { label: "Actif", class: "badge-active", icon: CheckCircle },
  pending: { label: "En attente", class: "badge-pending", icon: Clock },
  suspended: { label: "Suspendu", class: "badge-expired", icon: XCircle },
};

export default function Membres() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Membres de la fédération</h1>
            <p className="text-muted-foreground mt-1">
              Gérez les entités membres, validations et cotisations
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau membre
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Total membres</p>
            <p className="text-2xl font-bold text-foreground">247</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Actifs</p>
            <p className="text-2xl font-bold text-success">218</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">En attente</p>
            <p className="text-2xl font-bold text-warning">17</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Suspendus</p>
            <p className="text-2xl font-bold text-destructive">12</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, secteur, région..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Secteur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="tech">Technologies</SelectItem>
                <SelectItem value="agri">Agriculture</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="kinshasa">Kinshasa</SelectItem>
                <SelectItem value="lubumbashi">Lubumbashi</SelectItem>
                <SelectItem value="goma">Goma</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Plus de filtres
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membre</TableHead>
                <TableHead>Secteur</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Taille</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Conformité</TableHead>
                <TableHead>Cotisation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const StatusIcon = statusConfig[member.status as keyof typeof statusConfig].icon;
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Depuis {member.joinDate}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.sector}</TableCell>
                    <TableCell>{member.region}</TableCell>
                    <TableCell>{member.size}</TableCell>
                    <TableCell>
                      <Badge className={`badge-status ${statusConfig[member.status as keyof typeof statusConfig].class}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[member.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              member.compliance >= 80 ? 'bg-success' : 
                              member.compliance >= 60 ? 'bg-warning' : 'bg-destructive'
                            }`}
                            style={{ width: `${member.compliance}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{member.compliance}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.cotisation === "Payée" ? "default" : member.cotisation === "En attente" ? "secondary" : "destructive"}>
                        {member.cotisation}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" /> Voir le profil
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
