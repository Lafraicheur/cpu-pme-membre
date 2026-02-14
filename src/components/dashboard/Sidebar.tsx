import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Home,
  Building2,
  Users,
  CreditCard,
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
} from "lucide-react";
import logo from "@/assets/logo-cpu-pme.png";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Accueil", href: "/" },
  // { icon: Building2, label: "Mon Entreprise", href: "/mon-entreprise" },
  { icon: Users, label: "Annuaire", href: "/annuaire" },
  // { icon: CreditCard, label: "Abonnement", href: "/abonnement", badge: 1 },
  { icon: Shield, label: "KYC & Conformité", href: "/kyc" },
  { icon: Rocket, label: "Incubateur", href: "/incubateur" },
  { icon: FileText, label: "Appels d'offres", href: "/appels-offres", badge: 3 },
  { icon: GraduationCap, label: "Formation", href: "/formation" },
  { icon: ShoppingCart, label: "Marketplace", href: "/marketplace" },
  { icon: Wallet, label: "Financement", href: "/financement" },
  { icon: Building2, label: "Affiliation", href: "/affiliation" },
  { icon: BarChart3, label: "Data Hub", href: "/data-hub" },
  { icon: Calendar, label: "Événements", href: "/evenements", badge: 2 },
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
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

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
          {/* {!collapsed && (
            <span className="font-bold text-sidebar-primary-foreground whitespace-nowrap animate-fade-in">
              CPU-PME
            </span>
          )} */}
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
            return (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon
                    size={20}
                    className={cn(
                      "flex-shrink-0 transition-transform duration-200",
                      !isActive && "group-hover:scale-110"
                    )}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate animate-fade-in">
                      {item.label}
                    </span>
                  )}
                  {item.badge && !collapsed && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && collapsed && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full">
                      {item.badge}
                    </span>
                  )}
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
    </aside>
  );
}
