import { Bell, Search, Plus, ChevronDown, User, Crown, Star, Sparkles, Building2, Users as UsersIcon, Landmark, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionTier } from "@/types/subscription";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tierIcons: Record<SubscriptionTier, { icon: any; color: string; label: string }> = {
  BASIC: { icon: Sparkles, color: "text-muted-foreground", label: "Basic" },
  ARGENT: { icon: Star, color: "text-secondary", label: "Argent" },
  OR: { icon: Crown, color: "text-primary", label: "Or" },
  ORGANISATION: { icon: Building2, color: "text-blue-500", label: "Organisation" },
  FEDERATION: { icon: UsersIcon, color: "text-purple-500", label: "Fédération" },
  INSTITUTIONNEL: { icon: Landmark, color: "text-amber-500", label: "Institutionnel" },
};

export function Header() {
  const { user, updateSubscriptionTier } = useAuth();
  const navigate = useNavigate();

  const currentTier = user?.subscription?.tier || 'ARGENT';
  const CurrentIcon = tierIcons[currentTier].icon;

  const handleTierChange = (tier: SubscriptionTier) => {
    updateSubscriptionTier(tier);
    // Recharger la page pour appliquer les changements
    window.location.reload();
  };

  const handleGoToSelector = () => {
    // Effacer le tier pour forcer l'affichage du sélecteur
    localStorage.removeItem("demo_subscription_tier");
    navigate("/subscription-selector");
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 md:px-6">
      {/* Left section */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium">
            <span>Siège Abidjan</span>
            <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium">
            <span>Agroalimentaire</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-xl mx-2 sm:mx-4 md:mx-8">
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
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        <Button variant="default" size="sm" className="gap-2 gradient-primary border-0">
          <Plus size={16} />
          <span className="hidden sm:inline">Actions rapides</span>
        </Button>

        {/* Subscription Tier Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium">
              <CurrentIcon size={16} className={cn(tierIcons[currentTier].color)} />
              <span className="hidden sm:inline">{tierIcons[currentTier].label}</span>
              <Badge variant="outline" className="hidden md:flex text-xs">
                Simulation
              </Badge>
              <ChevronDown size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Changer d'abonnement (Test)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(tierIcons).map(([tier, config]) => {
              const TierIcon = config.icon;
              return (
                <DropdownMenuItem
                  key={tier}
                  onClick={() => handleTierChange(tier as SubscriptionTier)}
                  className={cn(
                    "cursor-pointer",
                    currentTier === tier && "bg-accent"
                  )}
                >
                  <TierIcon size={16} className={cn("mr-2", config.color)} />
                  <span>{config.label}</span>
                  {currentTier === tier && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Actif
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleGoToSelector} className="cursor-pointer">
              <RefreshCw size={16} className="mr-2" />
              <span>Retour au sélecteur</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell size={20} className="text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
        </button>

        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User size={16} className="text-secondary-foreground" />
          </div>
        </button>
      </div>
    </header>
  );
}
