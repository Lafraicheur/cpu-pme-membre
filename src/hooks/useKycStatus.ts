import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { kycApi, type KycCase } from "@/lib/api";

/** Lit `created_at` depuis le profil adhésion mis en cache dans localStorage
 * ("cpu-adhesion", posé lors du login — cf. AuthContext). */
function getAdhesionCreatedAt(): string | undefined {
  try {
    const stored = localStorage.getItem("cpu-adhesion");
    if (!stored) return undefined;
    const parsed = JSON.parse(stored) as { created_at?: string };
    return parsed.created_at;
  } catch {
    return undefined;
  }
}

/** Délai (Niveau 1) : nombre de jours après la 1ère connexion (abonnementStartDate)
 * avant suspension des services (annuaire + marketplace). */
export const KYC_ACCESS_DEADLINE_DAYS = 30;

/** Niveau 1 : compte actif + visible dans l'annuaire. */
const KYC_ACCESS_LEVEL_CODE = "Standard";
/** Niveau 2 : débloque les boutons Créer/Publier des modules métier. */
const KYC_MODULE_LEVEL_CODE = "Moyen";

export type KycCaseStatus = KycCase["status"] | "not_started";

const STATUS_LABELS: Record<string, string> = {
  not_started: "Non démarré",
  draft: "Brouillon",
  submitted: "Documents soumis",
  in_review: "En cours de vérification",
  approved: "Validé",
  rejected: "Refusé",
  expired: "Expiré",
};

function isNotFound(err: unknown): boolean {
  return typeof err === "object" && err !== null && "status" in err && (err as { status?: number }).status === 404;
}

/** true si le niveau KYC déjà validé (currentKycLevel) est au moins celui recherché (par sortOrder). */
function hasReachedLevel(
  currentSortOrder: number | undefined,
  levels: { code: string; sortOrder: number }[] | undefined,
  levelCode: string
): boolean {
  if (currentSortOrder === undefined || !levels) return false;
  const target = levels.find((l) => l.code.toLowerCase() === levelCode.toLowerCase());
  if (!target) return false;
  return currentSortOrder >= target.sortOrder;
}

/** Statut du dossier KYC basé sur GET /api/adhesions/me/kyc + GET /api/adhesions/me/kyc/levels.
 * Distingue Niveau 1 (Standard : compte actif + annuaire) de Niveau 2 (Moyen : modules métier),
 * car un dossier peut être "approuvé" au niveau Standard sans que Moyen soit atteint. */
export function useKycStatus() {
  const { isAuthenticated, user } = useAuth();

  const { data: kycCase, isLoading: isLoadingCase, isError: isErrorCase, refetch } = useQuery({
    queryKey: ["kyc-case"],
    queryFn: async () => {
      try {
        return await kycApi.getKycCase();
      } catch (err) {
        // Aucun dossier KYC démarré : état initial, pas une erreur technique.
        if (isNotFound(err)) return null;
        throw err;
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: levelsData, isLoading: isLoadingLevels, isError: isErrorLevels } = useQuery({
    queryKey: ["kyc-levels"],
    queryFn: () => kycApi.getLevels(),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const isLoading = isLoadingCase || isLoadingLevels;
  const isError = isErrorCase || isErrorLevels;

  const status: KycCaseStatus = kycCase?.status ?? "not_started";
  const currentSortOrder = kycCase?.currentKycLevel?.sortOrder;

  // Niveau 1 (Standard) : compte actif + annuaire — pilote la bannière de compte.
  const isAccessValidated = hasReachedLevel(currentSortOrder, levelsData?.levels, KYC_ACCESS_LEVEL_CODE);
  // Niveau 2 (Moyen) : débloque les boutons Créer/Publier des modules métier.
  const isModuleValidated = hasReachedLevel(currentSortOrder, levelsData?.levels, KYC_MODULE_LEVEL_CODE);

  // Point de départ du délai de 30 jours (= 1ère connexion) : abonnementStartDate du profil
  // ("cpu-pme-user"), sinon created_at de l'adhésion ("cpu-adhesion").
  const accessStartDate = user?.abonnementStartDate ?? getAdhesionCreatedAt();
  const daysSinceStart = accessStartDate
    ? Math.floor((Date.now() - new Date(accessStartDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const daysRemaining = Math.max(0, KYC_ACCESS_DEADLINE_DAYS - daysSinceStart);
  // Compte au-delà du délai de 30 jours sans avoir atteint le niveau Standard → services suspendus.
  const isOverdue = !isAccessValidated && daysSinceStart > KYC_ACCESS_DEADLINE_DAYS;

  return {
    kycCase: kycCase ?? null,
    isLoading,
    // En cas d'erreur technique on ne bloque pas l'utilisateur : on ne remonte que l'info de statut inconnu.
    isError,
    status,
    statusLabel: STATUS_LABELS[status] ?? status,
    /** Niveau 1 atteint (Standard) — compte actif / annuaire. */
    isValidated: isAccessValidated,
    /** Niveau 2 atteint (Moyen) — modules métier déblocables. */
    isModuleValidated,
    requiredKycLevel: kycCase?.targetKycLevel?.name ?? null,
    currentKycLevel: kycCase?.currentKycLevel?.name ?? null,
    rejectionReason: kycCase?.rejectionReason ?? null,
    daysRemaining,
    isOverdue,
    refetch,
  };
}

/** Bloque une action métier (créer/publier) tant que le Niveau 2 (KYC Moyen) n'est pas atteint.
 * `fallbackMessage` est le message métier du module (ex: "Veuillez compléter votre KYC Organisateur.")
 * affiché par défaut ; les statuts intermédiaires du dossier en cours (soumis/en revue/refusé/expiré)
 * affichent un message plus précis tant que le Niveau 2 n'est pas encore atteint. */
export function useKycGate(fallbackMessage: string) {
  const kyc = useKycStatus();

  // En cas d'erreur technique (API indisponible), on ne bloque pas l'utilisateur.
  const allowed = kyc.isError || (!kyc.isLoading && kyc.isModuleValidated);

  let reason: string | undefined;
  if (kyc.isLoading) {
    reason = "Vérification de votre statut KYC en cours…";
  } else if (kyc.isError) {
    reason = undefined;
  } else if (kyc.status === "rejected") {
    reason = kyc.rejectionReason
      ? `Dossier KYC refusé : ${kyc.rejectionReason}.`
      : "Votre dossier KYC a été refusé. Consultez la page KYC & Conformité.";
  } else if (kyc.status === "submitted" || kyc.status === "in_review") {
    reason = "Votre dossier KYC est en cours de vérification.";
  } else if (kyc.status === "expired") {
    reason = "Votre KYC a expiré. Déposez à nouveau vos documents.";
  } else {
    reason = fallbackMessage;
  }

  return { allowed, reason, isLoading: kyc.isLoading };
}
