import { getCookie } from "@/lib/cookies";

const API_BASE = import.meta.env.VITE_API_URL || "https://back.cpupme.ci";

function getToken(): string | null {
  return localStorage.getItem("cpu-access-token") ?? getCookie("cpu-access-token");
}

function decodeHtmlPass(str: string): string {
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

/**
 * Décode les entités HTML encodées par l'API (&#x27; → ', &amp; → &, etc.).
 * L'API renvoie parfois du texte double-encodé (ex: "&amp;#x27;" au lieu de "&#x27;"),
 * donc on répète le décodage jusqu'à stabilisation pour gérer n'importe quel niveau d'imbrication.
 */
export function decodeHtml(str: string): string {
  let current = str;
  for (let next = decodeHtmlPass(current); next !== current; next = decodeHtmlPass(current)) {
    current = next;
  }
  return current;
}

/** Applique decodeHtml récursivement sur toutes les chaînes d'une réponse API (objets/tableaux imbriqués). */
export function decodeHtmlDeep<T>(value: T): T {
  if (typeof value === "string") {
    return decodeHtml(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => decodeHtmlDeep(item)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = decodeHtmlDeep(val);
    }
    return result as T;
  }
  return value;
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
  const data = await res.json();
  return decodeHtmlDeep(data) as T;
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
  const data = await res.json();
  return decodeHtmlDeep(data) as T;
}

export interface Evenement {
  id: string;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string | null;
  image_flayer: string | null;
  lieu: string | null;
  heure_debut: string;
  heure_fin: string | null;
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
  creator_details?: {
    id: string;
    name: string;
    email: string;
    logo: string | null;
    organisation?: {
      display_name: string | null;
      custom_organisation_name: string | null;
      logo: string | null;
    } | null;
  } | null;
}

export interface ParticipantTicket {
  id: string;
  code: string;
  registration_id: string;
  registration_detail_id: string;
  ticket_type_id: string;
  ticket: { id: string; nom: string; prix: string; prix_membre: string } | null;
  event_id: string;
  user_id: string;
  numero: number;
  est_valable: boolean;
  used_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TicketDetail {
  id: string;
  ticket_type: { nom: string; prix: string } | null;
  quantite: number;
  montantTotal: number;
  participant_tickets?: ParticipantTicket[];
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  est_valable: boolean;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  entreprise: string | null;
  total_price: number | string;
  date_commande: string;
  statut_paiement: string;
  details: TicketDetail[];
  participant_tickets: ParticipantTicket[];
  tickets: ParticipantTicket[];
  created_at: string;
  updated_at: string;
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

export interface AbonnementAvantage {
  id: string;
  libelle: string;
  description: string;
  icone: string;
  actif: boolean;
}

export interface AbonnementAPI {
  id: string;
  typeMembreId: string;
  typeMembre: { id: string; name: string; description: string };
  plan: string;
  libelle: string;
  description: string;
  tarifMensuel: string;
  tarifAnnuel: string;
  tarifMinAnnuel: string;
  surDevis: boolean;
  ordre: number;
  isActive: boolean;
  popular: boolean;
  avantages: AbonnementAvantage[];
  limites: {
    nombreProjets: number;
    nombreFormations: number;
    espaceStockage: number;
    supportPrioritaire: boolean;
    accesModules: string[];
  };
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
      modalite_abonnement: "abonnement_mensuel" | "abonnement_annuel";
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

export interface RegistrationParticipant {
  id: string;
  user_id: string;
  event_id: string;
  est_valable: boolean;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  entreprise: string | null;
  total_price: number | string;
  date_commande: string;
  statut_paiement: string;
  details: Array<{
    id: string;
    ticket_type_id: string;
    ticket_type: { id: string; nom: string; prix: string; prix_membre: string } | null;
    quantite: number;
    montantTotal: number;
    participant_tickets?: Array<{ id: string; code: string; numero: number; est_valable: boolean; used_at: string | null }>;
  }>;
  participant_tickets?: Array<{ id: string; code: string; ticket: { nom: string } | null; numero: number; est_valable: boolean; used_at: string | null }>;
  created_at: string;
  updated_at: string;
}

export interface ParticipantTicketAll {
  id: string;
  code: string;
  registration_id: string;
  registration: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone: string | null;
    entreprise: string | null;
    est_valable: boolean;
    statut_paiement: string;
    date_commande: string;
  } | null;
  registration_detail_id: string;
  ticket_type_id: string;
  ticket: {
    id: string;
    nom: string;
    prix: string;
    prix_membre: string;
    quantite_totale: number;
    quantite_restante: number;
  } | null;
  event_id: string;
  user_id: string;
  numero: number;
  est_valable: boolean;
  used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AllEventTicketsResponse {
  eventId: string;
  total: number;
  valables: number;
  utilises: number;
  participantsCount: number;
  tickets: ParticipantTicketAll[];
}

export const participantTicketsApi = {
  getAllByEvent: async (eventId: string, params?: { est_valable?: boolean; ticket_type_id?: string }): Promise<AllEventTicketsResponse> => {
    const qs = new URLSearchParams();
    if (params?.est_valable !== undefined) qs.set("est_valable", String(params.est_valable));
    if (params?.ticket_type_id) qs.set("ticket_type_id", params.ticket_type_id);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    const res = await request<{ success: boolean; data: AllEventTicketsResponse }>(
      `/api/participant-tickets/event/${encodeURIComponent(eventId)}/all${query}`
    );
    return res.data;
  },

  verify: async (codeOrId: string): Promise<ParticipantTicketAll> => {
    const res = await request<{ success: boolean; data: ParticipantTicketAll }>(
      `/api/participant-tickets/verify/${encodeURIComponent(codeOrId)}`
    );
    return res.data;
  },

  validerAcces: async (codeOrId: string): Promise<ParticipantTicketAll> => {
    const res = await request<{ success: boolean; data: ParticipantTicketAll }>(
      `/api/participant-tickets/valider-acces/${encodeURIComponent(codeOrId)}`,
      { method: "POST" }
    );
    return res.data;
  },
};

export const registrationsApi = {
  getByUser: async (userId: string): Promise<Registration[]> => {
    const res = await request<{ success: boolean; data: Registration[] } | Registration[]>(
      `/api/registrations?user_id=${encodeURIComponent(userId)}`
    );
    const list = Array.isArray(res) ? res : (res as { data: Registration[] }).data;
    return list ?? [];
  },

  getAll: async (): Promise<RegistrationParticipant[]> => {
    const res = await request<{ success: boolean; data: RegistrationParticipant[] } | RegistrationParticipant[]>(
      `/api/registrations`
    );
    return Array.isArray(res) ? res : (res as { data: RegistrationParticipant[] }).data ?? [];
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

  getByEvent: async (eventId: string): Promise<RegistrationParticipant[]> => {
    const res = await request<{ success: boolean; data: RegistrationParticipant[] } | RegistrationParticipant[]>(
      `/api/registrations?event_id=${encodeURIComponent(eventId)}`
    );
    return Array.isArray(res) ? res : (res as { data: RegistrationParticipant[] }).data ?? [];
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
  quantite_restante: number;
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
  requirements: string[];
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

export interface MadeInCIBadgeLevelInfo {
  label: string;
  desc: string;
  requirements: string[];
}

export interface MadeInCIGuideSection {
  title: string;
  content?: string;
  steps?: string[];
  items?: string[];
}

export interface MadeInCIDashboardData {
  stats: { approvedCount: number; pendingCount: number };
  demandes: MadeInCIRequest[];
  produits: MadeInCIProduct[];
  badgeLevels: Record<string, MadeInCIBadgeLevelInfo>;
  guide: { title: string; sections: MadeInCIGuideSection[] };
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

export const madeInCIApi = {
  getDashboard: async (): Promise<MadeInCIDashboardData> => {
    const res = await request<{ success: boolean; data: MadeInCIDashboardData }>(
      "/api/marketplace/made-in-ci/dashboard"
    );
    return res.data;
  },
};

export const madeInCIRequestsApi = {
  getMyRequests: async (): Promise<MadeInCIRequest[]> => {
    const res = await request<{ success: boolean; data: { data: MadeInCIRequest[] } }>(
      "/api/marketplace/made-in-ci/requests/me"
    );
    return res.data?.data ?? [];
  },

  getById: async (id: string): Promise<MadeInCIRequest> => {
    const res = await request<{ success: boolean; data: MadeInCIRequest }>(
      `/api/marketplace/made-in-ci/requests/${encodeURIComponent(id)}`
    );
    return res.data;
  },

  /** POST .../made-in-ci/requests — multipart/form-data. */
  submit: async (body: {
    productId: string;
    badgeType: string;
    transformationProcess: string;
    localValueAdded?: number;
    inputInvoices?: File[];
    productionPhotos?: File[];
    proof?: File[];
  }): Promise<unknown> => {
    const fd = new FormData();
    fd.append("productId", body.productId);
    fd.append("badgeType", body.badgeType);
    fd.append("transformationProcess", body.transformationProcess);
    if (body.localValueAdded !== undefined) fd.append("localValueAdded", String(body.localValueAdded));
    (body.inputInvoices ?? []).forEach((f) => fd.append("inputInvoices", f));
    (body.productionPhotos ?? []).forEach((f) => fd.append("productionPhotos", f));
    (body.proof ?? []).forEach((f) => fd.append("proof", f));
    return requestMultipart<{ success: boolean; data: unknown }>(
      "/api/marketplace/made-in-ci/requests",
      fd,
      "POST"
    );
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

export interface Secteur {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isActive?: boolean;
}

export const secteursApi = {
  getAll: async (): Promise<Secteur[]> => {
    const res = await request<{ success: boolean; data: Secteur[] } | Secteur[]>("/api/secteurs");
    const list = Array.isArray(res) ? res : ((res as { data: Secteur[] }).data ?? []);
    return list.filter((s) => s.isActive !== false);
  },
};

export const regionsApi = {
  getAll: async (): Promise<Region[]> => {
    const res = await request<Region[]>("/api/regions");
    return Array.isArray(res) ? res : (res as { data: Region[] }).data ?? [];
  },
};

export interface Commune {
  id: string;
  name: string;
  ville_id: string;
}

export const communesApi = {
  getAll: async (regionId?: string): Promise<Commune[]> => {
    const qs = regionId ? `?regionId=${encodeURIComponent(regionId)}` : "";
    const res = await request<{ success: boolean; data: Commune[] } | Commune[]>(
      `/api/communes${qs}`
    );
    return Array.isArray(res) ? res : ((res as { data: Commune[] }).data ?? []);
  },
};

export interface Ville {
  id: string;
  name: string;
  region_id: string;
  isActive: boolean;
  communes?: { id: string; name: string; ville_id: string; isActive: boolean }[];
}

export const villesApi = {
  getAll: async (): Promise<Ville[]> => {
    const res = await request<{ success: boolean; data: Ville[] } | Ville[]>("/api/villes");
    const list = Array.isArray(res) ? res : ((res as { success: boolean; data: Ville[] }).data ?? []);
    return list.filter((v) => v.isActive);
  },

  getById: async (id: string): Promise<Ville> => {
    const res = await request<{ success: boolean; data: Ville }>(`/api/villes/${encodeURIComponent(id)}`);
    return res.data;
  },
};

export const filieresApi = {
  getAll: async (): Promise<Filiere[]> => {
    const res = await request<{ success: boolean; data: Filiere[] } | Filiere[]>("/api/filieres");
    return Array.isArray(res) ? res : (res as { data: Filiere[] }).data;
  },
};

// ── Familles marketplace ──────────────────────────────────────────────────────

export interface MarketplaceFamille {
  id: string;
  code: string;
  name: string;
  description: string | null;
  filiereIds: string[];
  isActive: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  filieres: { id: string; name: string }[];
}

export const marketplaceFamillesApi = {
  getAll: async (params?: { activeOnly?: boolean }): Promise<MarketplaceFamille[]> => {
    const qs = new URLSearchParams();
    if (params?.activeOnly !== undefined) qs.set("activeOnly", String(params.activeOnly));
    const res = await request<{ success: boolean; data: MarketplaceFamille[] } | MarketplaceFamille[]>(
      `/api/marketplace/familles${qs.toString() ? `?${qs.toString()}` : ""}`
    );
    return Array.isArray(res) ? res : ((res as { data: MarketplaceFamille[] }).data ?? []);
  },
};

// ── Catégories marketplace ────────────────────────────────────────────────────

export interface MarketplaceCategory {
  id: string;
  familleId: string;
  code: string;
  name: string;
  sousFiliereIds: string[];
  isActive: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sousFilieres: { id: string; name: string }[];
}

export interface MarketplaceSousFiliere {
  id: string;
  name: string;
  filiereId: string;
}

export interface MarketplaceSousCategorie {
  id: string;
  categorieId: string;
  activiteId: string;
  code: string;
  name: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const marketplaceCategoriesApi = {
  getAll: async (params?: { familleId?: string; activeOnly?: boolean }): Promise<MarketplaceCategory[]> => {
    const qs = new URLSearchParams();
    if (params?.familleId) qs.set("familleId", params.familleId);
    if (params?.activeOnly !== undefined) qs.set("activeOnly", String(params.activeOnly));
    const res = await request<{ success: boolean; data: MarketplaceCategory[] } | MarketplaceCategory[]>(
      `/api/marketplace/categories${qs.toString() ? `?${qs.toString()}` : ""}`
    );
    return Array.isArray(res) ? res : ((res as { data: MarketplaceCategory[] }).data ?? []);
  },

  getSousFilieresByFamille: async (familleId: string, activeOnly?: boolean): Promise<MarketplaceSousFiliere[]> => {
    const qs = new URLSearchParams();
    if (activeOnly !== undefined) qs.set("activeOnly", String(activeOnly));
    const res = await request<{ success: boolean; data: MarketplaceSousFiliere[] } | MarketplaceSousFiliere[]>(
      `/api/marketplace/categories/familles/${encodeURIComponent(familleId)}/sous-filieres${qs.toString() ? `?${qs.toString()}` : ""}`
    );
    return Array.isArray(res) ? res : ((res as { data: MarketplaceSousFiliere[] }).data ?? []);
  },

  getSousCategories: async (params?: { categorieId?: string; activeOnly?: boolean }): Promise<MarketplaceSousCategorie[]> => {
    const qs = new URLSearchParams();
    if (params?.categorieId) qs.set("categorieId", params.categorieId);
    if (params?.activeOnly !== undefined) qs.set("activeOnly", String(params.activeOnly));
    const res = await request<{ success: boolean; data: MarketplaceSousCategorie[] } | MarketplaceSousCategorie[]>(
      `/api/marketplace/sous-categories${qs.toString() ? `?${qs.toString()}` : ""}`
    );
    return Array.isArray(res) ? res : ((res as { data: MarketplaceSousCategorie[] }).data ?? []);
  },
};

// ── Familles / catégories / sous-catégories de services ──────────────────────

export interface ServiceFamille {
  id: string;
  code: string;
  name: string;
  description: string | null;
  filiereIds: string[];
  isActive: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  filieres: { id: string; name: string }[];
}

export interface ServiceCategory {
  id: string;
  familleId: string;
  code: string;
  name: string;
  sousFiliereIds: string[];
  isActive: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sousFilieres: { id: string; name: string }[];
}

export interface ServiceSousCategorie {
  id: string;
  categorieId: string;
  activiteId: string;
  code: string;
  name: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const serviceFamillesApi = {
  getAll: async (params?: { activeOnly?: boolean }): Promise<ServiceFamille[]> => {
    const qs = new URLSearchParams();
    if (params?.activeOnly !== undefined) qs.set("activeOnly", String(params.activeOnly));
    const res = await request<{ success: boolean; data: ServiceFamille[] } | ServiceFamille[]>(
      `/api/marketplace/service-familles${qs.toString() ? `?${qs.toString()}` : ""}`
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceFamille[] }).data ?? []);
  },
};

export const serviceCategoriesApi = {
  getAll: async (params?: { familleId?: string; activeOnly?: boolean }): Promise<ServiceCategory[]> => {
    const qs = new URLSearchParams();
    if (params?.familleId) qs.set("familleId", params.familleId);
    if (params?.activeOnly !== undefined) qs.set("activeOnly", String(params.activeOnly));
    const res = await request<{ success: boolean; data: ServiceCategory[] } | ServiceCategory[]>(
      `/api/marketplace/service-categories${qs.toString() ? `?${qs.toString()}` : ""}`
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceCategory[] }).data ?? []);
  },
};

export const serviceSousCategoriesApi = {
  getAll: async (params?: { categorieId?: string; activeOnly?: boolean }): Promise<ServiceSousCategorie[]> => {
    const qs = new URLSearchParams();
    if (params?.categorieId) qs.set("categorieId", params.categorieId);
    if (params?.activeOnly !== undefined) qs.set("activeOnly", String(params.activeOnly));
    const res = await request<{ success: boolean; data: ServiceSousCategorie[] } | ServiceSousCategorie[]>(
      `/api/marketplace/service-sous-categories${qs.toString() ? `?${qs.toString()}` : ""}`
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceSousCategorie[] }).data ?? []);
  },
};

// ── Référentiels services (prestation-types, ...) ─────────────────────────────

export interface ServiceReferentialOption {
  value: string;
  label: string;
}

export interface ServiceVatRateOption {
  value: number | string;
  label: string;
}

export const servicesReferentialsApi = {
  getPrestationTypes: async (): Promise<ServiceReferentialOption[]> => {
    const res = await request<{ success: boolean; data: ServiceReferentialOption[] } | ServiceReferentialOption[]>(
      "/api/marketplace/services/referentials/prestation-types"
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceReferentialOption[] }).data ?? []);
  },

  getSpokenLanguages: async (): Promise<ServiceReferentialOption[]> => {
    const res = await request<{ success: boolean; data: ServiceReferentialOption[] } | ServiceReferentialOption[]>(
      "/api/marketplace/services/referentials/spoken-languages"
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceReferentialOption[] }).data ?? []);
  },

  getPricingModels: async (): Promise<ServiceReferentialOption[]> => {
    const res = await request<{ success: boolean; data: ServiceReferentialOption[] } | ServiceReferentialOption[]>(
      "/api/marketplace/services/referentials/pricing-models"
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceReferentialOption[] }).data ?? []);
  },

  getCurrencies: async (): Promise<ServiceReferentialOption[]> => {
    const res = await request<{ success: boolean; data: ServiceReferentialOption[] } | ServiceReferentialOption[]>(
      "/api/marketplace/services/referentials/currencies"
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceReferentialOption[] }).data ?? []);
  },

  getVatRates: async (): Promise<ServiceVatRateOption[]> => {
    const res = await request<{ success: boolean; data: ServiceVatRateOption[] } | ServiceVatRateOption[]>(
      "/api/marketplace/services/referentials/vat-rates"
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceVatRateOption[] }).data ?? []);
  },

  getComplementaryOptionTypes: async (): Promise<ServiceReferentialOption[]> => {
    const res = await request<{ success: boolean; data: ServiceReferentialOption[] } | ServiceReferentialOption[]>(
      "/api/marketplace/services/referentials/complementary-option-types"
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceReferentialOption[] }).data ?? []);
  },

  getWeekDays: async (): Promise<ServiceReferentialOption[]> => {
    const res = await request<{ success: boolean; data: ServiceReferentialOption[] } | ServiceReferentialOption[]>(
      "/api/marketplace/services/referentials/week-days"
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceReferentialOption[] }).data ?? []);
  },

  getInterventionDelays: async (): Promise<ServiceReferentialOption[]> => {
    const res = await request<{ success: boolean; data: ServiceReferentialOption[] } | ServiceReferentialOption[]>(
      "/api/marketplace/services/referentials/intervention-delays"
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceReferentialOption[] }).data ?? []);
  },

  getOrderModes: async (): Promise<ServiceReferentialOption[]> => {
    const res = await request<{ success: boolean; data: ServiceReferentialOption[] } | ServiceReferentialOption[]>(
      "/api/marketplace/services/referentials/order-modes"
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceReferentialOption[] }).data ?? []);
  },

  getDocumentKinds: async (): Promise<ServiceReferentialOption[]> => {
    const res = await request<{ success: boolean; data: ServiceReferentialOption[] } | ServiceReferentialOption[]>(
      "/api/marketplace/services/referentials/document-kinds"
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceReferentialOption[] }).data ?? []);
  },
};

