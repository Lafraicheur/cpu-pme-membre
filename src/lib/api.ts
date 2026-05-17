import { getCookie } from "@/lib/cookies";

const API_BASE = import.meta.env.VITE_API_URL || "https://back.cpupme.ci";

function getToken(): string | null {
  return localStorage.getItem("cpu-access-token") ?? getCookie("cpu-access-token");
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };
  if (token && !skipAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });

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

async function requestMultipart<T>(
  path: string,
  body: FormData,
  method = "POST"
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body });

  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const errBody = await res.json();
      console.error(`[API] ${method} ${path} →`, errBody);
      if (typeof errBody?.message === "string") message = errBody.message;
      else if (typeof errBody?.detail === "string") message = errBody.detail;
      else if (typeof errBody?.error === "string") message = errBody.error;
      else if (Array.isArray(errBody?.errors)) message = errBody.errors.map((e: { message?: string; msg?: string }) => e.message || e.msg).join(", ");
      else if (errBody) message = JSON.stringify(errBody);
    } catch {
      // ignore
    }
    const error = new Error(message) as Error & { status: number };
    error.status = res.status;
    throw error;
  }

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

export interface PaymentResourceDetails {
  id: string;
  event_id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  entreprise: string | null;
  total_price: number;
  details: Array<{
    ticket_type: { nom: string } | null;
    quantite: number;
    montantTotal: number;
  }>;
}

export interface Payment {
  id: string;
  transactionId: string;
  payableType: string;
  payableId: string;
  contextType: string | null;
  registrationId: string | null;
  participantionId: string | null;
  payerUserId: string | null;
  amount: string;
  currency: string;
  status: "success" | "pending" | "cancelled";
  paymentMethod?: string;
  paymentProvider?: string;
  checkoutUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  resource_details?: PaymentResourceDetails | null;
  providerResponse?: {
    additional_infos?: {
      participantDto?: {
        formation_id?: string;
        user_id?: string;
        status?: string;
      };
      customer_email?: string;
      customer_firstname?: string;
      customer_lastname?: string;
    };
  } | null;
}

export const paymentsApi = {
  getByUser: async (userId: string): Promise<Payment[]> => {
    const res = await request<{ success: boolean; data: Payment[] } | Payment[]>(
      `/api/payments?payerUserId=${encodeURIComponent(userId)}`
    );
    const list = Array.isArray(res) ? res : ((res as { data: Payment[] }).data ?? []);
    return list;
  },

  getAll: async (): Promise<Payment[]> => {
    const res = await request<{ success: boolean; data: Payment[] } | Payment[]>("/api/payments");
    return Array.isArray(res) ? res : ((res as { data: Payment[] }).data ?? []);
  },

  getEventPayments: async (): Promise<Payment[]> => {
    const res = await request<{ success: boolean; data: Payment[] }>(
      "/api/payments?contextType=evenement_registration&includeResourceDetails=true"
    );
    return (res as { data: Payment[] }).data ?? [];
  },
};

// ── Types abonnements & paiements ClaPay ──────────────────────────

export interface AbonnementAPI {
  id: string;
  typeMembreId: string;
  typeMembre: { id: string; name: string; description: string };
  plan: string;
  libelle: string;
  description: string;
  tarifMensuel: string;
  tarifAnnuel: string;
  surDevis: boolean;
  ordre: number;
  isActive: boolean;
}

export interface CountryData {
  flag: string;
  flag_img: string;
  name: string;
  code: string;
  currency: string;
  language: string;
  indicatif: string;
  phone_length: number;
}

export interface OperatorData {
  name: string;
  codeoperator: string;
  logo: string;
  active: boolean;
  otpstarter: { MERCHANT: boolean };
  instruction: { MERCHANT: string | null };
}

export interface InitPaymentResponse {
  payment_url: string;
  payment_otp: string | null;
  signature: string;
  country: string;
  currency: string;
  available_operator?: string[];
  authorized_operator?: string[];
}

export interface PaymentStatusResponse {
  signature: string;
  status: "SUCCESSFUL" | "PENDING" | "FAILED" | "CANCELLED" | string;
  transaction_id?: string;
  amount?: number;
  currency?: string;
  transaction_date?: string;
  transaction_service_name?: string;
  transaction_phone_number?: string;
}

export const abonnementsApi = {
  getAll: async (): Promise<AbonnementAPI[]> => {
    const res = await request<{ success: boolean; data: AbonnementAPI[] }>("/api/abonnements");
    return res.data ?? [];
  },
};

export const clapayApi = {
  getCountries: async (): Promise<CountryData[]> => {
    const res = await request<{ success: boolean; data: CountryData[] }>(
      "/api/payments/countries/data",
      { skipAuth: false }
    );
    return res.data ?? [];
  },

  getOperators: async (country: string): Promise<OperatorData[]> => {
    const res = await request<{ success: boolean; data: OperatorData[] }>(
      `/api/payments/operators/data?country=${encodeURIComponent(country)}`
    );
    return (res.data ?? []).filter((op) => op.active);
  },

  initSubscriptionPayment: async (payload: {
    amount: number;
    currency: string;
    countryCode: string;
    operatorsCode: string[];
    returnUrl: string;
    payerUserId: string;
    adhesionPayload: {
      name: string;
      email: string;
      phone: string;
      typeMembreId: string;
      abonnementId: string;
    };
    customerFirstname: string;
    customerLastname: string;
    customerPhone: string;
  }): Promise<InitPaymentResponse> => {
    const body = {
      contextType: "adhesion",
      paymentProvider: "clapay",
      method: "MERCHANT",
      tunnel: "CHECKOUTPAGE",
      currency: payload.currency,
      countryCode: payload.countryCode,
      operatorsCode: payload.operatorsCode,
      amount: payload.amount,
      returnUrl: payload.returnUrl,
      callbackUrl: "https://back.cpupme.ci/api/payments/webhook",
      payerUserId: payload.payerUserId,
      adhesionPayload: {
        ...payload.adhesionPayload,
        message: "Demande d'adhésion après paiement en ligne.",
      },
      additionalInfos: {
        customer_email: payload.adhesionPayload.email,
        customer_firstname: payload.customerFirstname,
        customer_lastname: payload.customerLastname,
        customer_phone: payload.customerPhone,
      },
    };
    console.log("[Payment] Payload envoyé →", JSON.stringify(body, null, 2));
    try {
      const res = await request<{ success: boolean; data: InitPaymentResponse }>(
        "/api/payments/init/payment/deposit/with-context",
        { method: "POST", body: JSON.stringify(body) }
      );
      console.log("[Payment] Réponse →", res);
      return res.data;
    } catch (err) {
      console.error("[Payment] Erreur complète →", err);
      throw err;
    }
  },

  checkPaymentStatus: async (signature: string): Promise<PaymentStatusResponse> => {
    const raw = await request<
      PaymentStatusResponse | { success: boolean; data: PaymentStatusResponse }
    >("/api/payments/check/status/payment", {
      method: "POST",
      body: JSON.stringify({ signature }),
    });
    console.log("[checkPaymentStatus] réponse brute →", JSON.stringify(raw));
    // Gérer les deux formats : { status, signature } ou { success, data: { status, signature } }
    const result = "data" in raw && raw.data ? raw.data : (raw as PaymentStatusResponse);
    return result;
  },
};

