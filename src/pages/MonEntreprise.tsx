import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  AlertCircle,
  Camera,
  Save,
  X,
  CreditCard,
  User,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { TeamLimitIndicator } from "@/components/subscription/TeamLimitIndicator";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, affiliationApi } from "@/lib/api";
import { CarteMembre } from "@/components/dashboard/CarteMembre";

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
  }
];

export default function MonEntreprise() {
  const { canAddMember, getTeamLimit } = useSubscription();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [branches] = useState<Branch[]>(mockBranches);
  const [team] = useState<TeamMember[]>(mockTeam);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", website_url: "" });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Données réelles depuis l'API profil
  const { data: profile, isLoading: isLoadingProfile, isError: isErrorProfile } = useQuery({
    queryKey: ["adhesion-profile"],
    queryFn: authApi.getProfile,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      try {
        const stored = localStorage.getItem("cpu-adhesion");
        return stored ? JSON.parse(stored) : undefined;
      } catch { return undefined; }
    },
  });

  const { data: affiliationData } = useQuery({
    queryKey: ["affiliation", "me"],
    queryFn: affiliationApi.getMe,
    staleTime: 2 * 60 * 1000,
  });

  const logoUrl = profile?.logo
    ? String(profile.logo).startsWith("http")
      ? String(profile.logo)
      : `${import.meta.env.VITE_API_URL_DEV || ""}${profile.logo}`
    : null;

  const updateProfileMutation = useMutation({
    mutationFn: (payload: { email: string; name?: string; phone?: string; website_url?: string }) =>
      authApi.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adhesion-profile"] });
      setIsDialogOpen(false);
      toast({ title: "Profil mis à jour avec succès" });
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const updateLogoMutation = useMutation({
    mutationFn: ({ email, logo }: { email: string; logo: File }) =>
      authApi.updateLogo(email, logo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adhesion-profile"] });
      setLogoPreview(null);
      toast({ title: "Logo mis à jour avec succès" });
    },
    onError: (err: Error) => {
      setLogoPreview(null);
      toast({ title: "Erreur upload logo", description: err.message, variant: "destructive" });
    },
  });

  function handleEditStart() {
    setEditForm({
      name: String(profile?.name ?? ""),
      phone: String(profile?.phone ?? ""),
      website_url: String(profile?.website_url ?? ""),
    });
    setIsDialogOpen(true);
  }

  function handleSave() {
    const email = String(profile?.email ?? "");
    updateProfileMutation.mutate({
      email,
      name: editForm.name || undefined,
      phone: editForm.phone || undefined,
      website_url: editForm.website_url || undefined,
    });
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const email = String(profile?.email ?? "");
    if (!email) {
      toast({ title: "Email introuvable", description: "Impossible d'identifier le compte.", variant: "destructive" });
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
    updateLogoMutation.mutate({ email, logo: file });
    e.target.value = "";
  }

  const abonnement  = profile?.abonnement  as Record<string, unknown> | undefined;
  const typeMembre  = profile?.typeMembre  as Record<string, unknown> | undefined;
  const profil      = profile?.profil      as Record<string, unknown> | undefined;
  const secteur     = profile?.secteurPrincipal as Record<string, unknown> | undefined;
  const filiere     = profile?.filiere     as Record<string, unknown> | undefined;
  const sousFiliere = profile?.sousFiliere as Record<string, unknown> | undefined;
  const siegeRegion = profile?.siegeRegion as Record<string, unknown> | undefined;
  const siegeCommune= profile?.siegeCommune as Record<string, unknown> | undefined;

  function F({ label, value, icon: Icon, colSpan }: {
    label: string;
    value?: string | null;
    icon?: React.ElementType;
    colSpan?: boolean;
  }) {
    return (
      <div className={cn("space-y-2", colSpan && "md:col-span-2")}>
        <Label className="flex items-center gap-2 text-muted-foreground">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </Label>
        {isLoadingProfile
          ? <Skeleton className="h-10 w-full rounded-md" />
          : <Input readOnly value={value ?? "—"} className="bg-muted/40" />
        }
      </div>
    );
  }

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
          {/* <Badge variant="outline" className="text-secondary border-secondary">
            Profil complet à 85%
          </Badge> */}
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="profile" className="gap-2">
              <Building2 className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="carte" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Carte Membre
            </TabsTrigger>
            {/* <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              Équipes
            </TabsTrigger> */}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {isErrorProfile && (
              <div className="flex items-center gap-2 text-sm text-destructive p-4 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Impossible de charger le profil.
              </div>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Informations générales</CardTitle>
                    <CardDescription>
                      Informations publiques visibles sur le réseau CPU-PME
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleEditStart} className="gap-2 shrink-0">
                    <Pencil className="w-4 h-4" />
                    Modifier le profil
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Logo */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border border-border">
                      {(logoPreview ?? logoUrl) ? (
                        <img
                          src={logoPreview ?? logoUrl ?? ""}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-primary text-2xl font-bold">
                          {String(profile?.name ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={updateLogoMutation.isPending}
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:bg-primary/90 transition-colors"
                      title="Changer le logo"
                    >
                      {updateLogoMutation.isPending
                        ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        : <Camera className="w-4 h-4" />
                      }
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>

                {/* Identité */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">IDENTITÉ</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <F label="Nom complet" value={String(profile?.name ?? "")} />
                    <F label="Poste / Fonction" value={String(profile?.position ?? "")} />
                    <F label="Nom de l'organisation" value={String(profile?.customOrganisationName ?? "")} />
                    <F label="Nombre d'employés" value={String(profile?.nombre_employee ?? "")} />
                    <F label="Type de membre" value={String(typeMembre?.name ?? "")} />
                    <F label="Profil" value={String(profil?.name ?? "")} />
                    <F label="Abonnement" value={abonnement ? `${abonnement.libelle} (${abonnement.plan})` : ""} />
                  </div>
                </div>

                <div className="border-t" />

                {/* Coordonnées */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">COORDONNÉES</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <F label="Téléphone" value={String(profile?.phone ?? "")} icon={Phone} />
                    <F label="Email" value={String(profile?.email ?? "")} icon={Mail} />
                    <F label="Site web" value={String(profile?.website_url ?? "")} icon={Globe} colSpan />
                  </div>
                </div>

                <div className="border-t" />

                {/* Localisation */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">LOCALISATION DU SIÈGE</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <F label="Région" value={String(siegeRegion?.name ?? "")} icon={MapPin} />
                    <F label="Commune" value={String(siegeCommune?.name ?? "")} icon={MapPin} />
                    <F label="Ville" value={String(profile?.siegeVille ?? "")} />
                    <F label="Village / Quartier" value={String(profile?.siegeVillage ?? "")} />
                  </div>
                </div>

                <div className="border-t" />

                {/* Secteur */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">SECTEUR D'ACTIVITÉ</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <F label="Secteur principal" value={String(secteur?.name ?? "")} />
                    <F label="Filière" value={String(filiere?.name ?? "")} />
                    <F label="Sous-filière" value={String(sousFiliere?.name ?? "")} />
                    <F label="Portée d'intervention" value={String(profile?.interventionScope ?? "")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Carte Membre Tab */}
          <TabsContent value="carte" className="space-y-8">
            <CarteMembre
              isLoading={isLoadingProfile}
              name={String(profile?.name ?? "")}
              orgName={String(profile?.customOrganisationName ?? "")}
              numeroMembre={String(profile?.numero_membre ?? "")}
              plan={String((abonnement?.plan as string | undefined) ?? "basic")}
              abonnementCreatedAt={String((profile?.created_at as string | undefined) ?? "")}
              modaliteAbonnement={(profile?.modalite_abonnement as "abonnement_mensuel" | "abonnement_annuel" | undefined)}
              typeMembreNom={String(typeMembre?.name ?? "")}
              hasAffiliation={!!affiliationData?.currentAffiliation && affiliationData.currentAffiliation.status.toLowerCase() === "approved"}
              affiliationName={affiliationData?.currentAffiliation?.organization?.name ?? ""}
            />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
      {/* Modal édition profil */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              Modifier mon profil
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="flex items-center gap-2 text-sm font-medium">
                Nom complet
              </Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Votre nom ou raison sociale"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="flex items-center gap-2 text-sm font-medium">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Téléphone
              </Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+225 07 00 00 00 00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-website" className="flex items-center gap-2 text-sm font-medium">
                <Globe className="w-4 h-4 text-muted-foreground" />
                Site web
              </Label>
              <Input
                id="edit-website"
                value={editForm.website_url}
                onChange={(e) => setEditForm((f) => ({ ...f, website_url: e.target.value }))}
                placeholder="https://www.monentreprise.ci"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Seuls ces champs sont modifiables ici. Pour les autres informations, contactez le support.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={updateProfileMutation.isPending}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending
                ? <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <Save className="w-4 h-4 mr-2" />
              }
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
