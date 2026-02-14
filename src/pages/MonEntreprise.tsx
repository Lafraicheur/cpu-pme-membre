import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Plus,
  Pencil,
  Trash2,
  Shield,
  Crown,
  UserCog,
  Briefcase,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { TeamLimitIndicator } from "@/components/subscription/TeamLimitIndicator";
import { useToast } from "@/hooks/use-toast";

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  isHeadquarters: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "commercial" | "comptable" | "viewer";
  avatar?: string;
  status: "active" | "pending" | "inactive";
}

const roleLabels: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  owner: {
    label: "Propriétaire",
    color: "bg-primary hover:bg-primary text-primary-foreground",
    icon: Crown,
  },
  admin: {
    label: "Administrateur",
    color: "bg-secondary hover:bg-secondary text-secondary-foreground",
    icon: Shield,
  },
  commercial: {
    label: "Commercial",
    color: "bg-blue-500 hover:bg-blue-500 text-white",
    icon: Briefcase,
  },
  comptable: {
    label: "Comptable",
    color: "bg-purple-500 hover:bg-purple-500 text-white",
    icon: UserCog,
  },
  viewer: {
    label: "Lecteur",
    color: "bg-muted hover:bg-muted text-muted-foreground",
    icon: Users,
  },
};

const mockBranches: Branch[] = [
  {
    id: "1",
    name: "Siège Social",
    address: "123 Avenue de l'Indépendance",
    city: "Dakar",
    phone: "+221 33 123 4567",
    isHeadquarters: true,
  },
  {
    id: "2",
    name: "Agence Thiès",
    address: "45 Rue Carnot",
    city: "Thiès",
    phone: "+221 33 987 6543",
    isHeadquarters: false,
  },
];

const mockTeam: TeamMember[] = [
  {
    id: "1",
    name: "Amadou Diallo",
    email: "amadou.diallo@entreprise.sn",
    role: "owner",
    status: "active",
  },
  {
    id: "2",
    name: "Fatou Ndiaye",
    email: "fatou.ndiaye@entreprise.sn",
    role: "admin",
    status: "active",
  },
  {
    id: "3",
    name: "Moussa Sow",
    email: "moussa.sow@entreprise.sn",
    role: "commercial",
    status: "active",
  },
  {
    id: "4",
    name: "Aïssatou Ba",
    email: "aissatou.ba@entreprise.sn",
    role: "comptable",
    status: "pending",
  },
];

