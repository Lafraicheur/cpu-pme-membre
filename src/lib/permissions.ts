import { SubscriptionTier, Feature, TierConfig } from '@/types/subscription';

// Configuration des tiers avec héritage
export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  BASIC: {
    tier: 'BASIC',
    name: 'Basic',
    category: 'individual',
    price: 1000,
    period: 'month',
    teamLimit: 1,
    features: [
      'auth.sso',
      'profile.public',
      'directory.read',
      'ao.consultation',
      'formation.learner',
      'events.participation',
      'support.standard',
    ],
  },
  ARGENT: {
    tier: 'ARGENT',
    name: 'Argent',
    category: 'individual',
    price: 5000,
    period: 'month',
    teamLimit: 3,
    inheritsFrom: 'BASIC',
    features: [
      'marketplace.buyer',
      'marketplace.seller',
      'ao.submission',
      'ao.publishing',
      'incubator.access',
      'incubator.mentoring',
      'financing.requests',
      'support.priority',
    ],
  },
  OR: {
    tier: 'OR',
    name: 'Or',
    category: 'individual',
    price: 10000,
    period: 'month',
    teamLimit: 5,
    inheritsFrom: 'ARGENT',
    features: [
      'formation.creator',
      'events.organization',
      'datahub.access',
      'analytics.basic',
      'export.pdf',
      'export.xlsx',
    ],
  },
  ORGANISATION: {
    tier: 'ORGANISATION',
    name: 'Organisation',
    category: 'collective',
    price: 17500,
    period: 'month',
    teamLimit: 10,
    inheritsFrom: 'OR',
    features: [
      'affiliation.access',
      'analytics.advanced',
    ],
  },
  FEDERATION: {
    tier: 'FEDERATION',
    name: 'Fédération',
    category: 'collective',
    price: 30000,
    period: 'month',
    teamLimit: 20,
    inheritsFrom: 'ORGANISATION',
    features: [
      'analytics.sector',
    ],
  },
  INSTITUTIONNEL: {
    tier: 'INSTITUTIONNEL',
    name: 'Institutionnel',
    category: 'collective',
    price: 0, // sur devis
    period: 'month',
    teamLimit: -1, // unlimited
    inheritsFrom: 'FEDERATION',
    features: [
      'financing.donations',
      'api.access',
      'integrations.enabled',
      'support.premium',
    ],
  },
};

// Obtenir toutes les fonctionnalités d'un tier (avec héritage)
export function getFeaturesForTier(tier: SubscriptionTier): Feature[] {
  const config = TIER_CONFIGS[tier];
  const features = new Set<Feature>(config.features);

  // Ajouter les fonctionnalités héritées
  let currentTier = tier;
  while (TIER_CONFIGS[currentTier].inheritsFrom) {
    const parentTier = TIER_CONFIGS[currentTier].inheritsFrom!;
    TIER_CONFIGS[parentTier].features.forEach(f => features.add(f));
    currentTier = parentTier;
  }

  return Array.from(features);
}

// Vérifier si un utilisateur peut accéder à une fonctionnalité
export function canAccessFeature(
  userTier: SubscriptionTier,
  feature: Feature
): boolean {
  const allowedFeatures = getFeaturesForTier(userTier);
  return allowedFeatures.includes(feature);
}

// Vérifier la limite d'équipe
export function canAddTeamMember(
  currentSize: number,
  tierLimit: number
): boolean {
  if (tierLimit === -1) return true; // unlimited
  return currentSize < tierLimit;
}

// Trouver le tier minimum requis pour une fonctionnalité
export function getRequiredTier(feature: Feature): SubscriptionTier | null {
  const tiers: SubscriptionTier[] = [
    'BASIC',
    'ARGENT',
    'OR',
    'ORGANISATION',
    'FEDERATION',
    'INSTITUTIONNEL',
  ];

  for (const tier of tiers) {
    const features = getFeaturesForTier(tier);
    if (features.includes(feature)) {
      return tier;
    }
  }
  return null;
}