// ── Zones d'intervention services (régions / villes) ─────────────────────────

export interface ServiceInterventionRegion {
  id: string;
  name: string;
  zone: string;
}

export interface ServiceInterventionVille {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
}

export const serviceInterventionZonesApi = {
  getRegions: async (): Promise<ServiceInterventionRegion[]> => {
    const res = await request<{ success: boolean; data: ServiceInterventionRegion[] } | ServiceInterventionRegion[]>(
      "/api/marketplace/services/intervention-zones/regions"
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceInterventionRegion[] }).data ?? []);
  },

  getVilles: async (regionIds: string[]): Promise<ServiceInterventionVille[]> => {
    if (!regionIds.length) return [];
    const qs = new URLSearchParams();
    regionIds.forEach((id) => qs.append("regionIds", id));
    const res = await request<{ success: boolean; data: ServiceInterventionVille[] } | ServiceInterventionVille[]>(
      `/api/marketplace/services/intervention-zones/villes?${qs.toString()}`
    );
    return Array.isArray(res) ? res : ((res as { data: ServiceInterventionVille[] }).data ?? []);
  },
};

// ── Création de service (marketplace) ─────────────────────────────────────────

export interface ServiceCreatePayload {
  boutiqueId: string;
  name: string;
  shortDescription: string;
  description: string;
  serviceSousCategorieId: string;
  prestationType?: string;
  interventionCountry?: string;
  interventionRadiusKm?: number;
  coveredRegionIds?: string[];
  coveredVilleIds?: string[];
  providerPresentation?: string;
  yearsOfExperience?: number;
  collaboratorsCount?: number;
  certifications?: string;
  agreements?: string;
  spokenLanguages?: string[];
  spokenLanguageOther?: string;
  portfolioUrl?: string;
  clientReferences?: string;
  pricingModel?: string;
  price?: number;
  currency?: string;
  vatRate?: number;
  promoPrice?: number;
  strikethroughPrice?: number;
  complementaryOptions?: string; // JSON [{type, additionalPrice}]
  availableDays?: string[];
  timeSlots?: string; // JSON [{day, from, to}]
  emergency24h?: boolean;
  weekendAvailable?: boolean;
  holidaysAvailable?: boolean;
  interventionDelay?: string;
  orderModes?: string[];
  completionDelay?: string;
  generalConditions?: string;
  cancellationPolicy?: string;
  refundPolicy?: string;
  warranty?: string;
  paymentTerms?: string;
  invoicingTerms?: string;
  specialConditions?: string;
  selectedOptionTypes?: string[];
}

export interface ServiceDocumentFiles {
  documentsImages?: File[];
  documentsVideos?: File[];
  documentsPdf?: File[];
  documentsBrochure?: File[];
  documentsCatalogue?: File[];
  documentsGrilleTarifaire?: File[];
  documentsCertificats?: File[];
  documentsAssuranceRc?: File[];
}

export interface MarketplaceService {
  id: string;
  name: string;
  status: string;
  pricingSimulation?: unknown;
  selectedOptionTypes?: string[];
  [key: string]: unknown;
}

export interface ServiceUpdatePayload {
  boutiqueId?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  serviceSousCategorieId?: string;
  status?: string;
  prestationType?: string;
  interventionCountry?: string;
  interventionRadiusKm?: number;
  coveredRegionIds?: string[];
  coveredVilleIds?: string[];
  photoUrl?: string;
  logoUrl?: string;
  providerPresentation?: string;
  yearsOfExperience?: number;
  collaboratorsCount?: number;
  certifications?: string;
  agreements?: string;
  spokenLanguages?: string[];
  spokenLanguageOther?: string;
  portfolioUrl?: string;
  clientReferences?: string;
  pricingModel?: string;
  price?: number;
  currency?: string;
  vatRate?: number;
  promoPrice?: number;
  strikethroughPrice?: number;
  complementaryOptions?: { type: string; additionalPrice: number }[];
  availableDays?: string[];
  timeSlots?: { day: string; from: string; to: string }[];
  emergency24h?: boolean;
  weekendAvailable?: boolean;
  holidaysAvailable?: boolean;
  interventionDelay?: string;
  orderModes?: string[];
  completionDelay?: string;
  generalConditions?: string;
  cancellationPolicy?: string;
  refundPolicy?: string;
  warranty?: string;
  paymentTerms?: string;
  invoicingTerms?: string;
  specialConditions?: string;
}

export const servicesApi = {
  create: async (payload: ServiceCreatePayload, documents?: ServiceDocumentFiles): Promise<MarketplaceService> => {
    const fd = new FormData();
    const appendScalar = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === "") return;
      fd.append(key, String(value));
    };
    const appendArray = (key: string, values?: string[]) => {
      (values ?? []).forEach((v) => { if (v) fd.append(key, v); });
    };

    appendScalar("boutiqueId", payload.boutiqueId);
    appendScalar("name", payload.name);
    appendScalar("shortDescription", payload.shortDescription);
    appendScalar("description", payload.description);
    appendScalar("serviceSousCategorieId", payload.serviceSousCategorieId);
    appendScalar("prestationType", payload.prestationType);
    appendScalar("interventionCountry", payload.interventionCountry);
    appendScalar("interventionRadiusKm", payload.interventionRadiusKm);
    appendArray("coveredRegionIds", payload.coveredRegionIds);
    appendArray("coveredVilleIds", payload.coveredVilleIds);
    appendScalar("providerPresentation", payload.providerPresentation);
    appendScalar("yearsOfExperience", payload.yearsOfExperience);
    appendScalar("collaboratorsCount", payload.collaboratorsCount);
    appendScalar("certifications", payload.certifications);
    appendScalar("agreements", payload.agreements);
    appendArray("spokenLanguages", payload.spokenLanguages);
    appendScalar("spokenLanguageOther", payload.spokenLanguageOther);
    appendScalar("portfolioUrl", payload.portfolioUrl);
    appendScalar("clientReferences", payload.clientReferences);
    appendScalar("pricingModel", payload.pricingModel);
    appendScalar("price", payload.price);
    appendScalar("currency", payload.currency);
    appendScalar("vatRate", payload.vatRate);
    appendScalar("promoPrice", payload.promoPrice);
    appendScalar("strikethroughPrice", payload.strikethroughPrice);
    appendScalar("complementaryOptions", payload.complementaryOptions);
    appendArray("availableDays", payload.availableDays);
    appendScalar("timeSlots", payload.timeSlots);
    if (payload.emergency24h !== undefined) fd.append("emergency24h", String(payload.emergency24h));
    if (payload.weekendAvailable !== undefined) fd.append("weekendAvailable", String(payload.weekendAvailable));
    if (payload.holidaysAvailable !== undefined) fd.append("holidaysAvailable", String(payload.holidaysAvailable));
    appendScalar("interventionDelay", payload.interventionDelay);
    appendArray("orderModes", payload.orderModes);
    appendScalar("completionDelay", payload.completionDelay);
    appendScalar("generalConditions", payload.generalConditions);
    appendScalar("cancellationPolicy", payload.cancellationPolicy);
    appendScalar("refundPolicy", payload.refundPolicy);
    appendScalar("warranty", payload.warranty);
    appendScalar("paymentTerms", payload.paymentTerms);
    appendScalar("invoicingTerms", payload.invoicingTerms);
    appendScalar("specialConditions", payload.specialConditions);
    appendArray("selectedOptionTypes", payload.selectedOptionTypes);

    const docEntries: [string, File[] | undefined][] = [
      ["documentsImages", documents?.documentsImages],
      ["documentsVideos", documents?.documentsVideos],
      ["documentsPdf", documents?.documentsPdf],
      ["documentsBrochure", documents?.documentsBrochure],
      ["documentsCatalogue", documents?.documentsCatalogue],
      ["documentsGrilleTarifaire", documents?.documentsGrilleTarifaire],
      ["documentsCertificats", documents?.documentsCertificats],
      ["documentsAssuranceRc", documents?.documentsAssuranceRc],
    ];
    docEntries.forEach(([key, files]) => (files ?? []).forEach((f) => fd.append(key, f)));

    const res = await requestMultipart<{ success: boolean; data: MarketplaceService } | MarketplaceService>(
      "/api/marketplace/services", fd
    );
    return (res as { data: MarketplaceService }).data ?? (res as MarketplaceService);
  },

  saveDraft: async (id: string, payload?: ServiceUpdatePayload): Promise<MarketplaceService> => {
    const res = await request<{ success: boolean; data: MarketplaceService } | MarketplaceService>(
      `/api/marketplace/services/${id}/save-draft`,
      { method: "POST", body: payload ? JSON.stringify(payload) : undefined }
    );
    return (res as { data: MarketplaceService }).data ?? (res as MarketplaceService);
  },

  submit: async (id: string, payload?: ServiceUpdatePayload): Promise<MarketplaceService> => {
    const res = await request<{ success: boolean; data: MarketplaceService } | MarketplaceService>(
      `/api/marketplace/services/${id}/submit`,
      { method: "POST", body: payload ? JSON.stringify(payload) : undefined }
    );
    return (res as { data: MarketplaceService }).data ?? (res as MarketplaceService);
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
      "/api/marketplace/boutiques",
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
  vendor?: {
    website_url: string | null;
  } | null;
}

export interface BoutiqueCertificationCurrent {
  id: string;
  boutiqueId: string;
  badgeType: string;
  status: string; // submitted | in_audit | rejected | approved | ...
  scoreLocal: string | number | null;
  validUntil: string | null;
  processDescription: string | null;
  progress: number;
  adminComment: string | null;
  submittedAt: string | null;
  created_at: string;
  updated_at: string;
}

export interface BoutiqueCertificationStatus {
  boutiqueId: string;
  current: BoutiqueCertificationCurrent | null;
  certified: boolean;
  badgeType: string | null;
  scoreLocal: number | string | null;
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
  productId: string;
  name: string;
  inheritFromBoutique: boolean;
  boutiqueBadge: string | null;
  ownBadge: string | null;
  effectiveBadge: string | null;
  source: string; // "none" | "boutique" | "product"
}

export interface CertificationChecklistDocument {
  id: string;
  nom: string;
  type: string;
  status: "pending" | "validated" | "rejected" | string;
  dateUpload: string;
  fileUrls: string[];
}

export interface CertificationChecklistItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  document: CertificationChecklistDocument | null;
  status: "missing" | "pending" | "validated" | "rejected" | string;
  submittedAt: string | null;
  fileUrls: string[];
}

export interface CertificationStep {
  step: number;
  label: string;
  desc: string;
  done: boolean;
}

export interface CertificationBadgeLevelInfo {
  label: string;
  minScore: number;
  desc: string;
}

export interface CertificationHistoryEvent {
  date: string;
  action: string;
  detail: string;
  type: string;
}

export interface CertificationDashboardProduct {
  id: string;
  nom: string;
  image: string;
  badgeBoutique: boolean;
  badgeProduit: string | null;
  badgeEffectif: string | null;
  scoreLocal: number;
  source: string;
}

export interface CertificationDashboardData {
  boutiqueId: string;
  certification: {
    status: string; // NonCertifie | EnCours | Audit | Certifie | Refuse | Expire
    niveau: string | null;
    dateDebut: string | null;
    dateExpiration: string | null;
    scoreLocal: number;
    progression: number;
    documents: CertificationChecklistDocument[];
    requestId: string | null;
  };
  checklist: CertificationChecklistItem[];
  produits: CertificationDashboardProduct[];
  produitsAvecBadge: number;
  produitsTotal: number;
  steps: CertificationStep[];
  badgeLevels: Record<string, CertificationBadgeLevelInfo>;
  historique: CertificationHistoryEvent[];
}

