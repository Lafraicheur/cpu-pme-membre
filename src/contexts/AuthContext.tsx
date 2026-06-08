import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Subscription, Feature, SubscriptionTier } from "@/types/subscription";
import { canAccessFeature, getFeaturesForTier, TIER_CONFIGS } from "@/lib/permissions";
import { authApi } from "@/lib/api";
import { setCookie, getCookie, removeCookie } from "@/lib/cookies";

export type UserRole = "owner" | "admin" | "commercial" | "comptable" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  // Données enrichies du profil API
  organisationName?: string;
  statut?: string;
  planLibelle?: string;
  secteurPrincipal?: string;
  filiereNom?: string;
  sousFiliereNom?: string;
  regionNom?: string;
  communeNom?: string;
  nombreEmployes?: string;
  typeMembre?: string;
  interventionScope?: string;
  abonnementStartDate?: string;
  abonnementEndDate?: string;
  abonnementPeriod?: "mensuel" | "annuel";
  subscription: Subscription;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (email: string) => Promise<void>;
  login: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  canAccess: (feature: Feature) => boolean;
  canAddTeamMember: () => boolean;
  getTeamLimit: () => number;
  updateSubscriptionTier: (tier: SubscriptionTier) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizePlanText(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#x27;/gi, "'")
    .toLowerCase()
    .trim();
}

function mapLibelleToTier(libelle: string): SubscriptionTier | null {
  const n = normalizePlanText(libelle);

  if (n.includes("institutionnel")) return "INSTITUTIONNEL";
  if (n.includes("fédération") || n.includes("federation")) return "FEDERATION";
  if (n.includes("association") || n.includes("coopérative") || n.includes("cooperative") || n.includes("gie")) return "ORGANISATION";

  const hasOr = /\bor\b/.test(n) || n.includes("gold");
  const hasArgent = n.includes("argent") || n.includes("silver");
  const hasEntreprise = n.includes("entreprise") || n.includes("startup") || n.includes("micro-entreprise");

  if (hasOr) return hasEntreprise ? "ME_OR" : "MI_OR";
  if (hasArgent) return hasEntreprise ? "ME_ARGENT" : "MI_ARGENT";
  return hasEntreprise ? "ME_BASIC" : "MI_BASIC";
}

function mapPlanToTier(profile: Record<string, unknown>): SubscriptionTier {
  const defaultTier: SubscriptionTier = "ME_ARGENT";

  // Si déjà un tier explicite (stocké localement)
  if (profile.subscription_tier) return profile.subscription_tier as SubscriptionTier;

  const abonnement = profile.abonnement as Record<string, unknown> | undefined;
  const libelle = abonnement?.libelle as string | undefined;

  // Mapping prioritaire via le libellé (le champ `plan` de l'API peut être incorrect)
  if (libelle) {
    const tierFromLibelle = mapLibelleToTier(libelle);
    if (tierFromLibelle) return tierFromLibelle;
  }

  // Fallback : plan + typeMembre
  const plan = (abonnement?.plan as string | undefined)?.toLowerCase();
  const typeMembre = (profile.typeMembre as Record<string, unknown> | undefined);
  const typeMembreName = (typeMembre?.name as string | undefined)?.toLowerCase() ?? "";
  const isIndividuel = typeMembreName.includes("individuel");

  switch (plan) {
    case "cooperative": return "ORGANISATION";
    case "federation":  return "FEDERATION";
    case "institutional": return "INSTITUTIONNEL";
    case "basic":   return isIndividuel ? "MI_BASIC" : "ME_BASIC";
    case "silver":
    case "argent":  return isIndividuel ? "MI_ARGENT" : "ME_ARGENT";
    case "gold":
    case "or":      return isIndividuel ? "MI_OR" : "ME_OR";
    default:        return defaultTier;
  }
}

function get<T>(obj: unknown, key: string): T | undefined {
  return (obj as Record<string, unknown>)?.[key] as T | undefined;
}

