import { Bell, User, Crown, Star, Sparkles, Building2, Users as UsersIcon, Landmark, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionTier } from "@/types/subscription";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const tierIcons: Record<SubscriptionTier, { icon: any; color: string; label: string }> = {
  MI_BASIC:        { icon: Sparkles,  color: "text-muted-foreground", label: "Basic Individuel" },
  MI_ARGENT:       { icon: Star,      color: "text-secondary",        label: "Argent Pro" },
  MI_OR:           { icon: Crown,     color: "text-yellow-500",       label: "Or Pro" },
  ME_BASIC:        { icon: Building2, color: "text-sky-500",          label: "Basic Entreprise" },
  ME_ARGENT:       { icon: Star,      color: "text-indigo-500",       label: "Argent Entreprise" },
  ME_OR:           { icon: Crown,     color: "text-primary",          label: "Or Entreprise" },
  ORGANISATION:    { icon: Building2, color: "text-blue-500",         label: "Organisation" },
  FEDERATION:      { icon: UsersIcon, color: "text-purple-500",       label: "Fédération" },
  INSTITUTIONNEL:  { icon: Landmark,  color: "text-amber-500",        label: "Institutionnel" },
};

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentTier: SubscriptionTier =
    user?.subscription?.tier && tierIcons[user.subscription.tier]
      ? user.subscription.tier
      : 'ME_ARGENT';
  const CurrentIcon = tierIcons[currentTier].icon;
  const planLabel   = user?.planLibelle || tierIcons[currentTier].label;

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 md:px-6">
      {/* Bouton hamburger mobile */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground mr-2"
      >
        <Menu size={22} />
      </button>

      {/* Left section */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-2">
          {(user?.communeNom || user?.regionNom) && (
            <span className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium">
              Siège {user.communeNom || user.regionNom}
            </span>
          )}
          {(user?.filiereNom || user?.secteurPrincipal) && (
            <span className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium">
              {user.filiereNom || user.secteurPrincipal}
            </span>
          )}
        </div>
      </div>

      {/* Center - Search */}
      {/* <div className="flex-1 max-w-xl mx-2 sm:mx-4 md:mx-8">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Rechercher membres, produits, AO, dossiers..."
            className="pl-10 bg-muted border-0 focus-visible:ring-primary"
          />
        </div>
      </div> */}

      {/* Right section */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        {/* <Button variant="default" size="sm" className="gap-2 gradient-primary border-0">
          <Plus size={16} />
          <span className="hidden sm:inline">Actions rapides</span>
        </Button> */}

        {/* Plan abonnement réel */}
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm font-medium">
          <CurrentIcon size={16} className={cn(tierIcons[currentTier].color)} />
          <span className="hidden sm:inline">{planLabel}</span>
        </span>

        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell size={20} className="text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
        </button>

        <button
          onClick={() => navigate("/parametres")}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User size={16} className="text-secondary-foreground" />
          </div>
        </button>
      </div>
    </header>
  );
}