export const boutiqueCertificationApi = {
  getDashboard: async (boutiqueId: string): Promise<CertificationDashboardData> => {
    const res = await request<{ success: boolean; data: CertificationDashboardData }>(
      `/api/marketplace/boutiques/${boutiqueId}/certification/dashboard`
    );
    return res.data;
  },

  getHistory: async (boutiqueId: string): Promise<CertificationHistoryEvent[]> => {
    const res = await request<{ success: boolean; data: { data: CertificationHistoryEvent[] } }>(
      `/api/marketplace/boutiques/${boutiqueId}/certification/history`
    );
    return res.data?.data ?? [];
  },

  getCertification: async (boutiqueId: string): Promise<BoutiqueCertificationStatus> => {
    const res = await request<{ success: boolean; data: BoutiqueCertificationStatus }>(
      `/api/marketplace/boutiques/${boutiqueId}/certification`
    );
    return res.data;
  },

  /** POST .../certification/request — multipart/form-data (requestedBadgeType, note, files[]). */
  submitRequest: async (
    boutiqueId: string,
    body: { requestedBadgeType: string; note?: string; files?: File[] }
  ): Promise<unknown> => {
    const fd = new FormData();
    fd.append("requestedBadgeType", body.requestedBadgeType);
    if (body.note) fd.append("note", body.note);
    (body.files ?? []).forEach((f) => fd.append("files", f));
    return requestMultipart<{ success: boolean; data: unknown }>(
      `/api/marketplace/boutiques/${boutiqueId}/certification/request`,
      fd,
      "POST"
    );
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
   * Soumet un document de certification : envoi multipart direct des fichiers.
   * PUT /api/marketplace/boutiques/{boutiqueId}/certification/documents
   * Champs : type (string), note (string, optionnel), files (fichiers).
   */
  uploadDocumentFiles: async (
    boutiqueId: string,
    type: string,
    files: File[],
    note?: string
  ): Promise<unknown> => {
    const fd = new FormData();
    fd.append("type", type);
    if (note) fd.append("note", note);
    files.forEach((f) => fd.append("files", f));
    return requestMultipart<{ success: boolean; data: unknown }>(
      `/api/marketplace/boutiques/${boutiqueId}/certification/documents`,
      fd,
      "PUT"
    );
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

export interface MarketplaceProductUnit {
  id: string;
  name: string;
  symbol: string;
  isActive: boolean;
  sortOrder: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const productUnitsApi = {
  getSalesPicker: async (): Promise<MarketplaceProductUnit[]> => {
    const res = await request<{ success: boolean; data: MarketplaceProductUnit[] } | MarketplaceProductUnit[]>(
      "/api/marketplace/product-units/picker/sales"
    );
    return Array.isArray(res) ? res : ((res as { data: MarketplaceProductUnit[] }).data ?? []);
  },

  getWeightPicker: async (): Promise<MarketplaceProductUnit[]> => {
    const res = await request<{ success: boolean; data: MarketplaceProductUnit[] } | MarketplaceProductUnit[]>(
      "/api/marketplace/product-units/picker/weight"
    );
    return Array.isArray(res) ? res : ((res as { data: MarketplaceProductUnit[] }).data ?? []);
  },

  getDimensionsPicker: async (): Promise<MarketplaceProductUnit[]> => {
    const res = await request<{ success: boolean; data: MarketplaceProductUnit[] } | MarketplaceProductUnit[]>(
      "/api/marketplace/product-units/picker/dimensions"
    );
    return Array.isArray(res) ? res : ((res as { data: MarketplaceProductUnit[] }).data ?? []);
  },
};

export interface RegulatedProductsStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  expiringSoon: number;
}

export interface RegulatedProductDocumentApi {
  id: string;
  type: string;
  nom?: string;
  fichier?: string | null;
  status: string;
  dateUpload?: string | null;
  dateExpiration?: string | null;
  commentaire?: string | null;
  templateKey?: string;
}

export interface RegulatedProductApi {
  id: string;
  productId: string;
  nom: string;
  categorie?: string;
  typeReglementation: string;
  typeReglementationLabel?: string;
  typeReglementationIcon?: string;
  status: string;
  documents: RegulatedProductDocumentApi[];
  dateExpiration?: string | null;
  dernierAudit?: string | null;
  commentaireAdmin?: string | null;
  image?: string | null;
  documentsValidated: number;
  documentsRequired: number;
}

export interface RegulatedProductsPage {
  data: RegulatedProductApi[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: RegulatedProductsStats;
}

export const regulatedProductsApi = {
  getAll: async (params?: {
    status?: string;
    categoryType?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<RegulatedProductsPage> => {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== "all") qs.set("status", params.status);
    if (params?.categoryType) qs.set("categoryType", params.categoryType);
    if (params?.q) qs.set("q", params.q);
    qs.set("page", String(params?.page ?? 1));
    qs.set("limit", String(params?.limit ?? 20));
    const res = await request<{ success: boolean; data: RegulatedProductsPage }>(
      `/api/regulated-products?${qs.toString()}`
    );
    return res.data ?? { data: [], total: 0, page: 1, limit: 20, totalPages: 0, stats: { total: 0, approved: 0, pending: 0, rejected: 0, expiringSoon: 0 } };
  },

  create: async (payload: { productId: string; categoryType?: string; regulatedCategoryId?: string }): Promise<RegulatedProductApi> => {
    const res = await request<{ success: boolean; data: RegulatedProductApi } | RegulatedProductApi>(
      "/api/regulated-products",
      { method: "POST", body: JSON.stringify(payload) }
    );
    return (res as { data: RegulatedProductApi }).data ?? (res as RegulatedProductApi);
  },

  uploadDocument: async (docId: string, file: File, expiresAt?: string): Promise<unknown> => {
    const fd = new FormData();
    fd.append("file", file);
    if (expiresAt) fd.append("expiresAt", expiresAt);
    return requestMultipart<unknown>(`/api/regulated-products/documents/${docId}/upload`, fd);
  },
};

export interface StockVendorKpis {
  totalProduits: number;
  enRupture: number;
  alerteBasse: number;
  alerteCritique: number;
  autoReapproActif: number;
  commandesEnCours: number;
  valeurStock: number;
}

export interface StockAlerteUrgente {
  id?: string;
  productId?: string;
  nom?: string;
  sku?: string;
  stockActuel?: number;
  seuilAlerte?: number;
  seuilCritique?: number;
  unite?: string;
  image?: string;
  niveau?: string;
  [key: string]: unknown;
}

export interface StockVendorDashboard {
  kpis: StockVendorKpis;
  alertesUrgentes: StockAlerteUrgente[];
  boutiqueId?: string;
}

export interface StockVendorItem {
  id: string;
  productId: string;
  variantId: string | null;
  boutiqueId: string;
  nom: string;
  sku: string;
  categorie: string;
  stockActuel: number;
  seuilAlerte: number;
  seuilCritique: number;
  stockOptimal: number;
  unite: string;
  prixAchat: number;
  fournisseur: string;
  delaiReappro: number;
  autoReappro: boolean;
  dernierMouvement: string | null;
  tendance: string;
  image: string;
}

export interface StockVendorItemsResponse {
  items: StockVendorItem[];
  total: number;
  boutiqueId?: string;
}

export interface StockSettingsPayload {
  alertThreshold?: number;
  criticalThreshold?: number;
  optimalStock?: number;
  supplierName?: string;
  replenishmentDelayDays?: number;
  purchasePrice?: number;
  autoReplenishment?: boolean;
}

export interface StockVendorMovementApi {
  id: string;
  produitId: string;
  produitNom: string;
  type: string;
  quantite: number;
  motif: string;
  reference: string;
  date: string;
  utilisateur: string;
}

export interface StockVendorMovementsResponse {
  movements: StockVendorMovementApi[];
  pagination: { page: number; limit: number; total: number };
  boutiqueId?: string;
}

export interface ReplenishmentOrderApi {
  id: string;
  produitId: string;
  produitNom: string;
  quantite: number;
  fournisseur: string;
  statut: string;
  dateCommande: string;
  dateEstimee: string;
  type: string;
}

export interface ReplenishmentOrdersResponse {
  orders: ReplenishmentOrderApi[];
  boutiqueId?: string;
}

export interface StockVendorSettingsNotifications {
  emailStockBas: boolean;
  emailRupture: boolean;
  smsUrgences: boolean;
  notificationApp: boolean;
}

export interface StockVendorSettings {
  autoReapproGlobal: boolean;
  seuilDeclenchement: string;
  quantiteCommande: string;
  quantiteFixe: number | null;
  notifications: StockVendorSettingsNotifications;
}

export interface StockVendorSettingsResponse {
  settings: StockVendorSettings;
  boutiqueId?: string;
}

export interface UpdateStockVendorSettingsPayload {
  autoReplenishmentEnabled?: boolean;
  triggerThreshold?: string;
  orderQuantityMode?: string;
  fixedOrderQuantity?: number;
  emailLowStock?: boolean;
  emailOutOfStock?: boolean;
  smsUrgency?: boolean;
  appNotification?: boolean;
}

export const stockApi = {
  getVendorDashboard: async (params?: { search?: string; level?: string; boutiqueId?: string }): Promise<StockVendorDashboard> => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    qs.set("level", params?.level ?? "all");
    if (params?.boutiqueId) qs.set("boutiqueId", params.boutiqueId);
    const res = await request<{ success: boolean; data: StockVendorDashboard }>(
      `/api/marketplace/stock/vendor/dashboard?${qs.toString()}`
    );
    return res.data ?? {
      kpis: { totalProduits: 0, enRupture: 0, alerteBasse: 0, alerteCritique: 0, autoReapproActif: 0, commandesEnCours: 0, valeurStock: 0 },
      alertesUrgentes: [],
    };
  },

  getVendorItems: async (params?: { search?: string; level?: string; boutiqueId?: string }): Promise<StockVendorItemsResponse> => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    qs.set("level", params?.level ?? "all");
    if (params?.boutiqueId) qs.set("boutiqueId", params.boutiqueId);
    const res = await request<{ success: boolean; data: StockVendorItemsResponse }>(
      `/api/marketplace/stock/vendor/items?${qs.toString()}`
    );
    return res.data ?? { items: [], total: 0 };
  },

  toggleAutoReappro: async (productId: string, enabled: boolean, variantId?: string): Promise<unknown> => {
    const qs = variantId ? `?variantId=${encodeURIComponent(variantId)}` : "";
    return request<unknown>(
      `/api/marketplace/stock/vendor/items/${encodeURIComponent(productId)}/auto-reappro${qs}`,
      { method: "PATCH", body: JSON.stringify({ enabled }) }
    );
  },

  updateSettings: async (productId: string, payload: StockSettingsPayload, variantId?: string): Promise<unknown> => {
    const qs = variantId ? `?variantId=${encodeURIComponent(variantId)}` : "";
    return request<unknown>(
      `/api/marketplace/stock/vendor/items/${encodeURIComponent(productId)}/settings${qs}`,
      { method: "PATCH", body: JSON.stringify(payload) }
    );
  },

  recordMovement: async (payload: {
    productId: string;
    variantId?: string;
    type: "entree" | "sortie" | "ajustement" | "retour";
    quantity: number;
    reason?: string;
    reference?: string;
    boutiqueId?: string;
  }): Promise<unknown> => {
    return request<unknown>(
      "/api/marketplace/stock/vendor/movements",
      { method: "POST", body: JSON.stringify(payload) }
    );
  },

  createReplenishment: async (payload: {
    productId: string;
    variantId?: string;
    quantity: number;
    boutiqueId?: string;
  }): Promise<unknown> => {
    return request<unknown>(
      "/api/marketplace/stock/vendor/replenishments",
      { method: "POST", body: JSON.stringify(payload) }
    );
  },

  getVendorMovements: async (params?: {
    productId?: string;
    variantId?: string;
    page?: number;
    limit?: number;
    boutiqueId?: string;
  }): Promise<StockVendorMovementsResponse> => {
    const qs = new URLSearchParams();
    if (params?.productId) qs.set("productId", params.productId);
    if (params?.variantId) qs.set("variantId", params.variantId);
    qs.set("page", String(params?.page ?? 1));
    qs.set("limit", String(params?.limit ?? 50));
    if (params?.boutiqueId) qs.set("boutiqueId", params.boutiqueId);
    const res = await request<{ success: boolean; data: StockVendorMovementsResponse }>(
      `/api/marketplace/stock/vendor/movements?${qs.toString()}`
    );
    return res.data ?? { movements: [], pagination: { page: 1, limit: 50, total: 0 } };
  },

  getVendorReplenishments: async (params?: { boutiqueId?: string }): Promise<ReplenishmentOrdersResponse> => {
    const qs = new URLSearchParams();
    if (params?.boutiqueId) qs.set("boutiqueId", params.boutiqueId);
    const res = await request<{ success: boolean; data: ReplenishmentOrdersResponse }>(
      `/api/marketplace/stock/vendor/replenishments?${qs.toString()}`
    );
    return res.data ?? { orders: [] };
  },

  cancelReplenishment: async (id: string): Promise<unknown> => {
    return request<unknown>(`/api/marketplace/stock/vendor/replenishments/${encodeURIComponent(id)}/cancel`, { method: "POST" });
  },

  confirmReplenishment: async (id: string): Promise<unknown> => {
    return request<unknown>(`/api/marketplace/stock/vendor/replenishments/${encodeURIComponent(id)}/confirm`, { method: "POST" });
  },

  receiveReplenishment: async (id: string): Promise<unknown> => {
    return request<unknown>(`/api/marketplace/stock/vendor/replenishments/${encodeURIComponent(id)}/receive`, { method: "POST" });
  },

  shipReplenishment: async (id: string): Promise<unknown> => {
    return request<unknown>(`/api/marketplace/stock/vendor/replenishments/${encodeURIComponent(id)}/ship`, { method: "POST" });
  },

  getVendorSettings: async (params?: { boutiqueId?: string }): Promise<StockVendorSettingsResponse> => {
    const qs = new URLSearchParams();
    if (params?.boutiqueId) qs.set("boutiqueId", params.boutiqueId);
    const res = await request<{ success: boolean; data: StockVendorSettingsResponse }>(
      `/api/marketplace/stock/vendor/settings?${qs.toString()}`
    );
    return res.data ?? {
      settings: {
        autoReapproGlobal: true,
        seuilDeclenchement: "alerte",
        quantiteCommande: "optimal",
        quantiteFixe: null,
        notifications: { emailStockBas: true, emailRupture: true, smsUrgences: false, notificationApp: true },
      },
    };
  },

  updateVendorSettings: async (payload: UpdateStockVendorSettingsPayload, boutiqueId?: string): Promise<unknown> => {
    const qs = boutiqueId ? `?boutiqueId=${encodeURIComponent(boutiqueId)}` : "";
    return request<unknown>(
      `/api/marketplace/stock/vendor/settings${qs}`,
      { method: "PUT", body: JSON.stringify(payload) }
    );
  },
};

export const boutiquesApi = {
  getMyShop: async (): Promise<Boutique | null> => {
    const res = await request<{ success: boolean; data: { boutique: Boutique } }>(
      "/api/marketplace/vendeur/profil-boutique"
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
      `/api/marketplace/boutiques/${id}`,
      { method: "PATCH", body: JSON.stringify(body) }
    );
    return res.data;
  },
};

export interface Product {
  id: string;
  boutiqueId: string;
  createdByAdminId?: string | null;
  regulateId?: string | null;
  mediaId?: string | null;
  productVariantId?: string | null;
  name: string;
  type: string;
  description: string;
  shortDescription?: string;
  brand?: string | null;
  model?: string | null;
  origin?: string;
  manufacturingCountry?: string | null;
  condition?: string;
  attributes?: string[];
  // Taxonomie : `category`/`subCategory` (noms hérités des filières) coexistent
  // avec la nouvelle classification à 3 niveaux `famille`/`categorie`/`sousCategorie`.
  category: string;
  subCategory: string;
  articleType?: string | null;
  secteurId?: string | null;
  filiereId?: string | null;
  subCategoryId?: string | null;
  articleTypeId?: string | null;
  familleId?: string | null;
  categorieId?: string | null;
  sousCategorieId?: string | null;
  famille?: string | null;
  categorie?: string | null;
  sousCategorie?: string | null;
  designationId?: string | null;
  designation?: string | null;
  characteristics: string;
  sellerReference?: string | null;
  productCode?: string | null;
  articleNumber?: number | null;
  isRegulated: boolean | null;
  madeInCiRequested: boolean;
  madeInCiBadgeType?: string;
  salesUnitId?: string | null;
  /** @deprecated conservé pour compatibilité avec l'ancien flux de création. */
  unit?: string;
  status: string;
  price: number | string;
  currency?: string;
  vatRate?: number | string;
  priceHt?: number | string;
  stock: number;
  stockAlertThreshold?: number | null;
  availabilityStatus?: string;
  madeToOrder?: boolean | null;
  onDemandManufacturing?: boolean | null;
  moq: number;
  maxOrderQuantity?: number | null;
  retailEnabled?: boolean | null;
  wholesaleEnabled?: boolean | null;
  quoteRequestEnabled?: boolean | null;
  netWeight?: number | string | null;
  netWeightUnitId?: string | null;
  grossWeight?: number | string | null;
  grossWeightUnitId?: string | null;
  /** @deprecated conservé pour compatibilité avec l'ancien flux de création. */
  weight?: number;
  dimensions?: string;
  dimensionUnitId?: string | null;
  volume?: number | string | null;
  volumeUnitId?: string | null;
  packageCount?: number | null;
  quantityPerCarton?: number | null;
  quantityPerPallet?: number | null;
  capacity?: number | null;
  availabilityDelay?: string;
  deliveryZones?: { id: string; name: string; description?: string }[];
  deliveryMode?: string;
  deliveryEstimatedDelay?: string;
  shippingCost?: number | string | null;
  pickupAvailable?: boolean;
  technicalSpecifications?: { name: string; value: string; unit?: string; url?: string }[] | null;
  /** @deprecated remplacé par `certificationEntries`. */
  certifications?: { name: string; url?: string }[] | null;
  certificationEntries?: { type: string; reference?: string; documentUrl?: string }[] | null;
  technicalDocuments?: { name: string; url: string }[] | null;
  variantsEnabled?: boolean | null;
  quantityPricingEnabled?: boolean | null;
  quantityPricingTiers?: { minQuantity: number; maxQuantity?: number; unitPrice: number }[] | null;
  premiumOption?: string | null;
  premiumDurationWeeks?: number | null;
  promoPrice?: number | string | null;
  promoStartsAt?: string | null;
  promoEndsAt?: string | null;
  promoLabel?: string | null;
  promoIsActive?: boolean;
  isNouveaute?: boolean;
  nouveauteUntil?: string | null;
  escrowEnabled?: boolean;
  warrantyLabel?: string | null;
  warrantyDuration?: string | null;
  savAvailable?: boolean | null;
  returnAccepted?: boolean | null;
  returnDelayDays?: number | null;
  specialConditions?: string | null;
  boutique?: {
    id: string;
    name: string;
    logo?: string | null;
    [key: string]: unknown;
  } | null;
  // Relations enrichies renvoyées uniquement par GET /api/marketplace/products/{id}
  regulate?: unknown | null;
  salesUnit?: MarketplaceProductUnit | null;
  netWeightUnit?: MarketplaceProductUnit | null;
  grossWeightUnit?: MarketplaceProductUnit | null;
  dimensionUnit?: MarketplaceProductUnit | null;
  volumeUnit?: MarketplaceProductUnit | null;
  productVariant?: unknown | null;
  productMedia?: {
    id: string;
    url: string;
    isActive: boolean;
    isMain: boolean;
  }[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProductsPage {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Construit un FormData pour attacher les images à un produit.
 * En multipart, le backend ne reconvertit que les scalaires (string/number).
 * Les booléens et les objets/tableaux (specs, certifs, paliers…) sont donc
 * envoyés séparément via un appel JSON — ici on ne met que scalaires + fichiers.
 */
function buildProductFormData(body: Record<string, unknown>, files: File[]): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "boolean") continue;        // → via JSON
    if (typeof value === "object") continue;          // tableaux/objets → via JSON
    fd.append(key, String(value));
  }
  files.forEach((f) => fd.append("files", f));
  return fd;
}

export const productsApi = {
  getById: async (id: string): Promise<Product> => {
    const res = await request<{ success: boolean; data: Product }>(`/api/marketplace/products/${id}`);
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
      `/api/marketplace/products?${query.toString()}`
    );
    return res.data;
  },

  create: async (body: Record<string, unknown>, files?: File[]): Promise<Product> => {
    // Sans image : un seul POST JSON (toutes les infos passent nativement).
    if (!files?.length) {
      const res = await request<{ success: boolean; data: Product } | Product>(
        "/api/marketplace/products",
        { method: "POST", body: JSON.stringify(body) }
      );
      return (res as { data: Product }).data ?? (res as Product);
    }
    // Avec image : 1) POST multipart (scalaires + image) pour créer + attacher l'image…
    const fd = buildProductFormData(body, files);
    const createdRes = await requestMultipart<{ success: boolean; data: Product } | Product>(
      "/api/marketplace/products", fd
    );
    const created = (createdRes as { data: Product }).data ?? (createdRes as Product);
    // …2) puis PATCH JSON pour garantir toutes les infos (booléens, specs, certifs, paliers…).
    try {
      const res = await request<{ success: boolean; data: Product } | Product>(
        `/api/marketplace/products/${created.id}`,
        { method: "PATCH", body: JSON.stringify(body) }
      );
      return (res as { data: Product }).data ?? (res as Product);
    } catch {
      return created; // l'image est au moins enregistrée
    }
  },

  update: async (id: string, body: Record<string, unknown>, files?: File[]): Promise<Product> => {
    // Avec image : on attache d'abord l'image en multipart (scalaires + fichiers).
    if (files?.length) {
      const fd = buildProductFormData(body, files);
      try {
        await requestMultipart<{ success: boolean; data: Product } | Product>(
          `/api/marketplace/products/${id}`, fd, "PATCH"
        );
      } catch { /* on tente quand même la mise à jour JSON ci-dessous */ }
    }
    // Toujours un PATCH JSON pour enregistrer l'intégralité des infos.
    const res = await request<{ success: boolean; data: Product } | Product>(
      `/api/marketplace/products/${id}`,
      { method: "PATCH", body: JSON.stringify(body) }
    );
    return (res as { data: Product }).data ?? (res as Product);
  },

  delete: async (id: string): Promise<void> => {
    await request<void>(`/api/marketplace/products/${id}`, { method: "DELETE" });
  },

  createListing: async (payload: CreateProductListingPayload, medias?: File[]): Promise<Product> => {
    const fd = new FormData();
    // En multipart, les champs arrivent en string côté backend : les booléens
    // ("true"/"false") échouent la validation @IsBoolean(). On les omet donc
    // ici et on les envoie ensuite via un PATCH JSON (types natifs préservés) —
    // même limitation et même contournement que buildProductFormData ci-dessus.
    const append = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === "" || typeof value === "boolean") return;
      fd.append(key, String(value));
    };

    append("boutiqueId", payload.boutiqueId);
    append("name", payload.name);
    append("type", payload.type);
    append("description", payload.description);
    append("shortDescription", payload.shortDescription);
    append("sousCategorieId", payload.sousCategorieId);
    append("designation", payload.designation);
    append("designationCode", payload.designationCode);
    append("brand", payload.brand);
    append("model", payload.model);
    append("origin", payload.origin);
    append("manufacturingCountry", payload.manufacturingCountry);
    append("condition", payload.condition);
    (payload.attributes ?? []).forEach((a) => fd.append("attributes", a));
    append("sellerReference", payload.sellerReference);
    append("characteristics", payload.characteristics);
    append("salesUnitId", payload.salesUnitId);
    append("status", payload.status);
    append("price", payload.price);
    append("currency", payload.currency);
    append("vatRate", payload.vatRate);
    append("promoPrice", payload.promoPrice);
    append("promoStartsAt", payload.promoStartsAt);
    append("promoEndsAt", payload.promoEndsAt);
    append("promoLabel", payload.promoLabel);
    append("stock", payload.stock);
    append("stockAlertThreshold", payload.stockAlertThreshold);
    append("availabilityStatus", payload.availabilityStatus);
    append("availabilityDelay", payload.availabilityDelay);
    append("moq", payload.moq);
    append("maxOrderQuantity", payload.maxOrderQuantity);
    append("netWeight", payload.netWeight);
    append("netWeightUnitId", payload.netWeightUnitId);
    append("grossWeight", payload.grossWeight);
    append("grossWeightUnitId", payload.grossWeightUnitId);
    append("dimensionLength", payload.dimensionLength);
    append("dimensionWidth", payload.dimensionWidth);
    append("dimensionHeight", payload.dimensionHeight);
    append("dimensionUnitId", payload.dimensionUnitId);
    append("volume", payload.volume);
    append("volumeUnitId", payload.volumeUnitId);
    append("packageCount", payload.packageCount);
    append("quantityPerCarton", payload.quantityPerCarton);
    append("quantityPerPallet", payload.quantityPerPallet);
    append("deliveryZones", JSON.stringify(payload.deliveryZones ?? []));
    append("deliveryMode", payload.deliveryMode);
    append("deliveryEstimatedDelay", payload.deliveryEstimatedDelay);
    (payload.quantityPricingTiers ?? []).slice(0, 5).forEach((tier, i) => {
      append(`quantityPricingTierMinQuantity_${i}`, tier.minQuantity);
      append(`quantityPricingTierMaxQuantity_${i}`, tier.maxQuantity);
      append(`quantityPricingTierUnitPrice_${i}`, tier.unitPrice);
    });
    if (payload.variantsEnabled && payload.variants?.length) {
      append("variants", JSON.stringify(payload.variants));
    }
    if (payload.certificationEntries?.length) {
      append("certificationEntries", JSON.stringify(payload.certificationEntries));
    }
    append("madeInCiLabelCode", payload.madeInCiLabelCode);
    append("madeInCiLocalPercentage", payload.madeInCiLocalPercentage);
    append("madeInCiManufacturingPlace", payload.madeInCiManufacturingPlace);
    append("madeInCiRegionId", payload.madeInCiRegionId);
    append("madeInCiVilleId", payload.madeInCiVilleId);
    append("madeInCiOriginCertificateUrl", payload.madeInCiOriginCertificateUrl);
    append("warrantyLabel", payload.warrantyLabel);
    append("warrantyDuration", payload.warrantyDuration);
    append("returnDelayDays", payload.returnDelayDays);
    append("specialConditions", payload.specialConditions);
    (medias ?? []).forEach((f) => fd.append("medias", f));

    const res = await requestMultipart<{ success: boolean; data: Product } | Product>(
      "/api/marketplace/products", fd
    );
    const created = (res as { data: Product }).data ?? (res as Product);

    // Champs booléens : PATCH JSON séparé pour préserver le type natif.
    const booleans: Record<string, boolean> = {
      retailEnabled: !!payload.retailEnabled,
      wholesaleEnabled: !!payload.wholesaleEnabled,
      quoteRequestEnabled: !!payload.quoteRequestEnabled,
      madeToOrder: !!payload.madeToOrder,
      onDemandManufacturing: !!payload.onDemandManufacturing,
      quantityPricingEnabled: !!payload.quantityPricingEnabled,
      variantsEnabled: !!payload.variantsEnabled,
      isRegulated: !!payload.isRegulated,
      madeInCiRequested: !!payload.madeInCiRequested,
      madeInCiSubmitForValidation: !!payload.madeInCiSubmitForValidation,
      escrowEnabled: !!payload.escrowEnabled,
      savAvailable: !!payload.savAvailable,
      returnAccepted: !!payload.returnAccepted,
    };
    try {
      const patched = await request<{ success: boolean; data: Product } | Product>(
        `/api/marketplace/products/${created.id}`,
        { method: "PATCH", body: JSON.stringify(booleans) }
      );
      return (patched as { data: Product }).data ?? (patched as Product);
    } catch {
      return created; // le produit est au moins créé, booléens laissés par défaut
    }
  },

  updateListing: async (id: string, payload: UpdateProductPayload, medias?: File[]): Promise<Product> => {
    const fd = new FormData();
    const append = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === "" || typeof value === "boolean") return;
      fd.append(key, String(value));
    };

    append("name", payload.name);
    append("type", payload.type);
    append("description", payload.description);
    append("sousCategorieId", payload.sousCategorieId);
    append("characteristics", payload.characteristics);
    append("salesUnitId", payload.salesUnitId);
    append("status", payload.status);
    append("price", payload.price);
    append("stock", payload.stock);
    append("moq", payload.moq);
    append("maxOrderQuantity", payload.maxOrderQuantity);
    append("netWeight", payload.netWeight);
    append("netWeightUnitId", payload.netWeightUnitId);
    append("grossWeight", payload.grossWeight);
    append("grossWeightUnitId", payload.grossWeightUnitId);
    append("dimensionLength", payload.dimensionLength);
    append("dimensionWidth", payload.dimensionWidth);
    append("dimensionHeight", payload.dimensionHeight);
    append("dimensionUnitId", payload.dimensionUnitId);
    append("volume", payload.volume);
    append("volumeUnitId", payload.volumeUnitId);
    append("packageCount", payload.packageCount);
    append("quantityPerCarton", payload.quantityPerCarton);
    append("quantityPerPallet", payload.quantityPerPallet);
    (payload.quantityPricingTiers ?? []).slice(0, 5).forEach((tier, i) => {
      append(`quantityPricingTierMinQuantity_${i}`, tier.minQuantity);
      append(`quantityPricingTierMaxQuantity_${i}`, tier.maxQuantity);
      append(`quantityPricingTierUnitPrice_${i}`, tier.unitPrice);
    });
    (medias ?? []).forEach((f) => fd.append("medias", f));

    const res = await requestMultipart<{ success: boolean; data: Product } | Product>(
      `/api/marketplace/products/${encodeURIComponent(id)}`, fd, "PATCH"
    );
    const updated = (res as { data: Product }).data ?? (res as Product);

    if (payload.quantityPricingEnabled === undefined) return updated;
    try {
      const patched = await request<{ success: boolean; data: Product } | Product>(
        `/api/marketplace/products/${id}`,
        { method: "PATCH", body: JSON.stringify({ quantityPricingEnabled: !!payload.quantityPricingEnabled }) }
      );
      return (patched as { data: Product }).data ?? (patched as Product);
    } catch {
      return updated;
    }
  },
};