export interface RegistrationVerif {
  id: string;
  user_id: string;
  event_id: string;
  est_valable: boolean;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  entreprise: string;
  total_price: number | string;
  date_commande: string;
  statut_paiement: string;
  evenement: {
    id: string;
    titre: string;
    date_debut: string;
    heure_debut: string;
    lieu: string | null;
    image_flayer: string | null;
    format: string;
  } | null;
  details: Array<{
    id: string;
    quantite: number;
    montantTotal: number;
    ticket_type: { nom: string; prix: number; prix_membre: number } | null;
  }>;
}

export const registrationsApi = {
  getByUser: async (userId: string): Promise<Registration[]> => {
    const res = await request<{ success: boolean; data: Registration[] } | Registration[]>(
      `/api/registrations?user_id=${encodeURIComponent(userId)}`
    );
    const list = Array.isArray(res) ? res : (res as { data: Registration[] }).data;
    return list.filter((r) => r.user_id === userId);
  },

  verifiTicket: async (registrationId: string): Promise<RegistrationVerif> => {
    const res = await request<{ success: boolean; data: RegistrationVerif } | RegistrationVerif>(
      `/api/registrations/verifi-ticket/${encodeURIComponent(registrationId)}`
    );
    return (res as { data: RegistrationVerif }).data ?? (res as RegistrationVerif);
  },

  validerAcces: async (registrationId: string): Promise<RegistrationVerif> => {
    const res = await request<{ success: boolean; data: RegistrationVerif } | RegistrationVerif>(
      `/api/registrations/valider-acces/${encodeURIComponent(registrationId)}`,
      { method: "POST", skipAuth: true }
    );
    return (res as { data: RegistrationVerif }).data ?? (res as RegistrationVerif);
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
      "/api/evenements/ala-une", { skipAuth: true }
    );
    const list = Array.isArray(res) ? res : (res as { data: Evenement[] }).data;
    return list.map((e) => ({
      ...e,
      titre: e.titre ? decodeHtml(e.titre) : e.titre,
      description: e.description ? decodeHtml(e.description) : e.description,
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
      "/api/evenements", { skipAuth: true }
    );
    const list = Array.isArray(res) ? res : ((res as { data: Evenement[] }).data ?? []);
    return list.map((e) => ({
      ...e,
      titre: e.titre ? decodeHtml(e.titre) : e.titre,
      description: e.description ? decodeHtml(e.description) : e.description,
      lieu: e.lieu ? decodeHtml(e.lieu) : e.lieu,
      image_flayer: e.image_flayer
        ? e.image_flayer.startsWith("http")
          ? decodeHtml(e.image_flayer)
          : `${import.meta.env.VITE_API_URL || ""}${e.image_flayer}`
        : null,
    }));
  },

  getByCreator: async (creatorUserId: string): Promise<Evenement[]> => {
    const res = await request<{ success: boolean; data: Evenement[] } | Evenement[]>(
      `/api/evenements?creatorUserId=${encodeURIComponent(creatorUserId)}`
    );
    const list = Array.isArray(res) ? res : ((res as { data: Evenement[] }).data ?? []);
    return list.map((e) => ({
      ...e,
      titre: e.titre ? decodeHtml(e.titre) : e.titre,
      description: e.description ? decodeHtml(e.description) : e.description,
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
      "/api/evenements/recent-upcoming", { skipAuth: true }
    );
    const list = Array.isArray(res) ? res : (res as { data: Evenement[] }).data;
    return list.map((e) => ({
      ...e,
      titre: decodeHtml(e.titre),
      description: e.description ? decodeHtml(e.description) : e.description,
      lieu: e.lieu ? decodeHtml(e.lieu) : null,
      image_flayer: e.image_flayer ? decodeHtml(e.image_flayer) : null,
    }));
  },

  update: async (id: string, data: Partial<Omit<Evenement, "id" | "created_at" | "updated_at" | "deleted_at" | "creator" | "type_evenement">>): Promise<Evenement> => {
    const res = await request<{ success: boolean; data: Evenement } | Evenement>(
      `/api/evenements/${id}`,
      { method: "PATCH", body: JSON.stringify(data) }
    );
    return (res as { data: Evenement }).data ?? (res as Evenement);
  },

  updateMultipart: async (id: string, fd: FormData): Promise<Evenement> => {
    const res = await requestMultipart<{ success: boolean; data: Evenement } | Evenement>(
      `/api/evenements/${id}`, fd, "PATCH"
    );
    return (res as { data: Evenement }).data ?? (res as Evenement);
  },

  delete: async (id: string): Promise<void> => {
    await request<void>(`/api/evenements/${id}`, { method: "DELETE" });
  },
};

export interface TypeEvenement {
  id: string;
  nom: string;
  description: string | null;
  couleur: string;
  icone: string | null;
  is_active: boolean;
  creator_user_id: string | null;
  creator_role: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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

export interface MadeInCIBadgeLevel {
  id: string;
  label: string;
  description: string;
}

export interface MadeInCIProduct {
  id: string;
  name: string;
  boutiqueId: string;
}

export interface MadeInCIRequest {
  id: string;
  boutiqueId: string;
  productId: string;
  badgeType: string;
  status: string;
  localValueAdded: string;
  transformationProcess: string;
  adminComment: string | null;
  progress: number;
  inputInvoicesUrls: string[] | null;
  productionPhotosUrls: string[] | null;
  submittedAt: string;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    category: string;
    boutiqueId: string;
  };
}

export const madeInCIBadgeLevelsApi = {
  getAll: async (): Promise<MadeInCIBadgeLevel[]> => {
    const res = await request<{ success: boolean; data: MadeInCIBadgeLevel[] }>(
      "/api/marketplace/made-in-ci/badge-levels"
    );
    return res.data;
  },
};

export const madeInCIProductsApi = {
  getMyProducts: async (): Promise<MadeInCIProduct[]> => {
    const res = await request<{ success: boolean; data: MadeInCIProduct[] }>(
      "/api/marketplace/made-in-ci/products/me"
    );
    return res.data;
  },
};

export const madeInCIRequestsApi = {
  getMyRequests: async (): Promise<MadeInCIRequest[]> => {
    const res = await request<{ success: boolean; data: MadeInCIRequest[] }>(
      "/api/marketplace/made-in-ci/requests/me"
    );
    return res.data;
  },

  submit: async (body: {
    productId: string;
    badgeType: string;
    transformationProcess: string;
    localValueAdded: number;
    inputInvoicesUrls?: string[];
    productionPhotosUrls?: string[];
  }): Promise<unknown> => {
    const res = await request<{ success: boolean; data: unknown }>(
      "/api/marketplace/made-in-ci/requests",
      { method: "POST", body: JSON.stringify(body) }
    );
    return res.data;
  },
};

export const publicCiblesApi = {
  getAll: async (): Promise<PublicCible[]> => {
    const res = await request<{ success: boolean; data: PublicCible[] } | PublicCible[]>(
      "/api/public-cibles"
    );
    return Array.isArray(res) ? res : (res as { data: PublicCible[] }).data;
  },
};

export const typeEvenementsApi = {
  getAll: async (creatorUserId?: string): Promise<TypeEvenement[]> => {
    const query = creatorUserId ? `?creatorUserId=${encodeURIComponent(creatorUserId)}` : "";
    const res = await request<{ success: boolean; data: TypeEvenement[] } | TypeEvenement[]>(
      `/api/type-evenements${query}`,
      { skipAuth: true }
    );
    const list = Array.isArray(res) ? res : (res as { data: TypeEvenement[] }).data;
    return list.map((t) => ({
      ...t,
      nom:         decodeHtml(t.nom),
      description: t.description ? decodeHtml(t.description) : null,
    }));
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
  getAll: async (params?: { event_id?: string; creatorUserId?: string }): Promise<TicketType[]> => {
    const qs = new URLSearchParams();
    if (params?.event_id) qs.set("event_id", params.event_id);
    if (params?.creatorUserId) qs.set("creatorUserId", params.creatorUserId);
    const res = await request<{ success: boolean; data: TicketType[] } | TicketType[]>(
      `/api/ticket-types${qs.toString() ? "?" + qs.toString() : ""}`
    );
    return Array.isArray(res) ? res : ((res as { data: TicketType[] }).data ?? []);
  },

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

export interface CreateEvenementJsonPayload {
  titre: string;
  description?: string | null;
  date_debut?: string | null;
  date_fin?: string | null;
  image_flayer?: string | null;
  lieu?: string | null;
  heure_debut?: string;
  heure_fin?: string;
  objectifs?: string[] | null;
  programme?: { heure: string; activite: string }[] | null;
  format?: string;
  description_type_format?: string | null;
  lien_url?: string | null;
  type_audience?: string | null;
  filiere_concerner?: string[] | null;
  cequiInclu?: string[] | null;
  exiger_kyc_verifie?: boolean;
  gratuit_membre_uniquement?: boolean;
  gratuit_pour_tous?: boolean;
  activer_matchmaking_b2b?: boolean;
  intervenants?: { nom_complet: string; titre_fonction: string; entreprise_organisation: string; image?: string | null }[] | null;
  autoriser_liste_attente?: boolean;
  generer_qr_checkin?: boolean;
  attestation_participation?: boolean;
  partage_photos_autorise?: boolean;
  informations_pratiques?: Record<string, string> | null;
  prix?: string;
  prix_membre?: string;
  capacite_max?: number;
  isActive?: boolean;
  ala_une?: boolean;
  type_evenement_id?: string;
  region_id?: string | null;
  filiere_id?: string | null;
}

export const createEvenementApiJson = (payload: CreateEvenementJsonPayload): Promise<Evenement> =>
  request<{ data: Evenement } | Evenement>("/api/evenements", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((res) => (res as { data: Evenement }).data ?? (res as Evenement));

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

export interface BoutiqueCertificationStatus {
  boutiqueId: string;
  current: unknown;
  certified: boolean;
  badgeType: string | null;
  scoreLocal: number | null;
  validUntil: string | null;
}

export interface CertificationDocument {
  type: string;
  label: string;
  description: string;
  isRequired: boolean;
  status: "pending" | "validated" | "rejected";
  fileUrls: string[];
  submittedAt: string | null;
  adminComment: string | null;
}

export interface CertificationDocumentsData {
  boutiqueId: string;
  required: { completed: number; total: number };
  documents: CertificationDocument[];
}

export interface CertificationProductBadge {
  id: string;
  name: string;
  boutiqueId: string;
  boutiqueBadgeType: string | null;
  productBadgeType: string | null;
  effectiveBadgeType: string | null;
  inheritFromBoutique: boolean;
}

export const boutiqueCertificationApi = {
  getCertification: async (boutiqueId: string): Promise<BoutiqueCertificationStatus> => {
    const res = await request<{ success: boolean; data: BoutiqueCertificationStatus }>(
      `/api/marketplace/boutiques/${boutiqueId}/certification`
    );
    return res.data;
  },

  submitRequest: async (
    boutiqueId: string,
    body: {
      badgeType: string;
      processDescription: string;
      scoreLocal: number;
      documentsUrls?: string[];
    }
  ): Promise<unknown> => {
    const res = await request<{ success: boolean; data: unknown }>(
      `/api/marketplace/boutiques/${boutiqueId}/certification/request`,
      { method: "POST", body: JSON.stringify(body) }
    );
    return res;
  },

  getDocuments: async (boutiqueId: string): Promise<CertificationDocumentsData> => {
    const res = await request<{ success: boolean; data: CertificationDocumentsData }>(
      `/api/marketplace/boutiques/${boutiqueId}/certification/documents`
    );
    return res.data;
  },

  updateDocument: async (
    boutiqueId: string,
    body: { type: string; fileUrls: string[]; status?: string }
  ): Promise<unknown> => {
    const res = await request<{ success: boolean; data: unknown }>(
      `/api/marketplace/boutiques/${boutiqueId}/certification/documents`,
      { method: "PUT", body: JSON.stringify(body) }
    );
    return res;
  },

  /**
   * Upload un ou plusieurs fichiers en multipart puis soumet les URLs au PUT JSON.
   * Endpoint d'upload : POST /api/media/upload (champ "file" par fichier).
   */
  uploadDocumentFiles: async (
    boutiqueId: string,
    type: string,
    files: File[],
    existingUrls: string[] = []
  ): Promise<unknown> => {
    const token = getToken();
    const authHeaders: Record<string, string> = {};
    if (token) authHeaders["Authorization"] = `Bearer ${token}`;

    // 1. Upload chaque fichier et récupère son URL
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch(`${API_BASE}/api/media/upload`, {
        method: "POST",
        headers: authHeaders,
        body: fd,
      });
      if (!upRes.ok) {
        let msg = `Erreur upload ${upRes.status}`;
        try { const b = await upRes.json(); msg = b?.message || b?.error || msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      const upJson = await upRes.json();
      const url: string = upJson?.url ?? upJson?.data?.url ?? upJson?.data?.fileUrl ?? upJson?.fileUrl;
      if (!url) throw new Error("L'API n'a pas retourné d'URL pour le fichier uploadé.");
      uploadedUrls.push(url);
    }

    // 2. PUT JSON avec toutes les URLs (existantes + nouvelles)
    const res = await request<{ success: boolean; data: unknown }>(
      `/api/marketplace/boutiques/${boutiqueId}/certification/documents`,
      {
        method: "PUT",
        body: JSON.stringify({
          type,
          status: "pending",
          fileUrls: [...existingUrls, ...uploadedUrls],
        }),
      }
    );
    return res;
  },

  getProductsBadges: async (boutiqueId: string): Promise<CertificationProductBadge[]> => {
    const res = await request<{ success: boolean; data: CertificationProductBadge[] }>(
      `/api/marketplace/boutiques/${boutiqueId}/certification/products-badges`
    );
    return res.data;
  },

  updateBadgePropagation: async (
    boutiqueId: string,
    body: {
      applyToAll?: boolean;
      inheritFromBoutiqueForAll?: boolean;
      overrides?: { productId: string; inheritFromBoutique: boolean }[];
    }
  ): Promise<unknown> => {
    const res = await request<{ success: boolean; data: unknown }>(
      `/api/marketplace/boutiques/${boutiqueId}/certification/badge-propagation`,
      { method: "PUT", body: JSON.stringify(body) }
    );
    return res;
  },
};

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

export interface ProductsPage {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export const productsApi = {
  getById: async (id: string): Promise<Product> => {
    const res = await request<{ success: boolean; data: Product }>(`/api/products/${id}`);
    return res.data;
  },

  getAll: async (params?: {
    boutiqueId?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductsPage> => {
    const query = new URLSearchParams();
    if (params?.boutiqueId) query.set("boutiqueId", params.boutiqueId);
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.type && params.type !== "all") query.set("type", params.type);
    if (params?.page) query.set("page", String(params.page));
    query.set("limit", String(params?.limit ?? 50));
    const res = await request<{ success: boolean; data: ProductsPage }>(
      `/api/products?${query.toString()}`
    );
    return res.data;
  },

  create: async (body: Record<string, unknown>): Promise<Product> => {
    const res = await request<{ success: boolean; data: Product } | Product>(
      "/api/products",
      { method: "POST", body: JSON.stringify(body) }
    );
    return (res as { data: Product }).data ?? (res as Product);
  },

  update: async (id: string, body: Record<string, unknown>): Promise<Product> => {
    const res = await request<{ success: boolean; data: Product } | Product>(
      `/api/products/${id}`,
      { method: "PATCH", body: JSON.stringify(body) }
    );
    return (res as { data: Product }).data ?? (res as Product);
  },

  delete: async (id: string): Promise<void> => {
    await request<void>(`/api/products/${id}`, { method: "DELETE" });
  },
};

export interface FormationLecon {
  id: string;
  titre: string;
  type_contenu: "video" | "pdf" | "texte" | string;
  contenu: string;
  chapitre_id: string;
}

export interface FormationChapitre {
  id: string;
  titre: string;
  formation_id: string;
  lecons: FormationLecon[];
}

export interface FormationFormateur {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  titre: string | null;
  bio: string | null;
  photo: string | null;
  linkedin: string | null;
  website: string | null;
  statut: string | null;
  motifAnnulation: string | null;
  creator_user_id?: string;
}

export interface FormateurAvecFormations extends FormationFormateur {
  formations: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    price: string | null;
    price_member: string | null;
    duration: number;
    isActive: boolean;
    isPaid: boolean;
    mode: string;
    location: string | null;
    lien: string | null;
    fichier: string | null;
    date: string | null;
    image: string | null;
    niveau: "beginner" | "intermediate" | "advanced" | null;
    participants: Array<{ id: string }>;
  }>;
}

export const formateursApi = {
  getByCreator: async (creatorUserId: string): Promise<FormateurAvecFormations[]> => {
    const res = await request<FormateurAvecFormations[] | { success: boolean; data: FormateurAvecFormations[] }>(
      `/api/formation/formateurs?creatorUserId=${encodeURIComponent(creatorUserId)}`
    );
    const list = Array.isArray(res) ? res : ((res as { data: FormateurAvecFormations[] }).data ?? []);
    return list.map((f) => ({
      ...f,
      photo: f.photo ? decodeHtml(f.photo) : null,
      linkedin: f.linkedin ? decodeHtml(f.linkedin) : null,
      website: f.website ? decodeHtml(f.website) : null,
    }));
  },

  create: async (payload: {
    firstname: string;
    lastname: string;
    email?: string;
    phone?: string;
    titre?: string;
    bio?: string;
    linkedin?: string;
    website?: string;
    statut?: string;
    motifAnnulation?: string;
    photo?: File | null;
  }): Promise<FormationFormateur> => {
    const fd = new FormData();
    fd.append("firstname", payload.firstname);
    fd.append("lastname", payload.lastname);
    if (payload.email)           fd.append("email",           payload.email);
    if (payload.phone)           fd.append("phone",           payload.phone);
    if (payload.titre)           fd.append("titre",           payload.titre);
    if (payload.bio)             fd.append("bio",             payload.bio);
    if (payload.linkedin)        fd.append("linkedin",        payload.linkedin);
    if (payload.website)         fd.append("website",         payload.website);
    if (payload.statut)          fd.append("statut",          payload.statut);
    if (payload.motifAnnulation) fd.append("motifAnnulation", payload.motifAnnulation);
    if (payload.photo)           fd.append("photo",           payload.photo);
    const res = await requestMultipart<{ success: boolean; data: FormationFormateur }>(
      "/api/formation/formateurs", fd
    );
    return res.data;
  },

  getAll: async (): Promise<FormateurAvecFormations[]> => {
    const res = await request<FormateurAvecFormations[] | { success: boolean; data: FormateurAvecFormations[] }>(
      "/api/formation/formateurs", { skipAuth: true }
    );
    const list = Array.isArray(res) ? res : ((res as { data: FormateurAvecFormations[] }).data ?? []);

    // Dédupliquer par email et fusionner les formations
    const byEmail = new Map<string, FormateurAvecFormations>();
    for (const f of list) {
      const decoded: FormateurAvecFormations = {
        ...f,
        photo: f.photo ? decodeHtml(f.photo) : null,
        linkedin: f.linkedin ? decodeHtml(f.linkedin) : null,
        website: f.website ? decodeHtml(f.website) : null,
      };
      const existing = byEmail.get(f.email);
      if (existing) {
        // Fusionner les formations (éviter les doublons par id)
        const existingIds = new Set(existing.formations.map((fo) => fo.id));
        const newFormations = decoded.formations.filter((fo) => !existingIds.has(fo.id));
        existing.formations = [...existing.formations, ...newFormations];
        // Enrichir les champs vides si la nouvelle entrée a de meilleures données
        if (!existing.photo && decoded.photo) existing.photo = decoded.photo;
        if (!existing.titre && decoded.titre) existing.titre = decoded.titre;
        if (!existing.bio && decoded.bio) existing.bio = decoded.bio;
        if (!existing.phone && decoded.phone) existing.phone = decoded.phone;
        if (!existing.linkedin && decoded.linkedin) existing.linkedin = decoded.linkedin;
        if (!existing.website && decoded.website) existing.website = decoded.website;
      } else {
        byEmail.set(f.email, decoded);
      }
    }

    return Array.from(byEmail.values());
  },
};

export interface ParticipantUserDetails {
  id: string;
  role: string;
  name: string;
  email: string;
  phone: string;
}

export interface FormationParticipant {
  id: string;
  formation_id: string;
  formation: FormationAPI | null;
  user_id: string;
  user_details?: ParticipantUserDetails | null;
  status: string;
  progression: string;
  grade: string | null;
  registered_at: string;
  confirmed_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
  certificat_delivre: boolean;
  certificat_delivre_at: string | null;
  feedback: string | null;
  created_at: string;
}

export const participantsApi = {
  getAll: async (): Promise<FormationParticipant[]> => {
    const res = await request<{ success: boolean; data: FormationParticipant[] } | FormationParticipant[]>(
      "/api/formation/participants"
    );
    return Array.isArray(res) ? res : ((res as { data: FormationParticipant[] }).data ?? []);
  },

  getByFormation: async (formationId: string): Promise<FormationParticipant[]> => {
    const res = await request<{ success: boolean; data: FormationParticipant[] } | FormationParticipant[]>(
      `/api/formation/participants/formation/${encodeURIComponent(formationId)}`
    );
    return Array.isArray(res) ? res : ((res as { data: FormationParticipant[] }).data ?? []);
  },

  getByUser: async (userId: string): Promise<FormationParticipant[]> => {
    const res = await request<{ success: boolean; data: FormationParticipant[] } | FormationParticipant[]>(
      `/api/formation/participants/user/${encodeURIComponent(userId)}`
    );
    return Array.isArray(res) ? res : ((res as { data: FormationParticipant[] }).data ?? []);
  },
};

export interface FormationAPI {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string | null;
  price_member: string | null;
  duration: number;
  isActive: boolean;
  isPaid: boolean;
  mode: "a_son_rythme" | "presentiel" | "webinaire" | "live" | string;
  location: string | null;
  lien: string | null;
  fichier: string | null;
  date: string | null;
  image: string | null;
  niveau: "beginner" | "intermediate" | "advanced" | null;
  formateur: FormationFormateur | null;
  centreFormation: { id: string; nom: string; adresse: string; ville: string; telephone?: string; email?: string } | null;
  chapitres: FormationChapitre[];
  devoirs?: FormationDevoir[];
  participants: FormationParticipant[];
  competences: string[];
  certification_delivrer_badge: boolean;
  certification_nom_badge: string | null;
  certification_quiz_reussi?: boolean;
  certification_progression_100?: boolean;
  certification_devoir_valide?: boolean;
  certification_presence_live?: boolean;
  creator_user_id?: string | null;
  creator_role?: string | null;
  created_at: string;
  updated_at: string;
}

export const formationsApi = {
  getByCreator: async (creatorUserId: string): Promise<FormationAPI[]> => {
    const res = await request<{ success: boolean; data: FormationAPI[] } | FormationAPI[]>(
      `/api/formation/formations?creatorUserId=${encodeURIComponent(creatorUserId)}`
    );
    const list = Array.isArray(res) ? res : ((res as { data: FormationAPI[] }).data ?? []);
    return list.map((f) => ({
      ...f,
      lien: f.lien ? decodeHtml(f.lien) : null,
      fichier: f.fichier ? decodeHtml(f.fichier) : null,
      image: f.image ? decodeHtml(f.image) : null,
      formateur: f.formateur ? {
        ...f.formateur,
        linkedin: f.formateur.linkedin ? decodeHtml(f.formateur.linkedin) : null,
        website: f.formateur.website ? decodeHtml(f.formateur.website) : null,
        photo: f.formateur.photo ? decodeHtml(f.formateur.photo) : null,
      } : null,
    }));
  },

  getAll: async (): Promise<FormationAPI[]> => {
    const res = await request<{ success: boolean; data: FormationAPI[] } | FormationAPI[]>(
      "/api/formation/formations", { skipAuth: true }
    );
    const list = Array.isArray(res) ? res : ((res as { data: FormationAPI[] }).data ?? []);
    return list.map((f) => ({
      ...f,
      lien: f.lien ? decodeHtml(f.lien) : null,
      fichier: f.fichier ? decodeHtml(f.fichier) : null,
      image: f.image ? decodeHtml(f.image) : null,
      formateur: f.formateur ? {
        ...f.formateur,
        linkedin: f.formateur.linkedin ? decodeHtml(f.formateur.linkedin) : null,
        website: f.formateur.website ? decodeHtml(f.formateur.website) : null,
        photo: f.formateur.photo ? decodeHtml(f.formateur.photo) : null,
      } : null,
    }));
  },

  getPublic: async (params?: {
    q?: string;
    category?: string;
    niveau?: string;
    mode?: string;
    isPaid?: string;
    priceMin?: string;
    priceMax?: string;
    sort?: "date" | "title" | "price" | "price_desc";
  }): Promise<FormationAPI[]> => {
    const qs = new URLSearchParams();
    if (params?.q)        qs.set("q",        params.q);
    if (params?.category) qs.set("category", params.category);
    if (params?.niveau)   qs.set("niveau",   params.niveau);
    if (params?.mode)     qs.set("mode",     params.mode);
    if (params?.isPaid)   qs.set("isPaid",   params.isPaid);
    if (params?.priceMin) qs.set("priceMin", params.priceMin);
    if (params?.priceMax) qs.set("priceMax", params.priceMax);
    if (params?.sort)     qs.set("sort",     params.sort);
    const url = `/api/formation/formations/public${qs.toString() ? "?" + qs.toString() : ""}`;
    const res = await request<{ success: boolean; data: FormationAPI[] } | FormationAPI[]>(url);
    const list = Array.isArray(res) ? res : ((res as { data: FormationAPI[] }).data ?? []);
    return list.map((f) => ({
      chapitres: [],
      participants: [],
      competences: [],
      ...f,
      lien: f.lien ? decodeHtml(f.lien) : null,
      fichier: f.fichier ? decodeHtml(f.fichier) : null,
      image: f.image ? decodeHtml(f.image) : null,
      formateur: f.formateur ? {
        ...f.formateur,
        linkedin: f.formateur.linkedin ? decodeHtml(f.formateur.linkedin) : null,
        website: f.formateur.website ? decodeHtml(f.formateur.website) : null,
        photo: f.formateur.photo ? decodeHtml(f.formateur.photo) : null,
      } : null,
    }));
  },

  getById: async (id: string): Promise<FormationAPI> => {
    const res = await request<{ success: boolean; data: FormationAPI } | FormationAPI>(
      `/api/formation/formations/${id}`, { skipAuth: true }
    );
    const f = (res as { data: FormationAPI }).data ?? (res as FormationAPI);
    return {
      ...f,
      lien: f.lien ? decodeHtml(f.lien) : null,
      fichier: f.fichier ? decodeHtml(f.fichier) : null,
      image: f.image ? decodeHtml(f.image) : null,
      formateur: f.formateur ? {
        ...f.formateur,
        linkedin: f.formateur.linkedin ? decodeHtml(f.formateur.linkedin) : null,
        website: f.formateur.website ? decodeHtml(f.formateur.website) : null,
        photo: f.formateur.photo ? decodeHtml(f.formateur.photo) : null,
      } : null,
    };
  },

  create: async (payload: {
    title: string;
    description?: string;
    category?: string;
    mode?: string;
    niveau?: string | null;
    duration?: number;
    isPaid?: boolean;
    isActive?: boolean;
    price?: number;
    price_member?: number;
    moduleId?: string;
    formateur_id?: string;
    centreFormationId?: string;
    lien?: string;
    date?: string;
    certification_delivrer_badge?: boolean;
    certification_quiz_reussi?: boolean;
    certification_progression_100?: boolean;
    certification_devoir_valide?: boolean;
    certification_presence_live?: boolean;
    certification_nom_badge?: string;
    chapitres?: unknown[];
    image?: File | null;
    fichier?: File | null;
  }): Promise<FormationAPI> => {
    const fd = new FormData();
    fd.append("title", payload.title);
    if (payload.description) fd.append("description", payload.description);
    if (payload.category) fd.append("category", payload.category);
    if (payload.mode) fd.append("mode", payload.mode);
    if (payload.niveau !== undefined) fd.append("niveau", payload.niveau ?? "");
    if (payload.duration != null) fd.append("duration", String(payload.duration));
    if (payload.isPaid != null) fd.append("isPaid", String(payload.isPaid));
    if (payload.isActive != null) fd.append("isActive", String(payload.isActive));
    if (payload.price != null) fd.append("price", String(payload.price));
    if (payload.price_member != null) fd.append("price_member", String(payload.price_member));
    if (payload.moduleId) fd.append("moduleId", payload.moduleId);
    if (payload.formateur_id) fd.append("formateur_id", payload.formateur_id);
    if (payload.centreFormationId) fd.append("centreFormationId", payload.centreFormationId);
    if (payload.lien) fd.append("lien", payload.lien);
    if (payload.date) fd.append("date", payload.date);
    if (payload.certification_delivrer_badge != null) fd.append("certification_delivrer_badge", String(payload.certification_delivrer_badge));
    if (payload.certification_quiz_reussi != null) fd.append("certification_quiz_reussi", String(payload.certification_quiz_reussi));
    if (payload.certification_progression_100 != null) fd.append("certification_progression_100", String(payload.certification_progression_100));
    if (payload.certification_devoir_valide != null) fd.append("certification_devoir_valide", String(payload.certification_devoir_valide));
    if (payload.certification_presence_live != null) fd.append("certification_presence_live", String(payload.certification_presence_live));
    if (payload.certification_nom_badge) fd.append("certification_nom_badge", payload.certification_nom_badge);
    if (payload.chapitres?.length) fd.append("chapitres", JSON.stringify(payload.chapitres));
    if (payload.image) fd.append("image", payload.image);
    if (payload.fichier) fd.append("fichier", payload.fichier);
    return requestMultipart<FormationAPI>("/api/formation/formations", fd);
  },

  update: async (id: string, payload: {
    title?: string;
    description?: string;
    category?: string;
    mode?: string;
    niveau?: string;
    duration?: number;
    isPaid?: boolean;
    isActive?: boolean;
    price?: number;
    price_member?: number;
    moduleId?: string;
    formateur_id?: string;
    image?: File | null;
    fichier?: File | null;
  }): Promise<FormationAPI> => {
    const fd = new FormData();
    if (payload.title)        fd.append("title",        payload.title);
    if (payload.description)  fd.append("description",  payload.description);
    if (payload.category)     fd.append("category",     payload.category);
    if (payload.mode)         fd.append("mode",         payload.mode);
    if (payload.niveau)       fd.append("niveau",       payload.niveau);
    if (payload.duration != null)    fd.append("duration",    String(payload.duration));
    if (payload.isPaid != null)      fd.append("isPaid",      String(payload.isPaid));
    if (payload.isActive != null)    fd.append("isActive",    String(payload.isActive));
    if (payload.price != null)       fd.append("price",       String(payload.price));
    if (payload.price_member != null) fd.append("price_member", String(payload.price_member));
    if (payload.moduleId)     fd.append("moduleId",     payload.moduleId);
    if (payload.formateur_id) fd.append("formateur_id", payload.formateur_id);
    if (payload.image)        fd.append("image",        payload.image);
    if (payload.fichier)      fd.append("fichier",      payload.fichier);
    return requestMultipart<FormationAPI>(`/api/formation/formations/${id}`, fd, "PATCH");
  },

  delete: async (id: string): Promise<void> => {
    await request<void>(`/api/formation/formations/${id}`, { method: "DELETE" });
  },
};

export interface CentreFormation {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  description: string | null;
  telephone: string;
  email: string;
}

export const centreFormationsApi = {
  getAll: async (): Promise<CentreFormation[]> => {
    const res = await request<{ success: boolean; data: CentreFormation[] }>(
      "/api/centre-formations", { skipAuth: true }
    );
    return res.data;
  },
};

export interface FormationModule {
  id: string;
  nom: string;
  description: string | null;
}

export const formationModulesApi = {
  getAll: async (): Promise<FormationModule[]> => {
    const res = await request<{ success: boolean; data: FormationModule[] }>(
      "/api/formation/modules"
    );
    return res.data;
  },
};

export interface FormationCategorie {
  id: string;
  name: string;
  ordre: number;
}

export const formationCategoriesApi = {
  getAll: async (): Promise<FormationCategorie[]> => {
    const res = await request<{ success: boolean; data: FormationCategorie[] }>(
      "/api/formation/categories"
    );
    return res.data;
  },
};

export interface SousFiliere {
  id: string;
  name: string;
  filiere_id: string;
  filiere: {
    id: string;
    name: string;
    secteur_id: string;
    isActive: boolean;
  };
  isActive: boolean;
}

export const sousFiliereApi = {
  getAll: async (): Promise<SousFiliere[]> => {
    const res = await request<{ success: boolean; data: SousFiliere[] }>(
      "/api/sous-filieres"
    );
    return res.data.filter((s) => s.isActive).sort((a, b) => a.name.localeCompare(b.name, "fr"));
  },
};

export interface MonInscription {
  participantId: string;
  formation: FormationAPI;
  status: "pending" | "confirmed" | "started" | "completed" | string;
  progression: number | null;
  registeredAt: string;
  confirmedAt: string | null;
}

export interface MonProgression {
  participantId: string;
  formationId: string;
  formationTitle: string;
  progression: number;
  progressPercent: number;
  status: string;
  grade: string | null;
  currentLeconId: string | null;
  completedLeconIds: string[];
  singleBlockCompleted: boolean;
  lastAccessedAt: string | null;
}

export const mesCoursApi = {
  getMesFormations: async (): Promise<MonInscription[]> => {
    const res = await request<{ success: boolean; data: (Omit<MonInscription, "formation"> & { formation: FormationAPI | null })[] }>(
      "/api/formation/participant/me/formations"
    );
    return res.data
      .filter((item) => item.formation !== null)
      .map((item) => ({
        ...item,
        formation: {
          ...item.formation!,
          lien: item.formation!.lien ? decodeHtml(item.formation!.lien) : null,
          fichier: item.formation!.fichier ? decodeHtml(item.formation!.fichier) : null,
          image: item.formation!.image ? decodeHtml(item.formation!.image) : null,
          formateur: item.formation!.formateur ? {
            ...item.formation!.formateur,
            linkedin: item.formation!.formateur.linkedin ? decodeHtml(item.formation!.formateur.linkedin) : null,
            website: item.formation!.formateur.website ? decodeHtml(item.formation!.formateur.website) : null,
            photo: item.formation!.formateur.photo ? decodeHtml(item.formation!.formateur.photo) : null,
          } : null,
        },
      }));
  },

  getMesProgressions: async (): Promise<MonProgression[]> => {
    const res = await request<{ success: boolean; data: MonProgression[] }>(
      "/api/formation/participant/me/progression"
    );
    return res.data ?? [];
  },
};

export interface FormationDevoir {
  id: string;
  titre: string;
  description: string | null;
  consignes: string | null;
  date_limite: string | null;
  formation_id: string;
  chapitre_id: string | null;
  lecon_id: string | null;
  created_at: string;
  updated_at: string;
}

export const devoirsApi = {
  getByFormation: async (formationId: string): Promise<FormationDevoir[]> => {
    const res = await request<{ success: boolean; data: FormationDevoir[] } | FormationDevoir[]>(
      `/api/formation/devoirs?formation_id=${encodeURIComponent(formationId)}`
    );
    return Array.isArray(res) ? res : ((res as { data: FormationDevoir[] }).data ?? []);
  },

  create: async (payload: {
    titre: string;
    description?: string;
    consignes?: string;
    date_limite?: string;
    formation_id: string;
    chapitre_id?: string;
    lecon_id?: string;
  }): Promise<FormationDevoir> => {
    const res = await request<{ success: boolean; data: FormationDevoir } | FormationDevoir>(
      "/api/formation/devoirs",
      { method: "POST", body: JSON.stringify(payload) }
    );
    return (res as { data: FormationDevoir }).data ?? (res as FormationDevoir);
  },

  update: async (id: string, payload: {
    titre?: string;
    description?: string;
    consignes?: string;
    date_limite?: string;
    formation_id?: string;
    chapitre_id?: string;
    lecon_id?: string;
  }): Promise<FormationDevoir> => {
    const res = await request<{ success: boolean; data: FormationDevoir } | FormationDevoir>(
      `/api/formation/devoirs/${id}`,
      { method: "PATCH", body: JSON.stringify(payload) }
    );
    return (res as { data: FormationDevoir }).data ?? (res as FormationDevoir);
  },

  delete: async (id: string): Promise<void> => {
    await request<void>(`/api/formation/devoirs/${id}`, { method: "DELETE" });
  },
};

export const chapitresApi = {
  getByFormation: async (formationId: string): Promise<FormationChapitre[]> => {
    const res = await request<{ success: boolean; data: FormationChapitre[] } | FormationChapitre[]>(
      `/api/formation/chapitres?formation_id=${encodeURIComponent(formationId)}`
    );
    return Array.isArray(res) ? res : ((res as { data: FormationChapitre[] }).data ?? []);
  },

  create: async (payload: {
    formation_id: string;
    titre: string;
    lecons?: Array<{ titre: string; type_contenu: string; fileField?: string; contenu?: string }>;
    files?: { [fieldName: string]: File };
  }): Promise<FormationChapitre> => {
    const fd = new FormData();
    fd.append("formation_id", payload.formation_id);
    fd.append("titre", payload.titre);
    if (payload.lecons?.length) {
      fd.append("lecons", JSON.stringify(payload.lecons));
    }
    if (payload.files) {
      for (const [key, file] of Object.entries(payload.files)) {
        fd.append(key, file);
      }
    }
    const res = await requestMultipart<{ success: boolean; data: FormationChapitre } | FormationChapitre>(
      "/api/formation/chapitres", fd
    );
    return (res as { data: FormationChapitre }).data ?? (res as FormationChapitre);
  },

  update: async (id: string, payload: {
    titre?: string;
    formation_id?: string;
    lecons?: Array<{ titre: string; type_contenu: string; fileField?: string; contenu?: string }>;
    leconIdsToDelete?: string[];
    files?: { [fieldName: string]: File };
  }): Promise<FormationChapitre> => {
    const fd = new FormData();
    if (payload.titre) fd.append("titre", payload.titre);
    if (payload.formation_id) fd.append("formation_id", payload.formation_id);
    if (payload.lecons?.length) fd.append("lecons", JSON.stringify(payload.lecons));
    if (payload.leconIdsToDelete?.length) fd.append("leconIdsToDelete", JSON.stringify(payload.leconIdsToDelete));
    if (payload.files) {
      for (const [key, file] of Object.entries(payload.files)) {
        fd.append(key, file);
      }
    }
    const res = await requestMultipart<{ success: boolean; data: FormationChapitre } | FormationChapitre>(
      `/api/formation/chapitres/${id}`, fd, "PATCH"
    );
    return (res as { data: FormationChapitre }).data ?? (res as FormationChapitre);
  },

  delete: async (id: string): Promise<void> => {
    await request<void>(`/api/formation/chapitres/${id}`, { method: "DELETE" });
  },
};

export const leconsApi = {
  update: async (
    id: string,
    payload: {
      titre?: string;
      type_contenu?: string;
      chapitre_id?: string;
      file?: File;
    }
  ): Promise<FormationLecon> => {
    const fd = new FormData();
    if (payload.titre) fd.append("titre", payload.titre);
    if (payload.type_contenu) fd.append("type_contenu", payload.type_contenu);
    if (payload.chapitre_id) fd.append("chapitre_id", payload.chapitre_id);
    if (payload.file) fd.append("contenu", payload.file);
    const res = await requestMultipart<{ success: boolean; data: FormationLecon } | FormationLecon>(
      `/api/formation/chapitres/lecons/${id}`, fd, "PATCH"
    );
    return (res as { data: FormationLecon }).data ?? (res as FormationLecon);
  },

  delete: async (id: string): Promise<void> => {
    await request<void>(`/api/formation/chapitres/lecons/${id}`, { method: "DELETE" });
  },
};

export interface FormationQuiz {
  id: string;
  titre: string;
  description: string | null;
  formation_id: string;
  chapitre_id: string | null;
  lecon_id: string | null;
  created_at: string;
  updated_at: string;
}

export const quizApi = {
  getByFormation: async (formationId: string): Promise<FormationQuiz[]> => {
    const res = await request<{ success: boolean; data: FormationQuiz[] } | FormationQuiz[]>(
      `/api/formation/quiz?formation_id=${encodeURIComponent(formationId)}`
    );
    return Array.isArray(res) ? res : ((res as { data: FormationQuiz[] }).data ?? []);
  },

  create: async (payload: {
    titre: string;
    description?: string;
    formation_id: string;
    chapitre_id?: string;
    lecon_id?: string;
  }): Promise<FormationQuiz> => {
    const res = await request<{ success: boolean; data: FormationQuiz } | FormationQuiz>(
      "/api/formation/quiz",
      { method: "POST", body: JSON.stringify(payload) }
    );
    return (res as { data: FormationQuiz }).data ?? (res as FormationQuiz);
  },

  update: async (id: string, payload: {
    titre?: string;
    description?: string;
    formation_id?: string;
    chapitre_id?: string;
    lecon_id?: string;
  }): Promise<FormationQuiz> => {
    const res = await request<{ success: boolean; data: FormationQuiz } | FormationQuiz>(
      `/api/formation/quiz/${id}`,
      { method: "PATCH", body: JSON.stringify(payload) }
    );
    return (res as { data: FormationQuiz }).data ?? (res as FormationQuiz);
  },

  delete: async (id: string): Promise<void> => {
    await request<void>(`/api/formation/quiz/${id}`, { method: "DELETE" });
  },
};

export interface FormationQuestion {
  id: string;
  texte: string;
  type: "single_choice" | "multiple_choice";
  options: string[];
  reponses_correctes: number[];
  points: number;
  ordre: number | null;
  quiz_id: string | null;
  devoir_id: string | null;
  created_at: string;
  updated_at: string;
}

export const questionsApi = {
  getByQuiz: async (quizId: string): Promise<FormationQuestion[]> => {
    const res = await request<{ success: boolean; data: FormationQuestion[] } | FormationQuestion[]>(
      `/api/formation/questions?quiz_id=${encodeURIComponent(quizId)}`
    );
    return Array.isArray(res) ? res : ((res as { data: FormationQuestion[] }).data ?? []);
  },

  getByDevoir: async (devoirId: string): Promise<FormationQuestion[]> => {
    const res = await request<{ success: boolean; data: FormationQuestion[] } | FormationQuestion[]>(
      `/api/formation/questions?devoir_id=${encodeURIComponent(devoirId)}`
    );
    return Array.isArray(res) ? res : ((res as { data: FormationQuestion[] }).data ?? []);
  },

  create: async (payload: {
    texte: string;
    type: "single_choice" | "multiple_choice";
    options: string[];
    reponses_correctes: number[];
    points?: number;
    quiz_id?: string;
    devoir_id?: string;
    ordre?: number;
  }): Promise<FormationQuestion> => {
    const res = await request<{ success: boolean; data: FormationQuestion } | FormationQuestion>(
      "/api/formation/questions",
      { method: "POST", body: JSON.stringify(payload) }
    );
    return (res as { data: FormationQuestion }).data ?? (res as FormationQuestion);
  },

  update: async (id: string, payload: {
    texte?: string;
    type?: "single_choice" | "multiple_choice";
    options?: string[];
    reponses_correctes?: number[];
    points?: number;
    quiz_id?: string;
    devoir_id?: string;
    ordre?: number;
  }): Promise<FormationQuestion> => {
    const res = await request<{ success: boolean; data: FormationQuestion } | FormationQuestion>(
      `/api/formation/questions/${id}`,
      { method: "PATCH", body: JSON.stringify(payload) }
    );
    return (res as { data: FormationQuestion }).data ?? (res as FormationQuestion);
  },

  delete: async (id: string): Promise<void> => {
    await request<void>(`/api/formation/questions/${id}`, { method: "DELETE" });
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

// ── Certificats ───────────────────────────────────────────────────────────────

export interface TypeCertification {
  id: string;
  nom: string;
  code: string;
  description: string | null;
  niveau: string;
  adminId: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FormationCertificat {
  id: string;
  code: string;
  score: number | null;
  dateCompletion: string | null;
  organizationName: string | null;
  typeCertificationId: string;
  typeCertification: TypeCertification | null;
  formationId: string;
  formation: (FormationAPI & { slug: string | null }) | null;
  participantId: string;
  participant: FormationParticipant | null;
  dateDelivrance: string;
  dateExpiration: string | null;
  dureeValidite: number | null;
  prerequis: string | null;
  competencesCles: string | null;
  nbCertifies: number;
  tauxReussite: string | null;
  couleur: string | null;
  adminId: string;
}

export interface CertificatGenerateData {
  verifyUrl: string;
  [key: string]: unknown;
}

export const certificatsApi = {
  getAll: async (params?: {
    formationId?: string;
    participantId?: string;
    typeCertificationId?: string;
  }): Promise<FormationCertificat[]> => {
    const qs = new URLSearchParams();
    if (params?.formationId) qs.set("formationId", params.formationId);
    if (params?.participantId) qs.set("participantId", params.participantId);
    if (params?.typeCertificationId) qs.set("typeCertificationId", params.typeCertificationId);
    const url = `/api/formation/certificats${qs.toString() ? "?" + qs.toString() : ""}`;
    const res = await request<{ success: boolean; data: FormationCertificat[] } | FormationCertificat[]>(url);
    return Array.isArray(res) ? res : ((res as { data: FormationCertificat[] }).data ?? []);
  },

  generate: async (slug: string): Promise<CertificatGenerateData> => {
    const res = await request<{ success: boolean; data: CertificatGenerateData }>(
      `/api/formation/${encodeURIComponent(slug)}/certificat/generate`
    );
    return (res as { data: CertificatGenerateData }).data ?? (res as unknown as CertificatGenerateData);
  },
};

// ── RAC ──────────────────────────────────────────────────────────────────────

export interface RacRequiredDocument {
  id: string;
  racMetierId: string;
  label: string;
  obligatoire: boolean;
  formats: string[];
  tailleMax: number;
  ordre: number;
}

export interface RacMetier {
  id: string;
  nom: string;
  description: string;
  secteur: string;
  niveau: string;
  publication: boolean;
  requiredDocuments: RacRequiredDocument[];
}

export interface RacDocumentJoint {
  url: string;
  name: string;
  type: string;
}

export interface RacTimelineEvent {
  id: string;
  racId: string;
  eventType: "depot" | "decision" | "revue_document" | "evaluation" | string;
  label: string;
  details: Record<string, unknown>;
  createdBy: string | null;
  created_at: string;
}

export interface RacDossier {
  id: string;
  racMetierId: string;
  racMetier: Omit<RacMetier, "requiredDocuments">;
  candidat: string;
  email: string;
  telephone: string;
  dateDepot: string;
  anneesExperience: number;
  documentsJoints: RacDocumentJoint[];
  statut: string;
  commentaire: string | null;
  decisionFinale: string | null;
  pourcentageValidation: number | null;
  created_at: string;
  updated_at: string;
}

export const racApi = {
  getMetiers: async (): Promise<RacMetier[]> => {
    const res = await request<{ success: boolean; data: RacMetier[] }>(
      "/api/formation/rac-metiers",
      { skipAuth: true }
    );
    return res.data ?? [];
  },

  postuler: async (payload: {
    racMetierId: string;
    candidat: string;
    email: string;
    telephone: string;
    dateDepot: string;
    anneesExperience: number;
    documentsJoints: RacDocumentJoint[];
  }): Promise<unknown> => {
    return request<unknown>("/api/formation/rac", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  getTimeline: async (racId: string): Promise<RacTimelineEvent[]> => {
    const res = await request<{ success: boolean; data: RacTimelineEvent[] }>(
      `/api/formation/rac/${racId}/timeline`
    );
    return res.data ?? [];
  },

  getDossiers: async (email: string): Promise<RacDossier[]> => {
    const res = await request<{ success: boolean; data: RacDossier[] }>(
      "/api/formation/rac"
    );
    const all = res.data ?? [];
    return all.filter((d) => d.email.toLowerCase() === email.toLowerCase());
  },

  fileToBase64: (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`Impossible de lire le fichier : ${file.name}`));
      reader.readAsDataURL(file);
    }),
};