function mapProfileToUser(profile: Record<string, unknown>): User {
  const tier = mapPlanToTier(profile);
  const tierConfig = TIER_CONFIGS[tier] || TIER_CONFIGS["ME_ARGENT"];

  const fullName = (profile.name || profile.nom || profile.prenom || "Membre") as string;

  const abonnement = profile.abonnement as Record<string, unknown> | undefined;
  const secteurPrincipal = profile.secteurPrincipal as Record<string, unknown> | undefined;
  const filiere         = profile.filiere         as Record<string, unknown> | undefined;
  const sousFiliere     = profile.sousFiliere      as Record<string, unknown> | undefined;
  const siegeRegion     = profile.siegeRegion      as Record<string, unknown> | undefined;
  const siegeCommune    = profile.siegeCommune     as Record<string, unknown> | undefined;
  const typeMembreObj   = profile.typeMembre       as Record<string, unknown> | undefined;

  return {
    id: String(profile.id || ""),
    name: fullName,
    email: String(profile.email || ""),
    phone: (profile.phone as string) || undefined,
    role: "owner",
    companyId: undefined,
    companyName: (profile.position as string) || undefined,
    organisationName: (profile.customOrganisationName as string)
                   || (profile.organisationName as string)
                   || undefined,
    statut:            (profile.statut as string)            || undefined,
    planLibelle:       get<string>(abonnement, "libelle")    || undefined,
    secteurPrincipal:  get<string>(secteurPrincipal, "name") || undefined,
    filiereNom:        get<string>(filiere, "name")          || undefined,
    sousFiliereNom:    get<string>(sousFiliere, "name")      || undefined,
    regionNom:         get<string>(siegeRegion, "name")      || undefined,
    communeNom:        get<string>(siegeCommune, "name")     || undefined,
    nombreEmployes:    (profile.nombre_employee as string)   || undefined,
    typeMembre:        get<string>(typeMembreObj, "name")    || undefined,
    interventionScope: (profile.interventionScope as string) || undefined,
    ...(() => {
      const modalite = (profile.modalite_abonnement as string) || "";
      const isAnnuel = modalite === "abonnement_annuel";
      return {
        abonnementPeriod:    (isAnnuel ? "annuel" : "mensuel") as "mensuel" | "annuel",
        abonnementStartDate: (profile.date_debut_abonnement as string)
                          || (profile.created_at as string)
                          || undefined,
        abonnementEndDate:   (profile.date_fin_abonnement as string)
                          || undefined,
      };
    })(),
    subscription: {
      tier,
      category: tierConfig.category || "individual",
      status: "active",
      startDate: (profile.created_at as string) || new Date().toISOString(),
      teamLimit: tierConfig.teamLimit,
      currentTeamSize: 1,
      features: getFeaturesForTier(tier),
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupère le token depuis localStorage ou depuis le cookie partagé
    const token = localStorage.getItem("cpu-access-token") ?? getCookie("cpu-access-token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Synchronise localStorage si le token vient du cookie (autre sous-domaine)
    if (!localStorage.getItem("cpu-access-token")) {
      localStorage.setItem("cpu-access-token", token);
    }

    authApi
      .getProfile()
      .then((profile) => {
        const mappedUser = mapProfileToUser(profile);
        localStorage.setItem("cpu-pme-user", JSON.stringify(mappedUser));
        setCookie("cpu-pme-user", JSON.stringify(mappedUser));
        setUser(mappedUser);
      })
      .catch(() => {
        localStorage.removeItem("cpu-access-token");
        localStorage.removeItem("cpu-pme-user");
        removeCookie("cpu-access-token");
        removeCookie("cpu-pme-user");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Détection de déconnexion depuis un autre site (formaction-cpu, cpu-pme-events, etc.)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      const tokenPresent = !!getCookie("cpu-access-token");
      if (!tokenPresent && user) {
        localStorage.removeItem("cpu-access-token");
        localStorage.removeItem("cpu-refresh-token");
        localStorage.removeItem("cpu-expires-in");
        localStorage.removeItem("cpu-adhesion");
        localStorage.removeItem("cpu-pme-user");
        setUser(null);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user]);

  const sendOtp = async (email: string) => {
    await authApi.sendOtp(email);
  };

  const login = async (email: string, code: string) => {
    const { access_token, refresh_token, expires_in, adhesion } = await authApi.verifyOtp(email, code);

    localStorage.setItem("cpu-access-token", access_token);
    setCookie("cpu-access-token", access_token);

    if (refresh_token) {
      localStorage.setItem("cpu-refresh-token", refresh_token);
      setCookie("cpu-refresh-token", refresh_token);
    }

    if (expires_in !== undefined) {
      localStorage.setItem("cpu-expires-in", String(expires_in));
      setCookie("cpu-expires-in", String(expires_in));
    }

    if (adhesion) {
      localStorage.setItem("cpu-adhesion", JSON.stringify(adhesion));
      setCookie("cpu-adhesion", JSON.stringify(adhesion));
    }

    const profile = adhesion ?? { email };
    const mappedUser = mapProfileToUser(profile);
    localStorage.setItem("cpu-pme-user", JSON.stringify(mappedUser));
    setCookie("cpu-pme-user", JSON.stringify(mappedUser));
    setUser(mappedUser);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // On déconnecte localement même si l'API échoue
    } finally {
      localStorage.removeItem("cpu-access-token");
      localStorage.removeItem("cpu-refresh-token");
      localStorage.removeItem("cpu-expires-in");
      localStorage.removeItem("cpu-adhesion");
      localStorage.removeItem("cpu-pme-user");
      // Efface tous les cookies partagés → déconnecte les autres sites
      removeCookie("cpu-access-token");
      removeCookie("cpu-refresh-token");
      removeCookie("cpu-pme-user");
      removeCookie("cpu-adhesion");
      removeCookie("cpu-expires-in");
      setUser(null);
    }
  };

  const hasPermission = (requiredRoles: UserRole[]) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const canAccess = (feature: Feature): boolean => {
    if (!user?.subscription) return false;
    if (user.subscription.status !== "active") return false;
    return canAccessFeature(user.subscription.tier, feature);
  };

  const canAddTeamMember = (): boolean => {
    if (!user?.subscription) return false;
    const limit = user.subscription.teamLimit;
    const current = user.subscription.currentTeamSize;
    if (limit === -1) return true;
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
        tier,
        category: tierConfig.category || "individual",
        teamLimit: tierConfig.teamLimit,
        features: getFeaturesForTier(tier),
      },
    };
    localStorage.setItem("cpu-pme-user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const refreshProfile = async () => {
    const profile = await authApi.getProfile();
    const mappedUser = mapProfileToUser(profile);
    localStorage.setItem("cpu-pme-user", JSON.stringify(mappedUser));
    setCookie("cpu-pme-user", JSON.stringify(mappedUser));
    setUser(mappedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        sendOtp,
        login,
        logout,
        hasPermission,
        canAccess,
        canAddTeamMember,
        getTeamLimit,
        updateSubscriptionTier,
        refreshProfile,
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