export interface UpdateProductPayload {
  name?: string;
  type?: string;
  description?: string;
  sousCategorieId?: string;
  characteristics?: string;
  salesUnitId?: string;
  status?: string;
  price?: number;
  stock?: number;
  moq?: number;
  maxOrderQuantity?: number;
  netWeight?: number;
  netWeightUnitId?: string;
  grossWeight?: number;
  grossWeightUnitId?: string;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  dimensionUnitId?: string;
  volume?: number;
  volumeUnitId?: string;
  packageCount?: number;
  quantityPerCarton?: number;
  quantityPerPallet?: number;
  quantityPricingEnabled?: boolean;
  quantityPricingTiers?: { minQuantity: number; maxQuantity?: number; unitPrice: number }[];
}

export interface CreateProductListingPayload {
  boutiqueId: string;
  name: string;
  type: string;
  description: string;
  shortDescription: string;
  sousCategorieId: string;
  designation: string;
  designationCode?: string;
  brand?: string;
  model?: string;
  origin: string;
  manufacturingCountry?: string;
  condition: string;
  attributes: string[];
  sellerReference?: string;
  characteristics?: string;
  salesUnitId: string;
  status?: string;
  price: number;
  currency?: string;
  vatRate: number;
  retailEnabled?: boolean;
  wholesaleEnabled?: boolean;
  quoteRequestEnabled?: boolean;
  promoPrice?: number;
  promoStartsAt?: string;
  promoEndsAt?: string;
  promoLabel?: string;
  stock?: number;
  stockAlertThreshold?: number;
  availabilityStatus?: string;
  madeToOrder?: boolean;
  onDemandManufacturing?: boolean;
  availabilityDelay?: string;
  moq?: number;
  maxOrderQuantity?: number;
  netWeight?: number;
  netWeightUnitId?: string;
  grossWeight?: number;
  grossWeightUnitId?: string;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  dimensionUnitId?: string;
  volume?: number;
  volumeUnitId?: string;
  packageCount?: number;
  quantityPerCarton?: number;
  quantityPerPallet?: number;
  deliveryZones: { id: string | number; name: string; description?: string }[];
  deliveryMode: string;
  deliveryEstimatedDelay?: string;
  quantityPricingEnabled?: boolean;
  quantityPricingTiers?: { minQuantity: number; maxQuantity?: number; unitPrice: number }[];
  variantsEnabled?: boolean;
  variants?: { name: string; price: number; stock: number; sku?: string; description?: string }[];
  certificationEntries?: { type: string; reference?: string; documentUrl?: string }[];
  isRegulated?: boolean;
  madeInCiRequested?: boolean;
  madeInCiLabelCode?: string;
  madeInCiLocalPercentage?: number;
  madeInCiManufacturingPlace?: string;
  madeInCiRegionId?: string;
  madeInCiVilleId?: string;
  madeInCiOriginCertificateUrl?: string;
  madeInCiSubmitForValidation?: boolean;
  escrowEnabled?: boolean;
  warrantyLabel?: string;
  warrantyDuration?: string;
  savAvailable?: boolean;
  returnAccepted?: boolean;
  returnDelayDays?: number;
  specialConditions?: string;
}

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