export default function MonEntreprise() {
  const { canAddMember, getTeamLimit } = useSubscription();
  const { toast } = useToast();

  const [branches] = useState<Branch[]>(mockBranches);
  const [team] = useState<TeamMember[]>(mockTeam);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Mon Entreprise
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez votre profil, vos sites et votre équipe
            </p>
          </div>
          <Badge variant="outline" className="text-secondary border-secondary">
            Profil complet à 85%
          </Badge>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="profile" className="gap-2">
              <Building2 className="w-4 h-4" />
              Profil
            </TabsTrigger>
            {/* <TabsTrigger value="branches" className="gap-2">
              <MapPin className="w-4 h-4" />
              Sites & Branches
            </TabsTrigger> */}
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              Équipes
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Informations publiques visibles sur le réseau CPU-PME
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Logo & Identity Section */}
                <div className="space-y-8">
                  {/* PHOTO DE PROFIL */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                          EN
                        </AvatarFallback>
                      </Avatar>

                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* TITRE */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4 text-center">
                      IDENTITÉ DE L'ENTREPRISE
                    </h3>

                    {/* CHAMPS */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Raison sociale</Label>
                        <Input defaultValue="Entreprise Exemple SARL" />
                      </div>

                      <div className="space-y-2">
                        <Label>Nom commercial</Label>
                        <Input defaultValue="Exemple Corp" />
                      </div>

                      <div className="space-y-2">
                        <Label>Secteur d'activité</Label>
                        <Input defaultValue="Commerce & Distribution" />
                      </div>

                      <div className="space-y-2">
                        <Label>Date de création</Label>
                        <Input defaultValue="2020-01-15" type="date" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t" />

                {/* Contact Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    COORDONNÉES
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Téléphone
                      </Label>
                      <Input defaultValue="+221 33 123 4567" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      <Input defaultValue="contact@exemple.sn" type="email" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Site web
                      </Label>
                      <Input defaultValue="https://exemple.sn" type="url" />
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t" />

                {/* Legal Info Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    INFORMATIONS LÉGALES
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>NINEA</Label>
                      <Input defaultValue="123456789A123" />
                    </div>
                    <div className="space-y-2">
                      <Label>RCCM</Label>
                      <Input defaultValue="SN-DKR-2020-B-12345" />
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t pt-4" />

                <div className="flex justify-end">
                  <Button>Enregistrer les modifications</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branches Tab */}
          <TabsContent value="branches" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Sites & Branches</h3>
                <p className="text-sm text-muted-foreground">
                  Gérez vos différents sites d'exploitation
                </p>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un site
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {branches.map((branch) => (
                <Card
                  key={branch.id}
                  className={cn(
                    "transition-all cursor-pointer",
                    branch.isHeadquarters && "border-primary/50"
                  )}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          branch.isHeadquarters ? "bg-primary/10" : "bg-muted"
                        )}
                      >
                        <Building2
                          className={cn(
                            "w-5 h-5",
                            branch.isHeadquarters
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                      </div>
                      {branch.isHeadquarters && (
                        <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5">
                          Siège
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {branch.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {branch.address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {branch.city}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {branch.phone}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="w-3 h-3" />
                        </Button>
                        {!branch.isHeadquarters && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-7 w-7"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Gestion de l'équipe</h3>
                <p className="text-sm text-muted-foreground">
                  Invitez des membres et gérez les rôles ({team.length}/
                  {getTeamLimit()})
                </p>
              </div>
              <Button
                className="gap-2"
                disabled={!canAddMember()}
                onClick={() => {
                  if (!canAddMember()) {
                    toast({
                      title: "Limite atteinte",
                      description:
                        "Mettez à niveau votre abonnement pour ajouter plus de membres.",
                      variant: "destructive",
                    });
                    return;
                  }
                  // Open invite dialog logic here
                }}
              >
                <Plus className="w-4 h-4" />
                Inviter un membre
              </Button>
            </div>

            {/* Roles Legend */}
            {/* <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Rôles disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(roleLabels).map(
                    ([key, { label, color, icon: Icon }]) => (
                      <div
                        key={key}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium",
                          color
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card> */}

            {/* Team Limit Indicator */}
            <TeamLimitIndicator />

            {/* Team Members - Mobile View (Cards) */}
            <div className="grid gap-3 md:hidden">
              {team.map((member) => {
                const roleInfo = roleLabels[member.role];
                return (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {member.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {member.email}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge
                                className={cn(
                                  "gap-1 rounded-sm text-xs",
                                  roleInfo.color
                                )}
                              >
                                <roleInfo.icon className="w-3 h-3" />
                                {roleInfo.label}
                              </Badge>
                              {member.status === "active" && (
                                <Badge
                                  variant="outline"
                                  className="text-green-600 rounded-sm border-green-600 text-xs"
                                >
                                  Actif
                                </Badge>
                              )}
                              {member.status === "pending" && (
                                <Badge
                                  variant="outline"
                                  className="text-yellow-600 rounded-sm border-yellow-600 text-xs"
                                >
                                  En attente
                                </Badge>
                              )}
                              {member.status === "inactive" && (
                                <Badge
                                  variant="outline"
                                  className="text-gray-600 rounded-sm border-gray-600 text-xs"
                                >
                                  Inactif
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {member.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Team Members - Desktop View (Table) */}
            <Card className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.map((member) => {
                    const roleInfo = roleLabels[member.role];
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn("gap-1 rounded-sm", roleInfo.color)}
                          >
                            <roleInfo.icon className="w-3 h-3" />
                            {roleInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.status === "active" && (
                            <Badge
                              variant="outline"
                              className="text-green-600 rounded-sm border-green-600"
                            >
                              Actif
                            </Badge>
                          )}
                          {member.status === "pending" && (
                            <Badge
                              variant="outline"
                              className="text-yellow-600 rounded-sm border-yellow-600"
                            >
                              En attente
                            </Badge>
                          )}
                          {member.status === "inactive" && (
                            <Badge
                              variant="outline"
                              className="text-gray-600 rounded-sm border-gray-600"
                            >
                              Inactif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {member.role !== "owner" && (
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
