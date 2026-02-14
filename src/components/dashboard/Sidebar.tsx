import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Home,
  Building2,
  Users,
  Shield,
  Rocket,
  FileText,
  GraduationCap,
  ShoppingCart,
  Wallet,
  BarChart3,
  Calendar,
  HeadphonesIcon,
  History,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Lock,
  ArrowUpCircle,
} from "lucide-react";
import logo from "@/assets/logo-cpu-pme.png";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Feature } from "@/types/subscription";
import { getRequiredTier, TIER_CONFIGS } from "@/lib/permissions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  requiredFeature?: Feature;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Accueil", href: "/" },
  { icon: Users, label: "Annuaire", href: "/annuaire", requiredFeature: "directory.read" },
  { icon: Shield, label: "KYC & Conformité", href: "/kyc" },
  { icon: Rocket, label: "Incubateur", href: "/incubateur", requiredFeature: "incubator.access" },
  { icon: FileText, label: "Appels d'offres", href: "/appels-offres", badge: 3, requiredFeature: "ao.consultation" },
  { icon: GraduationCap, label: "Formation", href: "/formation", requiredFeature: "formation.learner" },
  { icon: ShoppingCart, label: "Marketplace", href: "/marketplace", requiredFeature: "marketplace.buyer" },
  { icon: Wallet, label: "Financement", href: "/financement", requiredFeature: "financing.requests" },
  { icon: Building2, label: "Affiliation", href: "/affiliation", requiredFeature: "affiliation.access" },
  { icon: BarChart3, label: "Data Hub", href: "/data-hub", requiredFeature: "datahub.access" },
  { icon: Calendar, label: "Événements", href: "/evenements", badge: 2, requiredFeature: "events.participation" },
  { icon: HeadphonesIcon, label: "Support", href: "/support" },
  { icon: History, label: "Historique", href: "/historique" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, canAccess, user } = useAuth();
  const [lockedModal, setLockedModal] = useState<{ label: string; tierName: string } | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const currentTierName = user?.subscription ? TIER_CONFIGS[user.subscription.tier].name : "Basic";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={logo}
            alt="CPU-PME"
            className="h-10 w-auto flex-shrink-0 rounded"
          />
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const isLocked = item.requiredFeature ? !canAccess(item.requiredFeature) : false;
            const requiredTier = item.requiredFeature ? getRequiredTier(item.requiredFeature) : null;
            const requiredTierName = requiredTier ? TIER_CONFIGS[requiredTier].name : null;

            const linkContent = (
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isLocked
                    ? "cursor-not-allowed text-sidebar-foreground/60"
                    : isActive
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  size={20}
                  className={cn(
                    "flex-shrink-0 transition-transform duration-200",
                    !isActive && !isLocked && "group-hover:scale-110"
                  )}
                />
                {!collapsed && (
                  <span className="text-sm font-medium truncate animate-fade-in">
                    {item.label}
                  </span>
                )}
                {isLocked && !collapsed && (
                  <Lock size={14} className="ml-auto flex-shrink-0 text-sidebar-foreground/50" />
                )}
                {isLocked && collapsed && (
                  <Lock size={10} className="absolute -bottom-0.5 -right-0.5 text-sidebar-foreground/50" />
                )}
                {!isLocked && item.badge && !collapsed && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {!isLocked && item.badge && collapsed && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            );

            if (isLocked) {
              return (
                <li key={item.label}>
                  <div
                    onClick={() => setLockedModal({ label: item.label, tierName: requiredTierName || "supérieur" })}
                    className="cursor-pointer"
                  >
                    {linkContent}
                  </div>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <Link to={item.href}>
                  {linkContent}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-1">
        <Link
          to="/mon-entreprise"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
            location.pathname === "/mon-entreprise"
              ? "bg-primary text-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
        >
          <Building2 size={20} />
          {!collapsed && <span className="text-sm font-medium">Mon Entreprise</span>}
        </Link>
        <Link
          to="/parametres"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
            location.pathname === "/parametres"
              ? "bg-primary text-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
        >
          <Settings size={20} />
          {!collapsed && <span className="text-sm font-medium">Paramètres</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>
      {/* Modal upgrade */}
      <Dialog open={!!lockedModal} onOpenChange={(open) => { if (!open) setLockedModal(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7 text-amber-500" />
            </div>
            <DialogTitle>Fonctionnalité verrouillée</DialogTitle>
            <DialogDescription className="pt-2">
              L'accès à <span className="font-semibold text-foreground">{lockedModal?.label}</span> nécessite le plan <span className="font-semibold text-primary">{lockedModal?.tierName}</span>.
              <br />
              Vous êtes actuellement sur le plan <span className="font-semibold">{currentTierName}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-4">
            <Button
              className="w-full gap-2"
              onClick={() => {
                setLockedModal(null);
                navigate("/subscription-selector");
              }}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Passer au plan {lockedModal?.tierName}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setLockedModal(null)}
            >
              Plus tard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