export interface FormateurDocument {
  url: string;
  name: string;
  type: string;
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
  documents: FormateurDocument[] | null;
  creator_user_id?: string;
  creator_role?: string;
  creator_details?: { id: string; role: string; name: string; email: string } | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
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
    documents?: Array<{ file: File; category: "cv" | "diplome" | "certificat" }>;
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
    payload.documents?.forEach((d) => fd.append("documents", d.file));
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

  update: async (
    id: string,
    payload: {
      firstname?: string;
      lastname?: string;
      email?: string;
      phone?: string;
      titre?: string;
      bio?: string;
      linkedin?: string;
      website?: string;
      statut?: string;
      motifAnnulation?: string;
      photo?: File | null;
      documents?: Array<{ file: File; category: "cv" | "diplome" | "certificat" }>;
    },
  ): Promise<FormationFormateur> => {
    const fd = new FormData();
    if (payload.firstname)        fd.append("firstname",        payload.firstname);
    if (payload.lastname)         fd.append("lastname",         payload.lastname);
    if (payload.email !== undefined) fd.append("email",         payload.email ?? "");
    if (payload.phone !== undefined) fd.append("phone",         payload.phone ?? "");
    if (payload.titre !== undefined) fd.append("titre",         payload.titre ?? "");
    if (payload.bio !== undefined)   fd.append("bio",           payload.bio ?? "");
    if (payload.linkedin !== undefined) fd.append("linkedin",   payload.linkedin ?? "");
    if (payload.website !== undefined)  fd.append("website",    payload.website ?? "");
    if (payload.statut)          fd.append("statut",          payload.statut);
    if (payload.motifAnnulation) fd.append("motifAnnulation", payload.motifAnnulation);
    if (payload.photo)           fd.append("photo",           payload.photo);
    payload.documents?.forEach((d) => fd.append("documents", d.file));
    const res = await requestMultipart<{ success: boolean; data: FormationFormateur }>(
      `/api/formation/formateurs/${id}`, fd, "PATCH"
    );
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    const token = getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    await fetch(`${API_BASE}/api/formation/formateurs/${id}`, { method: "DELETE", headers });
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
  checkEmail: async (email: string): Promise<{
    message: string;
    found: boolean;
    is_staff: boolean;
    nextStep: string;
    profile?: Record<string, unknown>;
  }> => {
    return request<{
      message: string;
      found: boolean;
      is_staff: boolean;
      nextStep: string;
      profile?: Record<string, unknown>;
    }>("/api/auth/adhesion/check-email", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
  },

  loginWithPassword: async (email: string, password: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    adhesion?: Record<string, unknown>;
  }> => {
    const res = await request<{ success: boolean; data: Record<string, unknown> } | Record<string, unknown>>(
      "/api/auth/adhesion/login",
      { method: "POST", body: JSON.stringify({ email, password }), skipAuth: true }
    );
    const payload = (res as { data: Record<string, unknown> })?.data ?? (res as Record<string, unknown>);
    const token = payload?.access_token as string | undefined;
    if (!token) throw new Error("Token introuvable dans la réponse de l'API");
    return {
      access_token: token,
      refresh_token: payload?.refresh_token as string | undefined,
      expires_in: payload?.expires_in as number | undefined,
      adhesion: payload?.adhesion as Record<string, unknown> | undefined,
    };
  },

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

  setPassword: async (params: {
    adhesionId?: string;
    email: string;
    password: string;
  }): Promise<void> => {
    await request<unknown>("/api/auth/adhesion/set-password", {
      method: "POST",
      body: JSON.stringify(params),
      skipAuth: true,
    });
  },

  logout: () =>
    request<void>("/api/auth/adhesion/logout", { method: "POST" }),

  getProfile: async (): Promise<Record<string, unknown>> => {
    const res = await request<{ success: boolean; data: Record<string, unknown> }>(
      "/api/auth/adhesion/profile"
    );
    return res?.data ?? (res as unknown as Record<string, unknown>);
  },

  updateProfile: async (payload: {
    email: string;
    name?: string;
    phone?: string;
    website_url?: string;
  }): Promise<Record<string, unknown>> => {
    const res = await request<{ success: boolean; data: Record<string, unknown> } | Record<string, unknown>>(
      "/api/adhesions/me/profile",
      { method: "PATCH", body: JSON.stringify(payload) }
    );
    return (res as { data: Record<string, unknown> }).data ?? (res as Record<string, unknown>);
  },

  updateLogo: async (email: string, logo: File): Promise<Record<string, unknown>> => {
    const fd = new FormData();
    fd.append("email", email);
    fd.append("logo", logo);
    const res = await requestMultipart<{ success: boolean; data: Record<string, unknown> } | Record<string, unknown>>(
      "/api/adhesions/me/logo", fd, "PATCH"
    );
    return (res as { data: Record<string, unknown> }).data ?? (res as Record<string, unknown>);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await request<unknown>("/api/auth/adhesion/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await request<unknown>("/api/auth/adhesion/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await request<unknown>("/api/auth/adhesion/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      skipAuth: true,
    });
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

export interface AdhesionMembre {
  id: string;
  name: string;
  position: string | null;
  numero_membre: string | null;
  email: string;
  phone: string;
  hasAffiliation: boolean;
  organisationName: string | null;
  customOrganisationName: string | null;
  organisationType: string | null;
  statut: string;
  logo: string | null;
  nombre_employee: string | null;
  website_url: string | null;
  secteurPrincipal: { id: string; name: string } | null;
  filiere: { id: string; name: string } | null;
  siegeRegion: { id: string; name: string } | null;
  typeMembre: { id: string; name: string } | null;
  profil: { id: string; name: string } | null;
  abonnement: { id: string; plan: string; libelle: string } | null;
  created_at: string;
  activites: { id: string; name: string; sousFiliere?: { name: string } | null }[];
}

export interface AdhesionsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdhesionDetail extends AdhesionMembre {
  message: string | null;
  filiere: { id: string; name: string } | null;
  sousFilieres: { id: string; name: string }[];
  activites: { id: string; name: string; sousFiliere?: { name: string } | null }[];
  siegeCommune: { id: string; name: string } | null;
  siegeQuartier: { id: string; name: string; type: string } | null;
  siegeVille: string | null;
  siegeVillage: string | null;
  hasBureauCI: boolean;
  hasFinancingProject: boolean | null;
  isCompetitionSubcontractor: boolean | null;
  interventionScope: string | null;
  internationalAddress: string | null;
  internationalCity: string | null;
  internationalCountry: string | null;
  date_debut_abonnement: string | null;
  date_fin_abonnement: string | null;
  modaliteAbonnement: string | null;
}

export const adhesionsApi = {
  getForSiteWeb: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: AdhesionMembre[]; meta: AdhesionsMeta }> => {
    const qs = new URLSearchParams();
    qs.set("page", String(params?.page ?? 1));
    qs.set("limit", String(params?.limit ?? 100));
    if (params?.search) qs.set("search", params.search);
    const res = await request<{ success: boolean; data: { data: AdhesionMembre[]; meta: AdhesionsMeta } }>(
      `/api/adhesions/for-site-web?${qs.toString()}`
    );
    return res.data;
  },

  getById: async (id: string): Promise<AdhesionDetail> => {
    const res = await request<{ success: boolean; data: AdhesionDetail }>(
      `/api/adhesions/${encodeURIComponent(id)}`
    );
    return res.data;
  },

  changeStatut: async (
    id: string,
    statut: "pending" | "in_review" | "approved" | "rejected" | "completed" | "suspended" | "inactive",
    notes?: string,
    clientBaseUrl = "https://membre.cpupme.ci/"
  ): Promise<AdhesionDetail> => {
    const qs = new URLSearchParams({ statut, clientBaseUrl });
    if (notes) qs.set("notes", notes);
    const res = await request<{ success: boolean; data: AdhesionDetail }>(
      `/api/adhesions/${encodeURIComponent(id)}/statut?${qs.toString()}`,
      { method: "PATCH" }
    );
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await request<void>(`/api/adhesions/${encodeURIComponent(id)}`, { method: "DELETE" });
  },

  update: async (id: string, payload: {
    name?: string;
    position?: string;
    email?: string;
    phone?: string;
    message?: string;
    nombre_employee?: string;
    website_url?: string;
    customOrganisationName?: string;
    organisationName?: string;
    organisationType?: string;
    siegeRegionId?: string;
    siegeCommuneId?: string;
    siegeVille?: string;
    siegeVillage?: string;
    interventionScope?: string;
    internationalAddress?: string;
    internationalCity?: string;
    internationalCountry?: string;
    hasBureauCI?: boolean;
    hasAffiliation?: boolean;
    isCompetitionSubcontractor?: boolean;
    hasFinancingProject?: boolean;
    logo?: File | null;
  }): Promise<AdhesionDetail> => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const fd = new FormData();
    const append = (key: string, val: string | undefined | null) => {
      if (val !== undefined && val !== null) fd.append(key, val);
    };
    append("name",                   payload.name);
    append("position",               payload.position);
    append("email",                  payload.email);
    append("phone",                  payload.phone);
    append("message",                payload.message);
    append("nombre_employee",        payload.nombre_employee);
    append("website_url",            payload.website_url);
    append("customOrganisationName", payload.customOrganisationName);
    append("organisationName",       payload.organisationName);
    append("organisationType",       payload.organisationType);
    append("siegeRegionId",          payload.siegeRegionId);
    append("siegeCommuneId",         payload.siegeCommuneId);
    append("siegeVille",             payload.siegeVille);
    append("siegeVillage",           payload.siegeVillage);
    append("interventionScope",      payload.interventionScope);
    if (payload.hasBureauCI             !== undefined) fd.append("hasBureauCI",             String(payload.hasBureauCI));
    if (payload.hasAffiliation          !== undefined) fd.append("hasAffiliation",          String(payload.hasAffiliation));
    if (payload.isCompetitionSubcontractor !== undefined) fd.append("isCompetitionSubcontractor", String(payload.isCompetitionSubcontractor));
    if (payload.hasFinancingProject     !== undefined) fd.append("hasFinancingProject",     String(payload.hasFinancingProject));
    if (payload.logo) fd.append("logo", payload.logo);

    const res = await fetch(`${API_BASE}/api/adhesions/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers,
      body: fd,
    });

    if (!res.ok) {
      let message = `Erreur ${res.status}`;
      try {
        const body = await res.json();
        if (typeof body?.message === "string") message = body.message;
        else if (typeof body?.error === "string") message = body.error;
      } catch { /* ignore */ }
      const error = new Error(message) as Error & { status: number };
      error.status = res.status;
      throw error;
    }

    const json = await res.json();
    return (json as { data: AdhesionDetail }).data ?? (json as AdhesionDetail);
  },
};

// ── KYC ───────────────────────────────────────────────────────────────────────

export interface KycDocumentType {
  id: string;
  code: string;
  name: string;
  acceptedFormats: string[];
  maxSize: number;
  isActive: boolean;
}

export interface KycRequiredDocument {
  documentTypeId: string;
  documentType: KycDocumentType;
  isRequired: boolean;
  abonnementId: string | null;
  status: "missing" | "pending" | "approved" | "rejected" | "uploaded" | "validated" | "expired" | string;
  uploaded: Record<string, unknown> | null;
}

export interface KycLevelInfo {
  id: string;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface KycLevelData {
  level: KycLevelInfo;
  totalDocuments: number;
  validatedDocuments: number;
  validationPercentage: number;
  requiredDocuments: KycRequiredDocument[];
}

export interface KycRequiredDocumentsResponse {
  abonnementId: string;
  abonnement: { id: string; libelle: string; plan: string };
  caseStatus: string;
  targetKycLevelId: string | null;
  targetKycLevel: KycLevelInfo | null;
  currentKycLevelId: string | null;
  currentKycLevel: KycLevelInfo | null;
  levels: KycLevelData[];
}

export interface KycLevelEntry {
  id: string;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  isCurrent: boolean;
  isTarget: boolean;
  canSelect: boolean;
}

export interface KycLevelsResponse {
  abonnementId: string;
  abonnement: { id: string; libelle: string; plan: string };
  currentKycLevelId: string | null;
  targetKycLevelId: string | null;
  levels: KycLevelEntry[];
}

export interface KycLevelDocumentsResponse {
  abonnementId: string;
  abonnement: { id: string; libelle: string; plan: string };
  caseStatus: string;
  targetKycLevelId: string | null;
  targetKycLevel: KycLevelInfo | null;
  currentKycLevelId: string | null;
  currentKycLevel: KycLevelInfo | null;
  level: KycLevelInfo;
  totalDocuments: number;
  validatedDocuments: number;
  validationPercentage: number;
  requiredDocuments: KycRequiredDocument[];
}

export interface KycUploadedDocument {
  id: string;
  fileUrl: string;
  status: string;
  kycCaseId: string;
  documentTypeId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedById: string | null;
}

export interface KycCase {
  id: string;
  adhesionId: string;
  subjectType: "individual" | "organization";
  targetKycLevelId: string | null;
  currentKycLevelId: string | null;
  status: "not_started" | "draft" | "submitted" | "in_review" | "approved" | "rejected" | "expired" | string;
  submittedAt: string | null;
  approvedAt: string | null;
  expiresAt: string | null;
  rejectionReason: string | null;
  targetKycLevel: KycLevelInfo | null;
  currentKycLevel: KycLevelInfo | null;
  documents: KycUploadedDocument[];
  createdAt?: string;
  updatedAt?: string;
}

export interface KycMyRequiredDocumentsResponse {
  abonnementId: string;
  abonnement: { id: string; libelle: string; plan: string };
  caseStatus: string;
  targetKycLevelId: string | null;
  targetKycLevel: KycLevelInfo | null;
  currentKycLevelId: string | null;
  currentKycLevel: KycLevelInfo | null;
  totalDocuments: number;
  validatedDocuments: number;
  validationPercentage: number;
  requiredDocuments: KycRequiredDocument[];
}

export const kycApi = {
  uploadDocument: async (documentTypeId: string, file: File): Promise<KycUploadedDocument> => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const fd = new FormData();
    fd.append("documentTypeId", documentTypeId);
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/api/adhesions/me/kyc/documents`, {
      method: "POST",
      headers,
      body: fd,
    });
    if (!res.ok) {
      let message = `Erreur ${res.status}`;
      try {
        const b = await res.json();
        message = b?.message || b?.error || b?.detail || message;
      } catch { /* ignore */ }
      const error = new Error(message) as Error & { status: number };
      error.status = res.status;
      throw error;
    }
    const json = await res.json();
    return (json as { data: KycUploadedDocument }).data ?? (json as KycUploadedDocument);
  },

  getRequiredDocuments: async (): Promise<KycRequiredDocumentsResponse> => {
    const res = await request<{ success: boolean; data: KycRequiredDocumentsResponse }>(
      "/api/adhesions/me/kyc/levels/required-documents"
    );
    return res.data;
  },

  getLevels: async (): Promise<KycLevelsResponse> => {
    const res = await request<{ success: boolean; data: KycLevelsResponse }>(
      "/api/adhesions/me/kyc/levels"
    );
    return res.data;
  },

  getLevelDocuments: async (levelId: string): Promise<KycLevelDocumentsResponse> => {
    const res = await request<{ success: boolean; data: KycLevelDocumentsResponse }>(
      `/api/adhesions/me/kyc/levels/${encodeURIComponent(levelId)}/required-documents`
    );
    return res.data;
  },

  getKycCase: async (): Promise<KycCase> => {
    const res = await request<{ success: boolean; data: KycCase }>("/api/adhesions/me/kyc");
    return res.data;
  },

  getMyRequiredDocuments: async (): Promise<KycMyRequiredDocumentsResponse> => {
    const res = await request<{ success: boolean; data: KycMyRequiredDocumentsResponse }>(
      "/api/adhesions/me/kyc/required-documents"
    );
    return res.data;
  },

  startKyc: async (targetKycLevelId: string, subjectType?: "individual" | "organization"): Promise<KycCase> => {
    const res = await request<{ success: boolean; data: KycCase }>("/api/adhesions/me/kyc/start", {
      method: "POST",
      body: JSON.stringify({ targetKycLevelId, ...(subjectType ? { subjectType } : {}) }),
    });
    return res.data;
  },

  submitKyc: async (): Promise<KycCase> => {
    const res = await request<{ success: boolean; data: KycCase }>("/api/adhesions/me/kyc/submit", {
      method: "POST",
      body: JSON.stringify({}),
    });
    return res.data;
  },
};

// ── Affiliation ───────────────────────────────────────────────────────────────

export type AffiliationEventType =
  | "AFF_DECLARED_DRAFT_SAVED"
  | "AFF_REQUEST_SENT"
  | "AFF_REQUEST_CANCELLED_BY_MEMBER"
  | "AFF_APPROVED_BY_ORG"
  | "AFF_REJECTED_BY_ORG_REASON"
  | "AFF_CHANGE_REQUESTED"
  | "AFF_REVOKED_BY_ORG_REASON"
  | "AFF_SUSPENDED_BY_CPU_PME_REASON"
  | "AFF_OVERRIDE_BY_CPU_PME_REASON";

export interface AffiliationHistoryEvent {
  id: string;
  type: AffiliationEventType;
  organization: string;
  actor: string;
  actorRole: string;
  timestamp: string;
  reason?: string;
  previousValue?: string;
  newValue?: string;
  attachments?: string[];
}

export interface AffiliationHistoryStats {
  organizationsCount: number;
  approvalsCount: number;
  rejectionsCount: number;
}

export interface AffiliationHistoryResponse {
  data: AffiliationHistoryEvent[];
  stats: AffiliationHistoryStats;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type AffiliationStatus =
  | "None"
  | "Declared"
  | "PendingConfirmation"
  | "Approved"
  | "Rejected"
  | "CancelledByMember"
  | "RevokedByOrg"
  | "Suspended"
  | "Overridden";

export interface AffiliationOrganization {
  id: string;
  name: string;
  type: "cooperative" | "federation" | "association";
  sector: string;
  region: string;
  memberCount: number;
  logo: string | null;
}

export interface AffiliationRecord {
  id: string;
  organization: AffiliationOrganization;
  status: AffiliationStatus;
  role: string;
  sectors: string[];
  effectiveDate: string;
  requestDate?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

export interface AffiliationSettings {
  adhesionId: string;
  profileVisible: boolean;
  showInDirectory: boolean;
  shareStatistics: boolean;
  shareContactInfo: boolean;
  shareLocation: boolean;
  receiveOpportunities: boolean;
  receiveEventInvites: boolean;
  receiveNewsletters: boolean;
  updatedAt: string;
}

export interface AffiliationRequestPayload {
  requestType: "declare" | "change";
  organizationId?: string;
  customOrganizationName?: string;
  role?: string;
  sectors?: string[];
  region?: string;
  changeReason?: string;
  effectiveDate?: string;
  endCurrentAffiliation?: boolean;
  saveAsDraft?: boolean;
  dataSharingConsent?: boolean;
  termsAccepted?: boolean;
}

export interface AffiliationRequestRecord {
  id: string;
  requestType: "declare" | "change";
  status: "draft" | "pending" | "approved" | "rejected" | string;
  organizationId: string | null;
  organization: AffiliationOrganization | null;
  role: string | null;
  sectors: string[];
  region: string | null;
  changeReason: string | null;
  effectiveDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliationMeResponse {
  currentAffiliation: AffiliationRecord | null;
  pendingRequest: AffiliationRecord | null;
  suggestedOrganizations: AffiliationOrganization[];
  isAccountActive: boolean;
}

export const affiliationApi = {
  getOrganizations: async (params?: {
    search?: string;
    type?: string;
    sector?: string;
    region?: string;
    limit?: number;
    suggest?: boolean;
  }): Promise<AffiliationOrganization[]> => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.type) qs.set("type", params.type);
    if (params?.sector) qs.set("sector", params.sector);
    if (params?.region) qs.set("region", params.region);
    qs.set("limit", String(params?.limit ?? 20));
    if (params?.suggest) qs.set("suggest", "true");
    const res = await request<{ success: boolean; data: AffiliationOrganization[] }>(
      `/api/affiliations/organizations?${qs.toString()}`
    );
    return res.data ?? [];
  },

  createRequest: async (payload: AffiliationRequestPayload): Promise<AffiliationRequestRecord> => {
    const res = await request<{ success: boolean; data: AffiliationRequestRecord }>(
      "/api/affiliations/requests",
      { method: "POST", body: JSON.stringify(payload) }
    );
    return res.data;
  },

  cancelRequest: async (id: string): Promise<void> => {
    await request<void>(`/api/affiliations/requests/${encodeURIComponent(id)}/cancel`, {
      method: "PATCH",
    });
  },

  uploadRequestDocument: async (requestId: string, file: File): Promise<unknown> => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/api/affiliations/requests/${encodeURIComponent(requestId)}/documents`, {
      method: "POST",
      headers,
      body: fd,
    });
    if (!res.ok) {
      let msg = `Erreur ${res.status}`;
      try { const b = await res.json(); msg = b?.message || b?.error || msg; } catch { /* ignore */ }
      throw new Error(msg);
    }
    return res.json();
  },

  getMe: async (): Promise<AffiliationMeResponse> => {
    const res = await request<{ success: boolean; data: AffiliationMeResponse }>(
      "/api/affiliations/me"
    );
    return res.data;
  },

  getSettings: async (): Promise<AffiliationSettings> => {
    const res = await request<{ success: boolean; data: AffiliationSettings }>(
      "/api/affiliations/settings"
    );
    return res.data;
  },

  updateSettings: async (payload: Omit<AffiliationSettings, "adhesionId" | "updatedAt">): Promise<AffiliationSettings> => {
    const res = await request<{ success: boolean; data: AffiliationSettings }>(
      "/api/affiliations/settings",
      { method: "PATCH", body: JSON.stringify(payload) }
    );
    return res.data;
  },

  getHistory: async (params?: { page?: number; limit?: number }): Promise<AffiliationHistoryResponse> => {
    const qs = new URLSearchParams();
    qs.set("page", String(params?.page ?? 1));
    qs.set("limit", String(params?.limit ?? 30));
    const res = await request<{ success: boolean; data: AffiliationHistoryResponse }>(
      `/api/affiliations/history?${qs.toString()}`
    );
    return res.data;
  },
};

// ── Mailing Preferences ───────────────────────────────────────────────────────

export interface MailingPreferences {
  id: string;
  adhesionId: string;
  timezone: string;
  newsletterOptIn: boolean;
  subscribedTopics: string[] | null;
  contentAlertOptIn: boolean;
  alertHour: number;
  alertMinute: number;
  lastAlertLocalDate: string | null;
  lastAlertSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMailingPreferences {
  timezone?: string;
  newsletterOptIn?: boolean;
  subscribedTopics?: string[];
  contentAlertOptIn?: boolean;
  alertHour?: number;
  alertMinute?: number;
}

export const mailingApi = {
  getPreferences: async (): Promise<MailingPreferences> => {
    const res = await request<{ success: boolean; data: MailingPreferences }>(
      "/api/mailing/preferences/me"
    );
    return res.data;
  },

  updatePreferences: async (payload: UpdateMailingPreferences): Promise<MailingPreferences> => {
    const res = await request<{ success: boolean; data: MailingPreferences }>(
      "/api/mailing/preferences/me",
      { method: "PATCH", body: JSON.stringify(payload) }
    );
    return res.data;
  },
};

// ── RFQ (Acheteur) ────────────────────────────────────────────────────────────

export type RFQApiType = "B2B Volume" | "Service" | "Sur mesure" | "Prix variable" | "Standard";
export type RFQApiCategory = string;

export interface RFQAttachment {
  id: string;
  rfqId: string;
  fileUrl: string;
  originalName: string;
  mimeType: string;
  fileSize: string | number;
  createdAt: string;
}

export interface RFQFromAPI {
  id: string;
  rfqId: string;
  besoin: string;
  quantite: number;
  unite: string;
  zone: string;
  deadline: string;
  dateCreation: string;
  status: string;
  statut?: string;
  budget: number | null;
  offresRecues?: number;
  offersCount: number;
  type: string;
  recurrence?: string | null;
  proformaRequired?: boolean;
  depositPercent?: number | null;
  categorie?: string;
  details?: string | null;
  attachments: RFQAttachment[];
  canViewOffers?: boolean;
}

export type RFQTypeCode = "b2b_volume" | "service" | "custom_product" | "variable_price" | "standard";

export interface RFQCreatePayload {
  type: RFQTypeCode;
  productNeed: string;
  category?: string;
  quantity: number;
  unit: string;
  deliveryZone: string;
  deadline: string;
  estimatedBudget?: number;
  specifications?: string;
  recurrence?: string;
  options?: string[];
  proformaRequired?: boolean;
  depositPercent?: number;
  publishNow?: boolean;
  files?: File[];
}

export interface RFQOffer {
  id: string;
  rfqId: string;
  vendorId: string;
  price: number;
  deliveryDays: number;
  conditions: string;
  validityDate: string;
  status: string;
  negotiationOpenedAt: string | null;
  proformaNumber: string | null;
  proformaTotal: number;
  proformaDepositRate: number;
  proformaDepositAmount: number;
  proformaValidUntil: string | null;
  createdAt: string;
  updatedAt: string;
  rfq: string;
}

export interface RFQNegotiationMessage {
  id: string;
  quoteId: string;
  senderRole: "vendor" | "buyer";
  type: string;
  content: string;
  attachmentsUrls: string[];
  proformaNumber: string | null;
  proformaTotal: number;
  proformaDepositRate: number;
  proformaDepositAmount: number;
  proformaValidUntil: string | null;
  createdAt: string;
  quote: RFQOffer;
}

export interface RFQVendorStats {
  aRepondre: number;
  enNegociation: number;
  gagnees: number;
}

export interface RFQVendorReceived {
  id: string;
  rfqNumber: string;
  buyerId?: string;
  type?: string;
  productNeed: string;
  category?: string;
  quantity: number | string;
  unit: string;
  deliveryZone: string;
  deadline: string;
  estimatedBudget: number | null;
  specifications: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
  buyer?: { id?: string; name?: string; email?: string } | null;
  myQuote?: RFQOffer | null;
  attachments?: { fileUrl: string; originalName: string; mimeType: string; fileSize: number }[];
}

export const rfqApi = {
  getAll: async (): Promise<RFQFromAPI[]> => {
    const res = await request<{ success: boolean; data: RFQFromAPI[] }>("/api/marketplace/rfq");
    return res.data ?? [];
  },

  create: async (payload: RFQCreatePayload): Promise<unknown> => {
    const fd = new FormData();
    fd.append("type", payload.type);
    fd.append("productNeed", payload.productNeed);
    if (payload.category) fd.append("category", payload.category);
    fd.append("quantity", String(payload.quantity));
    fd.append("unit", payload.unit);
    fd.append("deliveryZone", payload.deliveryZone);
    fd.append("deadline", payload.deadline);
    if (payload.estimatedBudget !== undefined) fd.append("estimatedBudget", String(payload.estimatedBudget));
    if (payload.specifications) fd.append("specifications", payload.specifications);
    if (payload.recurrence) fd.append("recurrence", payload.recurrence);
    if (payload.options?.length) fd.append("options", JSON.stringify(payload.options));
    if (payload.proformaRequired !== undefined) fd.append("proformaRequired", String(payload.proformaRequired));
    if (payload.depositPercent !== undefined) fd.append("depositPercent", String(payload.depositPercent));
    if (payload.publishNow !== undefined) fd.append("publishNow", String(payload.publishNow));
    (payload.files ?? []).forEach((f) => fd.append("files", f));
    return requestMultipart<unknown>("/api/marketplace/rfq", fd);
  },

  publish: async (id: string): Promise<RFQFromAPI> => {
    const res = await request<{ success: boolean; data: RFQFromAPI } | RFQFromAPI>(
      `/api/marketplace/rfq/${encodeURIComponent(id)}/publish`,
      { method: "POST" }
    );
    return (res as { data: RFQFromAPI }).data ?? (res as RFQFromAPI);
  },

  cancel: async (id: string): Promise<void> => {
    await request<unknown>(`/api/marketplace/rfq/${encodeURIComponent(id)}/cancel`, { method: "POST" });
  },

  confirmDeposit: async (id: string): Promise<void> => {
    await request<unknown>(`/api/marketplace/rfq/${encodeURIComponent(id)}/confirm-deposit`, { method: "POST" });
  },

  getOffers: async (rfqId: string): Promise<RFQOffer[]> => {
    const res = await request<RFQOffer[] | { success: boolean; data: RFQOffer[] }>(
      `/api/marketplace/rfq/${encodeURIComponent(rfqId)}/offers`
    );
    return Array.isArray(res) ? res : ((res as { data: RFQOffer[] }).data ?? []);
  },

  getById: async (id: string): Promise<RFQFromAPI> => {
    const res = await request<{ success: boolean; data: RFQFromAPI }>(`/api/marketplace/rfq/${encodeURIComponent(id)}`);
    return res.data;
  },

  update: async (id: string, payload: {
    type?: string;
    productNeed?: string;
    category?: string;
    quantity?: number;
    unit?: string;
    deliveryZone?: string;
    deadline?: string;
    estimatedBudget?: number | null;
    specifications?: string | null;
    recurrence?: string;
    options?: string[];
    proformaRequired?: boolean;
    depositPercent?: number;
    publishNow?: boolean;
    attachments?: { fileUrl: string; originalName: string; mimeType: string; fileSize: number }[];
  }): Promise<RFQFromAPI> => {
    const res = await request<{ success: boolean; data: RFQFromAPI }>(
      `/api/marketplace/rfq/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(payload) }
    );
    return res.data;
  },

