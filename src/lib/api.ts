import { getCookie } from "@/lib/cookies";

const API_BASE = import.meta.env.VITE_API_URL || "https://back.cpupme.ci";

function getToken(): string | null {
  return localStorage.getItem("cpu-access-token") ?? getCookie("cpu-access-token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const body = await res.json();
      console.error(`[API] ${options.method || "GET"} ${path} →`, body);
      if (typeof body?.message === "string") message = body.message;
      else if (typeof body?.detail === "string") message = body.detail;
      else if (typeof body?.error === "string") message = body.error;
      else if (Array.isArray(body?.errors)) message = body.errors.map((e: { message?: string; msg?: string }) => e.message || e.msg).join(", ");
      else if (body) message = JSON.stringify(body);
    } catch {
      // ignore
    }
    const error = new Error(message) as Error & { status: number };
    error.status = res.status;
    throw error;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Evenement {
  id: string;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  image_flayer: string | null;
  lieu: string | null;
  heure_debut: string;
  heure_fin: string;
  format: string;
  prix: string | null;
  prix_membre: string | null;
  capacite_max: number | null;
  isActive: boolean;
  objectifs?: string | null;
  programme?: string | null;
  description_type_format?: string | null;
  lien_url?: string | null;
  type_audience?: string | null;
  filiere_concerner?: string | null;
  cequiInclu?: string | null;
  exiger_kyc_verifie?: boolean;
  gratuit_membre_uniquement?: boolean;
  gratuit_pour_tous?: boolean;
  activer_matchmaking_b2b?: boolean;
  intervenants?: any | null;
  autoriser_liste_attente?: boolean;
  generer_qr_checkin?: boolean;
  attestation_participation?: boolean;
  partage_photos_autorise?: boolean;
  informations_pratiques?: string | null;
  ala_une?: boolean;
  creator?: any | null;
  type_evenement_id?: string;
  region_id?: string | null;
  filiere_id?: string | null;
  region?: any | null;
  filiere?: any | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  type_evenement: {
    nom: string;
    couleur: string;
  } | null;
}

/** Décode les entités HTML encodées par l'API (&#x27; → ', &amp; → &, etc.) */
export function decodeHtml(str: string): string {
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

export interface TicketDetail {
  id: string;
  ticket_type: { nom: string; prix: string } | null;
  quantite: number;
  montantTotal: number;
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  prenom: string;
  nom: string;
  email: string;
  entreprise: string;
  total_price: string;
  date_commande: string;
  statut_paiement: string;
  details: TicketDetail[];
}

export const registrationsApi = {
  getByUser: async (userId: string): Promise<Registration[]> => {
    const res = await request<{ success: boolean; data: Registration[] } | Registration[]>(
      `/api/registrations?user_id=${encodeURIComponent(userId)}`
    );
    const list = Array.isArray(res) ? res : (res as { data: Registration[] }).data;
    return list.filter((r) => r.user_id === userId);
  },
};

export const evenementsApi = {
  getById: async (id: string): Promise<Evenement> => {
    const res = await request<{ success: boolean; data: Evenement } | Evenement>(
      `/api/evenements/${id}`
    );
    const ev = (res as { data: Evenement }).data ?? (res as Evenement);
    return {
      ...ev,
      titre: decodeHtml(ev.titre),
      description: decodeHtml(ev.description),
      lieu: decodeHtml(ev.lieu),
      image_flayer: ev.image_flayer ? decodeHtml(ev.image_flayer) : null,
    };
  },

  getAlaUne: async (): Promise<Evenement[]> => {
    const res = await request<{ success: boolean; data: Evenement[] } | Evenement[]>(
      "/api/evenements/ala-une"
    );
    const list = Array.isArray(res) ? res : (res as { data: Evenement[] }).data;
    return list.map((e) => ({
      ...e,
      titre: decodeHtml(e.titre),
      description: decodeHtml(e.description),
      lieu: e.lieu ? decodeHtml(e.lieu) : e.lieu,
      image_flayer: e.image_flayer
        ? e.image_flayer.startsWith("http")
          ? decodeHtml(e.image_flayer)
          : `${import.meta.env.VITE_API_URL || ""}${e.image_flayer}`
        : null,
    }));
  },

  getAll: async (): Promise<Evenement[]> => {
    const res = await request<{ success: boolean; data: Evenement[] } | Evenement[]>(
      "/api/evenements"
    );
    const list = Array.isArray(res) ? res : (res as { data: Evenement[] }).data;
    return list.map((e) => ({
      ...e,
      titre: decodeHtml(e.titre),
      description: decodeHtml(e.description),
      lieu: e.lieu ? decodeHtml(e.lieu) : e.lieu,
      image_flayer: e.image_flayer
        ? e.image_flayer.startsWith("http")
          ? decodeHtml(e.image_flayer)
          : `${import.meta.env.VITE_API_URL || ""}${e.image_flayer}`
        : null,
    }));
  },

  getRecentUpcoming: async (): Promise<Evenement[]> => {
    const res = await request<{ success: boolean; data: Evenement[] } | Evenement[]>(
      "/api/evenements/recent-upcoming"
    );
    const list = Array.isArray(res) ? res : (res as { data: Evenement[] }).data;
    return list.map((e) => ({
      ...e,
      titre: decodeHtml(e.titre),
      description: decodeHtml(e.description),
      lieu: decodeHtml(e.lieu),
      image_flayer: e.image_flayer ? decodeHtml(e.image_flayer) : null,
    }));
  },
};

export interface TypeEvenement {
  id: string;
  nom: string;
  couleur: string;
  icone: string;
}

export interface Region {
  id: string;
  name: string;
  zone: string;
}

export interface Filiere {
  id: string;
  name: string;
  secteur: { name: string };
}

export interface TicketType {
  id: string;
  event_id: string;
  nom: string;
  prix: number;
  prix_membre: number;
  quantite_totale: number;
}

export interface PublicCible {
  id: string;
  libelle: string;
  descriptions: string;
  isGratuit: boolean;
  ouvertATous: boolean;
}

export const publicCiblesApi = {
  getAll: async (): Promise<PublicCible[]> => {
    const res = await request<{ success: boolean; data: PublicCible[] } | PublicCible[]>(
      "/api/public-cibles"
    );
    return Array.isArray(res) ? res : (res as { data: PublicCible[] }).data;
  },
};

export const typeEvenementsApi = {
  getAll: async (): Promise<TypeEvenement[]> => {
    const res = await request<{ success: boolean; data: TypeEvenement[] } | TypeEvenement[]>(
      "/api/type-evenements"
    );
    return Array.isArray(res) ? res : (res as { data: TypeEvenement[] }).data;
  },
};

export const regionsApi = {
  getAll: async (): Promise<Region[]> => {
    const res = await request<Region[]>("/api/regions");
    return Array.isArray(res) ? res : (res as { data: Region[] }).data ?? [];
  },
};

export const filieresApi = {
  getAll: async (): Promise<Filiere[]> => {
    const res = await request<{ success: boolean; data: Filiere[] } | Filiere[]>("/api/filieres");
    return Array.isArray(res) ? res : (res as { data: Filiere[] }).data;
  },
};

export const ticketTypesApi = {
  create: async (data: {
    event_id: string;
    nom: string;
    prix: number;
    prix_membre: number;
    quantite_totale: number;
  }): Promise<TicketType> => {
    const res = await request<{ success: boolean; data: TicketType } | TicketType>(
      "/api/ticket-types",
      { method: "POST", body: JSON.stringify(data) }
    );
    return (res as { data: TicketType }).data ?? (res as TicketType);
  },
};

export const createEvenementApi = async (formData: FormData): Promise<Evenement> => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const API_BASE = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${API_BASE}/api/evenements`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const body = await res.json();
      console.error("[createEvenementApi] Réponse serveur :", body);
      message = body?.message || body?.error || body?.detail || JSON.stringify(body) || message;
    } catch { /* ignore */ }
    const error = new Error(message) as Error & { status: number };
    error.status = res.status;
    throw error;
  }
  const json = await res.json();
  return (json as { data: Evenement }).data ?? (json as Evenement);
};

export interface VendeurEligibility {
  eligible: boolean;
  reasons: string[];
  plan: string;
  kycStatus: string;
}

export interface VendeurStatus {
  status: string;
  progress: number;
  completedSteps: string[];
  missingSteps: string[];
}

export interface OnboardingStep {
  id: string;
  label: string;
  completed: boolean;
}

export interface OnboardingChecklist {
  progress: number;
  steps: OnboardingStep[];
}

export const marketplaceVendeurApi = {
  getEligibility: async (): Promise<VendeurEligibility> => {
    const res = await request<{ success: boolean; data: VendeurEligibility }>(
      "/api/marketplace/vendeur/eligibility"
    );
    return res.data;
  },

  getStatus: async (): Promise<VendeurStatus> => {
    const res = await request<{ success: boolean; data: VendeurStatus }>(
      "/api/marketplace/vendeur/status"
    );
    return res.data;
  },

  getOnboardingChecklist: async (): Promise<OnboardingChecklist> => {
    const res = await request<{ success: boolean; data: OnboardingChecklist }>(
      "/api/marketplace/vendeur/onboarding-checklist"
    );
    return res.data;
  },

  createBoutique: async (body: {
    vendorId: string;
    name: string;
    description: string;
    slogan?: string;
    phone?: string;
    email?: string;
    website?: string;
    preparationDelayHours?: number;
    returnPolicy?: string;
  }): Promise<unknown> => {
    const res = await request<{ success: boolean; data: unknown }>(
      "/api/boutiques",
      { method: "POST", body: JSON.stringify({ status: "active", ...body }) }
    );
    return res;
  },
};

export interface Boutique {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  slogan: string;
  logo: string | null;
  phone: string;
  email: string;
  website: string | null;
  status: "active" | "inactive";
  preparationDelayHours: number;
  returnPolicy: string;
  created_at: string;
  updated_at: string;
}

export const boutiquesApi = {
  getMyShop: async (): Promise<Boutique | null> => {
    const res = await request<{ success: boolean; data: { boutique: Boutique } }>(
      "/api/marketplace/vendeur/shop"
    );
    return res.data?.boutique ?? null;
  },

  update: async (
    id: string,
    body: {
      vendorId: string;
      name?: string;
      description?: string;
      slogan?: string;
      logo?: string;
      phone?: string;
      email?: string;
      website?: string;
      status?: "active" | "inactive";
      preparationDelayHours?: number;
      returnPolicy?: string;
    }
  ): Promise<Boutique> => {
    const res = await request<{ success: boolean; data: Boutique }>(
      `/api/boutiques/${id}`,
      { method: "PATCH", body: JSON.stringify(body) }
    );
    return res.data;
  },
};

export interface Product {
  id: string;
  boutiqueId: string;
  name: string;
  type: string;
  description: string;
  category: string;
  subCategory: string;
  characteristics: string;
  isRegulated: boolean;
  madeInCiRequested: boolean;
  madeInCiBadgeType?: string;
  unit: string;
  status: string;
  price: number;
  stock: number;
  moq: number;
  weight?: number;
  dimensions?: string;
  availabilityDelay?: string;
  deliveryZones?: unknown[];
  shippingCost?: number;
  pickupAvailable?: boolean;
  technicalSpecifications?: { name: string; value: string; unit?: string }[];
  certifications?: string[];
  variantsEnabled?: boolean;
  quantityPricingEnabled?: boolean;
  quantityPricingTiers?: { minQuantity: number; unitPrice: number }[];
  premiumOption?: string;
  premiumDurationWeeks?: number;
  created_at?: string;
  updated_at?: string;
}

export const productsApi = {
  create: async (body: Record<string, unknown>): Promise<Product> => {
    const res = await request<{ success: boolean; data: Product } | Product>(
      "/api/products",
      { method: "POST", body: JSON.stringify(body) }
    );
    return (res as { data: Product }).data ?? (res as Product);
  },
};

export const authApi = {
  sendOtp: (email: string) =>
    request<void>("/api/auth/adhesion/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOtp: async (email: string, code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    adhesion?: Record<string, unknown>;
  }> => {
    const res = await request<{ success: boolean; data: Record<string, unknown> }>(
      "/api/auth/adhesion/verify",
      { method: "POST", body: JSON.stringify({ email, code }) }
    );
    const payload = res?.data ?? (res as unknown as Record<string, unknown>);
    const token = payload?.access_token as string | undefined;
    if (!token) {
      throw new Error("Token introuvable dans la réponse de l'API");
    }
    return {
      access_token: token,
      refresh_token: payload?.refresh_token as string | undefined,
      expires_in: payload?.expires_in as number | undefined,
      adhesion: payload?.adhesion as Record<string, unknown> | undefined,
    };
  },

  logout: () =>
    request<void>("/api/auth/adhesion/logout", { method: "POST" }),

  getProfile: async (): Promise<Record<string, unknown>> => {
    const res = await request<{ success: boolean; data: Record<string, unknown> }>(
      "/api/auth/adhesion/profile"
    );
    return res?.data ?? (res as unknown as Record<string, unknown>);
  },
};
