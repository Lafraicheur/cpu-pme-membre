import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Subscription, Feature, SubscriptionTier } from "@/types/subscription";
import { canAccessFeature, getFeaturesForTier, TIER_CONFIGS } from "@/lib/permissions";

export type UserRole = "owner" | "admin" | "commercial" | "comptable" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  subscription: Subscription;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  canAccess: (feature: Feature) => boolean;
  canAddTeamMember: () => boolean;
  getTeamLimit: () => number;
  updateSubscriptionTier: (tier: SubscriptionTier) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem("cpu-pme-user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("cpu-pme-user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Demo login - Replace with real auth when Cloud is enabled

    // Lire le tier sélectionné depuis localStorage (défaut: ARGENT)
    const selectedTier = (localStorage.getItem("demo_subscription_tier") || 'ARGENT') as any;
    const tierConfig = TIER_CONFIGS[selectedTier];

    const demoUser: User = {
      id: "demo-user-1",
      name: "Utilisateur Demo",
      email,
      role: "owner",
      companyId: "company-1",
      companyName: "Entreprise Demo SARL",
      subscription: {
        tier: selectedTier,
        category: tierConfig.category || 'individual',
        status: 'active',
        startDate: new Date().toISOString(),
        teamLimit: tierConfig.teamLimit,
        currentTeamSize: 1,
        features: getFeaturesForTier(selectedTier),
      },
    };

    localStorage.setItem("cpu-pme-user", JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const logout = () => {
    localStorage.removeItem("cpu-pme-user");
    setUser(null);
  };

  const hasPermission = (requiredRoles: UserRole[]) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const canAccess = (feature: Feature): boolean => {
    if (!user?.subscription) return false;
    if (user.subscription.status !== 'active') return false;
    return canAccessFeature(user.subscription.tier, feature);
  };

  const canAddTeamMember = (): boolean => {
    if (!user?.subscription) return false;
    const limit = user.subscription.teamLimit;
    const current = user.subscription.currentTeamSize;
    if (limit === -1) return true; // unlimited
    return current < limit;
  };

  const getTeamLimit = (): number => {
    if (!user?.subscription) return 0;
    return user.subscription.teamLimit;
  };

  const updateSubscriptionTier = (tier: SubscriptionTier) => {
    if (!user) return;

    const tierConfig = TIER_CONFIGS[tier];
    const updatedUser: User = {
      ...user,
      subscription: {
        ...user.subscription,
        tier: tier,
        category: tierConfig.category || 'individual',
        teamLimit: tierConfig.teamLimit,
        features: getFeaturesForTier(tier),
      },
    };

    // Mettre à jour localStorage
    localStorage.setItem("demo_subscription_tier", tier);
    localStorage.setItem("cpu-pme-user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        canAccess,
        canAddTeamMember,
        getTeamLimit,
        updateSubscriptionTier,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