  // ── Négociations acheteur ──────────────────────────────────────────

  getNegotiations: async (): Promise<RFQOffer[]> => {
    const res = await request<{ success: boolean; data: RFQOffer[] }>("/api/marketplace/rfq/buyer/negotiations");
    return res.data ?? [];
  },

  getNegotiationMessages: async (quoteId: string): Promise<RFQNegotiationMessage[]> => {
    const res = await request<RFQNegotiationMessage[] | { success: boolean; data: RFQNegotiationMessage[] }>(
      `/api/marketplace/rfq/buyer/negotiations/${encodeURIComponent(quoteId)}/messages`
    );
    return Array.isArray(res) ? res : ((res as { data: RFQNegotiationMessage[] }).data ?? []);
  },

  sendNegotiationMessage: async (quoteId: string, message: string, files?: File[]): Promise<RFQNegotiationMessage[]> => {
    const fd = new FormData();
    fd.append("message", message);
    files?.forEach((f) => fd.append("files", f));
    const res = await requestMultipart<RFQNegotiationMessage[] | { success: boolean; data: RFQNegotiationMessage[] }>(
      `/api/marketplace/rfq/buyer/negotiations/${encodeURIComponent(quoteId)}/messages`, fd
    );
    return Array.isArray(res) ? res : ((res as { data: RFQNegotiationMessage[] }).data ?? []);
  },

  acceptProforma: async (quoteId: string): Promise<void> => {
    await request<unknown>(
      `/api/marketplace/rfq/buyer/negotiations/${encodeURIComponent(quoteId)}/proforma/accept`,
      { method: "POST" }
    );
  },

  rejectProforma: async (quoteId: string): Promise<void> => {
    await request<unknown>(
      `/api/marketplace/rfq/buyer/negotiations/${encodeURIComponent(quoteId)}/proforma/reject`,
      { method: "POST" }
    );
  },

  // ── Actions sur les offres ─────────────────────────────────────────

  acceptOffer: async (quoteId: string): Promise<void> => {
    await request<unknown>(
      `/api/marketplace/rfq/offers/${encodeURIComponent(quoteId)}/accept`,
      { method: "POST" }
    );
  },

  rejectOffer: async (quoteId: string, reason: string): Promise<void> => {
    await request<unknown>(
      `/api/marketplace/rfq/offers/${encodeURIComponent(quoteId)}/reject`,
      { method: "POST", body: JSON.stringify({ reason }) }
    );
  },

  negotiateOffer: async (quoteId: string, counterPrice: number, message: string): Promise<void> => {
    await request<unknown>(
      `/api/marketplace/rfq/offers/${encodeURIComponent(quoteId)}/negotiate`,
      { method: "POST", body: JSON.stringify({ counterPrice, message }) }
    );
  },

  convertToOrder: async (quoteId: string, body: {
    boutiqueId: string;
    productVariantId: string;
    deliveryMode: string;
  }): Promise<void> => {
    await request<unknown>(
      `/api/marketplace/rfq/offers/${encodeURIComponent(quoteId)}/convert-to-order`,
      { method: "POST", body: JSON.stringify(body) }
    );
  },

  // ── Côté vendeur : RFQ reçus ───────────────────────────────────────
  getVendorReceived: async (): Promise<{ stats: RFQVendorStats; data: RFQVendorReceived[] }> => {
    const res = await request<{ success: boolean; data: { stats: RFQVendorStats; data: RFQVendorReceived[] } }>(
      "/api/marketplace/rfq/vendor/received"
    );
    return res.data ?? { stats: { aRepondre: 0, enNegociation: 0, gagnees: 0 }, data: [] };
  },

  getVendorReceivedById: async (id: string): Promise<RFQVendorReceived> => {
    const res = await request<{ success: boolean; data: RFQVendorReceived } | RFQVendorReceived>(
      `/api/marketplace/rfq/vendor/received/${encodeURIComponent(id)}`
    );
    return (res as { data: RFQVendorReceived }).data ?? (res as RFQVendorReceived);
  },

  respondToReceived: async (id: string, payload: {
    price: number;
    deliveryDays: number;
    validityDays: number;
    conditions: string;
  }): Promise<unknown> => {
    return request<unknown>(
      `/api/marketplace/rfq/vendor/received/${encodeURIComponent(id)}/respond`,
      { method: "POST", body: JSON.stringify(payload) }
    );
  },

  // ── Côté vendeur : négociations ────────────────────────────────────
  getVendorNegotiations: async (): Promise<RFQOffer[]> => {
    const res = await request<{ success: boolean; data: RFQOffer[] }>(
      "/api/marketplace/rfq/vendor/negotiations"
    );
    return res.data ?? [];
  },

  getVendorNegotiationMessages: async (quoteId: string): Promise<RFQNegotiationMessage[]> => {
    const res = await request<RFQNegotiationMessage[] | { success: boolean; data: RFQNegotiationMessage[] }>(
      `/api/marketplace/rfq/vendor/negotiations/${encodeURIComponent(quoteId)}/messages`
    );
    return Array.isArray(res) ? res : ((res as { data: RFQNegotiationMessage[] }).data ?? []);
  },

  sendVendorNegotiationMessage: async (quoteId: string, message: string, files?: File[]): Promise<RFQNegotiationMessage[]> => {
    const fd = new FormData();
    fd.append("message", message);
    files?.forEach((f) => fd.append("files", f));
    const res = await requestMultipart<RFQNegotiationMessage[] | { success: boolean; data: RFQNegotiationMessage[] }>(
      `/api/marketplace/rfq/vendor/negotiations/${encodeURIComponent(quoteId)}/messages`, fd
    );
    return Array.isArray(res) ? res : ((res as { data: RFQNegotiationMessage[] }).data ?? []);
  },

  openVendorNegotiation: async (quoteId: string, message: string, files?: File[]): Promise<unknown> => {
    const fd = new FormData();
    fd.append("message", message);
    files?.forEach((f) => fd.append("files", f));
    return requestMultipart<unknown>(
      `/api/marketplace/rfq/vendor/negotiations/${encodeURIComponent(quoteId)}/open`, fd
    );
  },

  sendVendorProforma: async (quoteId: string, payload: {
    proformaNumber: string;
    totalAmount: number;
    depositRate: number;
    depositAmount: number;
    validUntil: string;
    note?: string;
  }): Promise<unknown> => {
    return request<unknown>(
      `/api/marketplace/rfq/vendor/negotiations/${encodeURIComponent(quoteId)}/proforma`,
      { method: "POST", body: JSON.stringify(payload) }
    );
  },
};

// ── Retours (Vendeur) ─────────────────────────────────────────────────────────

export interface ReturnVendor {
  id: string;
  returnNumber: string;
  orderId: string;
  buyerId: string;
  vendorId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  reason: string;
  description: string | null;
  amount: number;
  status: string;
  decisionReason: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  returnedAt: string | null;
  refundedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  product?: { id: string; name: string } | null;
  buyer?: { id: string; name: string } | null;
  order?: { id: string; orderNumber?: string } | null;
}

export interface ReturnVendorStats {
  total: number;
  byStatus: Record<string, number>;
  refundExposure: number;
}

export interface ReturnVendorPage {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: ReturnVendor[];
}

export interface ReturnBuyerStats {
  enCours: number;
  propositionsAttente: number;
  litiges: number;
  resolues: number;
  montantRecupere: number;
  total: number;
  byStatus: Record<string, number>;
  refundedAmount: number;
  pendingProposals: number;
}

export interface ReturnBuyerProposition {
  type?: string;
  montant?: number;
  pourcentage?: number;
  commentaire?: string;
  dateProposition?: string;
}

export interface ReturnBuyerItem {
  id: string;
  returnNumber: string;
  orderId: string;
  buyerId?: string;
  vendorId?: string;
  productId?: string;
  quantity?: number;
  requestType?: string;
  type?: string;
  motif?: string;
  reason?: string;
  description: string | null;
  requestedAmount?: number;
  amount?: number;
  refundedAmount?: number;
  status: string;
  decisionReason?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  returnedAt?: string | null;
  refundedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  media?: string[];
  product?: { id: string; name: string } | null;
  order?: { id: string; orderNumber?: string } | null;
  vendor?: { id: string; name?: string; nom?: string } | null;
  boutique?: { id: string; name?: string; nom?: string } | null;
  proposition?: ReturnBuyerProposition | null;
  messageCount?: number;
}

export interface ReturnBuyerPage {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: ReturnBuyerItem[];
}

export type ReturnRequestType = "retour" | "reclamation" | "litige";

export type ReturnMotif =
  | "produit_endommage"
  | "non_conforme"
  | "quantite_incorrecte"
  | "retard_livraison"
  | "produit_manquant"
  | "qualite_insuffisante"
  | "erreur_commande"
  | "autre";

export interface CreateReturnPayload {
  orderId: string;
  requestType?: ReturnRequestType;
  motif?: ReturnMotif;
  description?: string;
  requestedAmount?: number;
  media?: File[];
}

export const returnsApi = {
  create: async (payload: CreateReturnPayload): Promise<ReturnVendor> => {
    const fd = new FormData();
    fd.append("orderId", payload.orderId);
    if (payload.requestType) fd.append("requestType", payload.requestType);
    if (payload.motif) fd.append("motif", payload.motif);
    if (payload.description) fd.append("description", payload.description);
    if (payload.requestedAmount !== undefined) fd.append("requestedAmount", String(payload.requestedAmount));
    (payload.media ?? []).forEach((file) => fd.append("media", file));
    const res = await requestMultipart<{ success: boolean; data: ReturnVendor } | ReturnVendor>(
      "/api/marketplace/returns", fd
    );
    return (res as { data: ReturnVendor }).data ?? (res as ReturnVendor);
  },

  acceptProposal: async (id: string): Promise<ReturnVendor> => {
    const res = await request<{ success: boolean; data: ReturnVendor } | ReturnVendor>(
      `/api/marketplace/returns/buyer/${encodeURIComponent(id)}/accept-proposal`,
      { method: "POST" }
    );
    return (res as { data: ReturnVendor }).data ?? (res as ReturnVendor);
  },

  rejectProposal: async (id: string): Promise<ReturnVendor> => {
    const res = await request<{ success: boolean; data: ReturnVendor } | ReturnVendor>(
      `/api/marketplace/returns/buyer/${encodeURIComponent(id)}/reject-proposal`,
      { method: "POST" }
    );
    return (res as { data: ReturnVendor }).data ?? (res as ReturnVendor);
  },

  confirmReturned: async (id: string): Promise<ReturnVendor> => {
    const res = await request<{ success: boolean; data: ReturnVendor } | ReturnVendor>(
      `/api/marketplace/returns/buyer/${encodeURIComponent(id)}/confirm-returned`,
      { method: "POST" }
    );
    return (res as { data: ReturnVendor }).data ?? (res as ReturnVendor);
  },

  escalateBuyer: async (id: string, reason: string): Promise<ReturnVendor> => {
    const res = await request<{ success: boolean; data: ReturnVendor } | ReturnVendor>(
      `/api/marketplace/returns/buyer/${encodeURIComponent(id)}/escalate`,
      { method: "POST", body: JSON.stringify({ reason }) }
    );
    return (res as { data: ReturnVendor }).data ?? (res as ReturnVendor);
  },

  getBuyerReturnsList: async (params?: { q?: string; status?: string; type?: string; page?: number; limit?: number }): Promise<ReturnBuyerPage> => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.status && params.status !== "all") qs.set("status", params.status);
    if (params?.type && params.type !== "all") qs.set("type", params.type);
    qs.set("page", String(params?.page ?? 1));
    qs.set("limit", String(params?.limit ?? 20));
    const res = await request<{ success: boolean; data: ReturnBuyerPage }>(
      `/api/marketplace/returns?${qs.toString()}`
    );
    return res.data ?? { page: 1, limit: 20, total: 0, totalPages: 1, data: [] };
  },

  getBuyerReturnDetail: async (id: string): Promise<ReturnBuyerItem> => {
    const res = await request<{ success: boolean; data: ReturnBuyerItem } | ReturnBuyerItem>(
      `/api/marketplace/returns/buyer/${encodeURIComponent(id)}`
    );
    return (res as { data: ReturnBuyerItem }).data ?? (res as ReturnBuyerItem);
  },

  getBuyerStats: async (): Promise<ReturnBuyerStats> => {
    const res = await request<{ success: boolean; data: ReturnBuyerStats }>(
      "/api/marketplace/returns/buyer/stats"
    );
    return res.data ?? {
      enCours: 0,
      propositionsAttente: 0,
      litiges: 0,
      resolues: 0,
      montantRecupere: 0,
      total: 0,
      byStatus: {},
      refundedAmount: 0,
      pendingProposals: 0,
    };
  },

  getVendorList: async (params?: {
    q?: string;
    vendorStatus?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ReturnVendorPage> => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.vendorStatus && params.vendorStatus !== "all") qs.set("vendorStatus", params.vendorStatus);
    if (params?.status && params.status !== "all") qs.set("status", params.status);
    if (params?.type && params.type !== "all") qs.set("type", params.type);
    qs.set("page", String(params?.page ?? 1));
    qs.set("limit", String(params?.limit ?? 20));
    const res = await request<{ success: boolean; data: ReturnVendorPage }>(
      `/api/marketplace/returns/vendor/list?${qs.toString()}`
    );
    return res.data ?? { page: 1, limit: 20, total: 0, totalPages: 1, data: [] };
  },

  getVendorStats: async (): Promise<ReturnVendorStats> => {
    const res = await request<{ success: boolean; data: ReturnVendorStats }>(
      "/api/marketplace/returns/vendor/stats"
    );
    return res.data ?? { total: 0, byStatus: {}, refundExposure: 0 };
  },

  getVendorById: async (id: string): Promise<ReturnVendor> => {
    const res = await request<{ success: boolean; data: ReturnVendor } | ReturnVendor>(
      `/api/marketplace/returns/vendor/${encodeURIComponent(id)}`
    );
    return (res as { data: ReturnVendor }).data ?? (res as ReturnVendor);
  },

  approve: async (id: string, comment?: string): Promise<ReturnVendor> => {
    const res = await request<{ success: boolean; data: ReturnVendor } | ReturnVendor>(
      `/api/marketplace/returns/vendor/${encodeURIComponent(id)}/approve`,
      { method: "POST", body: JSON.stringify({ comment: comment ?? "" }) }
    );
    return (res as { data: ReturnVendor }).data ?? (res as ReturnVendor);
  },

  reject: async (id: string, reason: string): Promise<ReturnVendor> => {
    const res = await request<{ success: boolean; data: ReturnVendor } | ReturnVendor>(
      `/api/marketplace/returns/vendor/${encodeURIComponent(id)}/reject`,
      { method: "POST", body: JSON.stringify({ reason }) }
    );
    return (res as { data: ReturnVendor }).data ?? (res as ReturnVendor);
  },

  refund: async (id: string, amount: number, comment?: string): Promise<ReturnVendor> => {
    const res = await request<{ success: boolean; data: ReturnVendor } | ReturnVendor>(
      `/api/marketplace/returns/vendor/${encodeURIComponent(id)}/refund`,
      { method: "POST", body: JSON.stringify({ amount, comment: comment ?? "" }) }
    );
    return (res as { data: ReturnVendor }).data ?? (res as ReturnVendor);
  },

  close: async (id: string): Promise<ReturnVendor> => {
    const res = await request<{ success: boolean; data: ReturnVendor } | ReturnVendor>(
      `/api/marketplace/returns/vendor/${encodeURIComponent(id)}/close`,
      { method: "POST" }
    );
    return (res as { data: ReturnVendor }).data ?? (res as ReturnVendor);
  },

  confirmReception: async (id: string, comment?: string): Promise<ReturnVendor> => {
    const res = await request<{ success: boolean; data: ReturnVendor } | ReturnVendor>(
      `/api/marketplace/returns/vendor/${encodeURIComponent(id)}/confirm-reception`,
      { method: "POST", body: JSON.stringify({ comment: comment ?? "" }) }
    );
    return (res as { data: ReturnVendor }).data ?? (res as ReturnVendor);
  },

  inspect: async (id: string, payload: { inspectionNotes?: string; decision: string; proposedAmount?: number }): Promise<ReturnVendor> => {
    const res = await request<{ success: boolean; data: ReturnVendor } | ReturnVendor>(
      `/api/marketplace/returns/vendor/${encodeURIComponent(id)}/inspect`,
      { method: "POST", body: JSON.stringify(payload) }
    );
    return (res as { data: ReturnVendor }).data ?? (res as ReturnVendor);
  },

  propose: async (id: string, payload: { type: string; amount?: number; percentage?: number; comment?: string }): Promise<ReturnVendor> => {
    const res = await request<{ success: boolean; data: ReturnVendor } | ReturnVendor>(
      `/api/marketplace/returns/vendor/${encodeURIComponent(id)}/propose`,
      { method: "POST", body: JSON.stringify(payload) }
    );
    return (res as { data: ReturnVendor }).data ?? (res as ReturnVendor);
  },
};

// ── Litiges (Vendeur) ─────────────────────────────────────────────────────────

export interface LitigeMessage {
  id: string;
  litigeId: string;
  senderType: string; // buyer | vendor | mediator
  senderId: string;
  senderName: string;
  content: string;
  proposedAmount: number | null;
  createdAt: string;
  proofUrls?: string[];
}

export interface LitigeVendor {
  id: string;
  litigeNumber: string;
  orderId: string;
  buyerId: string;
  vendorId: string;
  title: string;
  reason: string;
  description: string;
  amount: number;
  status: string;
  resolvedAt: string | null;
  refundedAt: string | null;
  rejectedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  order?: { id: string; orderNumber?: string } | null;
  buyer?: { id: string; name: string } | null;
  messages?: LitigeMessage[];
  medias?: { id: string; url: string; name?: string }[];
}

export interface LitigeVendorPage {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: LitigeVendor[];
}

export const litigesApi = {
  getVendorList: async (params?: { q?: string; status?: string; page?: number; limit?: number }): Promise<LitigeVendorPage> => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.status && params.status !== "all") qs.set("status", params.status);
    qs.set("page", String(params?.page ?? 1));
    qs.set("limit", String(params?.limit ?? 20));
    const res = await request<{ success: boolean; data: LitigeVendorPage }>(
      `/api/marketplace/litiges/vendor/list?${qs.toString()}`
    );
    return res.data ?? { page: 1, limit: 20, total: 0, totalPages: 1, data: [] };
  },

  getVendorById: async (id: string): Promise<LitigeVendor> => {
    const res = await request<{ success: boolean; data: LitigeVendor } | LitigeVendor>(
      `/api/marketplace/litiges/vendor/${encodeURIComponent(id)}`
    );
    return (res as { data: LitigeVendor }).data ?? (res as LitigeVendor);
  },

  reply: async (id: string, message: string, proof?: File[]): Promise<LitigeMessage> => {
    const fd = new FormData();
    fd.append("message", message);
    proof?.forEach((f) => fd.append("proof", f));
    const res = await requestMultipart<{ success: boolean; data: LitigeMessage } | LitigeMessage>(
      `/api/marketplace/litiges/vendor/${encodeURIComponent(id)}/reply`, fd
    );
    return (res as { data: LitigeMessage }).data ?? (res as LitigeMessage);
  },

  acceptMediation: async (id: string, comment?: string): Promise<LitigeVendor> => {
    const res = await request<{ success: boolean; data: LitigeVendor } | LitigeVendor>(
      `/api/marketplace/litiges/vendor/${encodeURIComponent(id)}/accept-mediation`,
      { method: "POST", body: JSON.stringify({ comment: comment ?? "" }) }
    );
    return (res as { data: LitigeVendor }).data ?? (res as LitigeVendor);
  },

  contestMediation: async (id: string, comment?: string): Promise<LitigeVendor> => {
    const res = await request<{ success: boolean; data: LitigeVendor } | LitigeVendor>(
      `/api/marketplace/litiges/vendor/${encodeURIComponent(id)}/contest-mediation`,
      { method: "POST", body: JSON.stringify({ comment: comment ?? "" }) }
    );
    return (res as { data: LitigeVendor }).data ?? (res as LitigeVendor);
  },
};

// ── Commandes (Vendeur) ───────────────────────────────────────────────────────

export interface VendorOrder {
  id: string;
  orderNumber: string;
  userId: string;
  adhesionId?: string;
  boutiqueId: string;
  productVariantId: string;
  quantity: number;
  totalPrice: number;
  status: string;
  trackingNumber: string | null;
  rejectionReason: string | null;
  cancelledReason: string | null;
  confirmedAt: string | null;
  preparedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  shippingCost: number;
  deliveryMode: string;
  deliveryAddress: string | null;
  created_at: string;
  updated_at: string;
  user?: { id: string; name?: string; email?: string } | null;
  product?: { id: string; name: string } | null;
  productVariant?: { id: string; name?: string; product?: { id: string; name: string } } | null;
}

export interface VendorOrdersStats {
  nouvelles: number;
  enCours: number;
  livrees: number;
}

export interface VendorOrdersPage {
  stats: VendorOrdersStats;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: VendorOrder[];
}

export interface BuyerOrder {
  id: string;
  orderNumber: string;
  userId: string;
  adhesionId?: string | null;
  boutiqueId: string;
  productVariantId: string;
  quantity: number;
  totalPrice: number;
  status: string;
  trackingNumber: string | null;
  rejectionReason: string | null;
  cancelledReason: string | null;
  confirmedAt: string | null;
  preparedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  shippingCost: number;
  deliveryMode: string;
  deliveryAddress: string | null;
  created_at: string;
  updated_at: string;
  product?: { id: string; name: string } | null;
  productVariant?: { id: string; name?: string; product?: { id: string; name: string } } | null;
  boutique?: { id: string; name?: string; nom?: string } | null;
}

export interface BuyerOrdersPage {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: BuyerOrder[];
}

export interface ShipmentVendorItem {
  id: string;
  commandeId?: string;
  orderId?: string;
  orderNumber?: string;
  acheteur?: string;
  buyerName?: string;
  telephone?: string;
  phone?: string;
  adresse?: string;
  address?: string;
  ville?: string;
  city?: string;
  produits?: { nom?: string; name?: string; quantite?: number; quantity?: number }[];
  status: string;
  modeLivraison?: string;
  deliveryMode?: string;
  dateCommande?: string;
  orderDate?: string;
  dateExpedition?: string | null;
  shippedAt?: string | null;
  dateLivraisonEstimee?: string;
  estimatedDeliveryDate?: string;
  transporteur?: string | null;
  carrier?: string | null;
  numeroSuivi?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
}

export interface ShipmentVendorStats {
  aPreparer: number;
  prepares: number;
  enCours: number;
  livres: number;
}

export interface ShipmentVendorListPage {
  stats: ShipmentVendorStats;
  data: ShipmentVendorItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BuyerHistoryKpiBlock {
  count: number;
  montantTotal: number;
  montantFormattedM: number;
}

export interface BuyerHistoryKpis {
  totalTransactions: number;
  achats: BuyerHistoryKpiBlock;
  ventes: BuyerHistoryKpiBlock;
  balanceNette: { montant: number; montantFormattedM: number; positive: boolean };
}

export interface BuyerHistoryItem {
  id: string;
  type?: string;
  reference?: string;
  orderNumber?: string;
  date?: string;
  createdAt?: string;
  produit?: string;
  productNeed?: string;
  imageProduit?: string;
  quantite?: number;
  quantity?: number;
  prixUnitaire?: number;
  unitPrice?: number;
  montantTotal?: number;
  totalPrice?: number;
  status: string;
  partenaire?: string;
  vendeur?: string;
  acheteur?: string;
  livraison?: string;
  deliveryMode?: string;
  paiement?: string;
  paymentMethod?: string;
}

export interface BuyerHistoryPage {
  kpis: BuyerHistoryKpis;
  counts: { achats: number; ventes: number; total: number };
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: BuyerHistoryItem[];
}

export const ordersApi = {
  getBuyerHistory: async (params?: {
    type?: "all" | "achat" | "vente";
    status?: string;
    period?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<BuyerHistoryPage> => {
    const qs = new URLSearchParams();
    qs.set("type", params?.type ?? "all");
    qs.set("status", params?.status ?? "all");
    qs.set("period", params?.period ?? "all");
    if (params?.q) qs.set("q", params.q);
    qs.set("page", String(params?.page ?? 1));
    qs.set("limit", String(params?.limit ?? 20));
    const res = await request<{ success: boolean; data: BuyerHistoryPage }>(
      `/api/marketplace/orders/buyer/history?${qs.toString()}`
    );
    return res.data ?? {
      kpis: {
        totalTransactions: 0,
        achats: { count: 0, montantTotal: 0, montantFormattedM: 0 },
        ventes: { count: 0, montantTotal: 0, montantFormattedM: 0 },
        balanceNette: { montant: 0, montantFormattedM: 0, positive: true },
      },
      counts: { achats: 0, ventes: 0, total: 0 },
      page: 1, limit: 20, total: 0, totalPages: 1, data: [],
    };
  },

  getVendorHistory: async (params?: {
    type?: "all" | "achat" | "vente";
    status?: string;
    period?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<BuyerHistoryPage> => {
    const qs = new URLSearchParams();
    qs.set("type", params?.type ?? "all");
    qs.set("status", params?.status ?? "all");
    qs.set("period", params?.period ?? "all");
    if (params?.q) qs.set("q", params.q);
    qs.set("page", String(params?.page ?? 1));
    qs.set("limit", String(params?.limit ?? 20));
    const res = await request<{ success: boolean; data: BuyerHistoryPage }>(
      `/api/marketplace/orders/vendor/history?${qs.toString()}`
    );
    return res.data ?? {
      kpis: {
        totalTransactions: 0,
        achats: { count: 0, montantTotal: 0, montantFormattedM: 0 },
        ventes: { count: 0, montantTotal: 0, montantFormattedM: 0 },
        balanceNette: { montant: 0, montantFormattedM: 0, positive: true },
      },
      counts: { achats: 0, ventes: 0, total: 0 },
      page: 1, limit: 20, total: 0, totalPages: 1, data: [],
    };
  },

  getTransactionDetail: async (orderId: string, type: "achat" | "vente"): Promise<BuyerHistoryItem> => {
    const res = await request<{ success: boolean; data: BuyerHistoryItem } | BuyerHistoryItem>(
      `/api/marketplace/orders/transactions/history/${encodeURIComponent(orderId)}?type=${type}`
    );
    return (res as { data: BuyerHistoryItem }).data ?? (res as BuyerHistoryItem);
  },

  getBuyerList: async (params?: { status?: string; q?: string; page?: number; limit?: number }): Promise<BuyerOrdersPage> => {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== "all") qs.set("status", params.status);
    if (params?.q) qs.set("q", params.q);
    qs.set("page", String(params?.page ?? 1));
    qs.set("limit", String(params?.limit ?? 20));
    const res = await request<{ success: boolean; data: BuyerOrdersPage }>(
      `/api/marketplace/orders?${qs.toString()}`
    );
    return res.data ?? { page: 1, limit: 20, total: 0, totalPages: 1, data: [] };
  },

  getBuyerById: async (id: string): Promise<BuyerOrder> => {
    const res = await request<{ success: boolean; data: BuyerOrder } | BuyerOrder>(
      `/api/marketplace/orders/${encodeURIComponent(id)}`
    );
    return (res as { data: BuyerOrder }).data ?? (res as BuyerOrder);
  },

  getVendorList: async (params?: { status?: string; q?: string; page?: number; limit?: number }): Promise<VendorOrdersPage> => {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== "all") qs.set("status", params.status);
    if (params?.q) qs.set("q", params.q);
    qs.set("page", String(params?.page ?? 1));
    qs.set("limit", String(params?.limit ?? 20));
    const res = await request<{ success: boolean; data: VendorOrdersPage }>(
      `/api/marketplace/orders/vendor-orders/list?${qs.toString()}`
    );
    return res.data ?? { stats: { nouvelles: 0, enCours: 0, livrees: 0 }, page: 1, limit: 20, total: 0, totalPages: 1, data: [] };
  },

  getVendorById: async (id: string): Promise<VendorOrder> => {
    const res = await request<{ success: boolean; data: VendorOrder } | VendorOrder>(
      `/api/marketplace/orders/vendor-orders/${encodeURIComponent(id)}`
    );
    return (res as { data: VendorOrder }).data ?? (res as VendorOrder);
  },

  accept: async (id: string): Promise<VendorOrder> => {
    const res = await request<{ success: boolean; data: VendorOrder } | VendorOrder>(
      `/api/marketplace/orders/vendor-orders/${encodeURIComponent(id)}/accept`,
      { method: "POST" }
    );
    return (res as { data: VendorOrder }).data ?? (res as VendorOrder);
  },

  reject: async (id: string, reason?: string): Promise<VendorOrder> => {
    const res = await request<{ success: boolean; data: VendorOrder } | VendorOrder>(
      `/api/marketplace/orders/vendor-orders/${encodeURIComponent(id)}/reject`,
      { method: "POST", body: JSON.stringify(reason ? { reason } : {}) }
    );
    return (res as { data: VendorOrder }).data ?? (res as VendorOrder);
  },

  updateStatus: async (id: string, status: string, opts?: { trackingNumber?: string; reason?: string }): Promise<VendorOrder> => {
    const res = await request<{ success: boolean; data: VendorOrder } | VendorOrder>(
      `/api/marketplace/orders/vendor-orders/${encodeURIComponent(id)}/status`,
      { method: "PATCH", body: JSON.stringify({ status, ...(opts?.trackingNumber ? { trackingNumber: opts.trackingNumber } : {}), ...(opts?.reason ? { reason: opts.reason } : {}) }) }
    );
    return (res as { data: VendorOrder }).data ?? (res as VendorOrder);
  },

  evaluate: async (id: string, body: CreateOrderEvaluationDto): Promise<OrderEvaluation> => {
    const res = await request<{ success: boolean; data: OrderEvaluation } | OrderEvaluation>(
      `/api/marketplace/orders/${encodeURIComponent(id)}/evaluation`,
      { method: "POST", body: JSON.stringify(body) }
    );
    return (res as { data: OrderEvaluation }).data ?? (res as OrderEvaluation);
  },

  report: async (id: string, body: Omit<CreateOrderReportDto, "orderId">): Promise<OrderReport> => {
    const res = await request<{ success: boolean; data: OrderReport } | OrderReport>(
      `/api/marketplace/orders/${encodeURIComponent(id)}/report`,
      { method: "POST", body: JSON.stringify({ orderId: id, ...body }) }
    );
    return (res as { data: OrderReport }).data ?? (res as OrderReport);
  },

  confirmReception: async (id: string): Promise<void> => {
    await request<unknown>(
      `/api/marketplace/orders/buyer-orders/${encodeURIComponent(id)}/confirm-reception`,
      { method: "POST" }
    );
  },

  cancel: async (id: string): Promise<void> => {
    await request<unknown>(
      `/api/marketplace/orders/buyer-orders/${encodeURIComponent(id)}/cancel`,
      { method: "POST" }
    );
  },

  // ── Expéditions (vendeur) ──────────────────────────────────────────
  getVendorShipmentsList: async (params?: { q?: string; shipmentStatus?: string; page?: number; limit?: number }): Promise<ShipmentVendorListPage> => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.shipmentStatus && params.shipmentStatus !== "all") qs.set("shipmentStatus", params.shipmentStatus);
    qs.set("page", String(params?.page ?? 1));
    qs.set("limit", String(params?.limit ?? 20));
    const res = await request<{ success: boolean; data: ShipmentVendorListPage }>(
      `/api/marketplace/orders/vendor/shipments/list?${qs.toString()}`
    );
    return res.data ?? {
      stats: { aPreparer: 0, prepares: 0, enCours: 0, livres: 0 },
      data: [], total: 0, page: 1, limit: 20, totalPages: 1,
    };
  },

  getVendorShipmentById: async (id: string): Promise<ShipmentVendorItem> => {
    const res = await request<{ success: boolean; data: ShipmentVendorItem } | ShipmentVendorItem>(
      `/api/marketplace/orders/vendor/shipments/${encodeURIComponent(id)}`
    );
    return (res as { data: ShipmentVendorItem }).data ?? (res as ShipmentVendorItem);
  },

  prepareShipment: async (id: string): Promise<ShipmentVendorItem> => {
    const res = await request<{ success: boolean; data: ShipmentVendorItem } | ShipmentVendorItem>(
      `/api/marketplace/orders/vendor/shipments/${encodeURIComponent(id)}/prepare`,
      { method: "POST" }
    );
    return (res as { data: ShipmentVendorItem }).data ?? (res as ShipmentVendorItem);
  },

  shipShipment: async (id: string, payload: {
    transporteur: string;
    numeroSuivi?: string;
    notes?: string;
    deliverySlip?: File;
  }): Promise<ShipmentVendorItem> => {
    const fd = new FormData();
    fd.append("transporteur", payload.transporteur);
    if (payload.numeroSuivi) fd.append("numeroSuivi", payload.numeroSuivi);
    if (payload.notes) fd.append("notes", payload.notes);
    if (payload.deliverySlip) fd.append("deliverySlip", payload.deliverySlip);
    const res = await requestMultipart<{ success: boolean; data: ShipmentVendorItem } | ShipmentVendorItem>(
      `/api/marketplace/orders/vendor/shipments/${encodeURIComponent(id)}/ship`, fd
    );
    return (res as { data: ShipmentVendorItem }).data ?? (res as ShipmentVendorItem);
  },
};

export interface CreateOrderEvaluationDto {
  rating: number;
  productQualityRating?: number;
  deliveryRating?: number;
  customerServiceRating?: number;
  comment?: string;
}

export interface OrderEvaluation extends CreateOrderEvaluationDto {
  id: string;
  orderId: string;
  created_at: string;
}

export type OrderReportType = "product_issue" | "delivery_issue" | "service_issue" | "other";

export interface CreateOrderReportDto {
  orderId: string;
  reportType: OrderReportType;
  title: string;
  description: string;
}

export interface OrderReport extends CreateOrderReportDto {
  id: string;
  status: string;
  response?: string | null;
  created_at: string;
}
