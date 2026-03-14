import { SubscriptionTier, Feature, TierConfig } from '@/types/subscription';

// Configuration explicite des tiers (sans héritage)
export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {

  // ── Membre Individuel ──────────────────────────────────────────
  MI_BASIC: {
    tier: 'MI_BASIC',
    name: 'Basic Individuel',
    category: 'individual',
    price: 1000,
    priceYearly: 10000,
    period: 'month',
    teamLimit: 1,
    features: [
      'auth.sso',
      'ao.consultation',
      'formation.learner',
      'marketplace.buyer',
      'incubator.access',
      'events.participation',
    ],
  },

  MI_ARGENT: {
    tier: 'MI_ARGENT',
    name: 'Argent Professionnel',
    category: 'individual',
    price: 4000,
    priceYearly: 40000,
    period: 'month',
    teamLimit: 1,
    features: [
      'auth.sso',
      'ao.consultation',
      'formation.learner',
      'marketplace.buyer',
      'incubator.access',
      'events.participation',
      'events.b2b',
    ],
  },

  MI_OR: {
    tier: 'MI_OR',
    name: 'Or Professionnel',
    category: 'individual',
    price: 7000,
    priceYearly: 80000,
    period: 'month',
    teamLimit: 1,
    features: [
      'auth.sso',
      'ao.consultation',
      'ao.submission',
      'formation.learner',
      'formation.creator',
      'marketplace.buyer',
      'incubator.access',
      'events.participation',
      'events.b2b',
    ],
  },

  // ── Membre Entreprise ──────────────────────────────────────────
  ME_BASIC: {
    tier: 'ME_BASIC',
    name: 'Basic Entreprise',
    category: 'entreprise',
    price: 2500,
    priceYearly: 30000,
    period: 'month',
    teamLimit: 5,
    features: [
      'auth.sso',
      'profile.public',
      'directory.read',
      'team.management',
      'ao.consultation',
      'formation.learner',
      'incubator.access',
      'events.participation',
      'events.b2b',
    ],
  },

  ME_ARGENT: {
    tier: 'ME_ARGENT',
    name: 'Argent Entreprise',
    category: 'entreprise',
    price: 5000,
    priceYearly: 50000,
    period: 'month',
    teamLimit: 10,
    features: [
      'auth.sso',
      'profile.public',
      'directory.read',
      'team.management',
      'marketplace.buyer',
      'marketplace.seller',
      'ao.consultation',
      'ao.submission',
      'formation.learner',
      'incubator.access',
      'financing.requests',
      'events.participation',
      'events.b2b',
    ],
  },

  ME_OR: {
    tier: 'ME_OR',
    name: 'Or Entreprise',
    category: 'entreprise',
    price: 10000,
    priceYearly: 100000,
    period: 'month',
    teamLimit: 20,
    features: [
      'auth.sso',
      'profile.public',
      'directory.read',
      'team.management',
      'marketplace.buyer',
      'marketplace.seller',
      'ao.consultation',
      'ao.submission',
      'ao.publishing',
      'formation.learner',
      'formation.creator',
      'incubator.access',
      'financing.requests',
      'financing.donations',
      'events.participation',
      'events.b2b',
    ],
  },

  // ── Collectif ──────────────────────────────────────────────────
  ORGANISATION: {
    tier: 'ORGANISATION',
    name: 'Organisation',
    category: 'collective',
    price: 17500,
    priceYearly: 200000,
    period: 'month',
    teamLimit: 50,
    features: [
      'auth.sso',
      'profile.public',
      'directory.read',
      'team.management',
      'affiliation.access',
      'marketplace.buyer',
      'marketplace.seller',
      'ao.consultation',
      'ao.submission',
      'ao.publishing',
      'formation.learner',
      'formation.creator',
      'incubator.access',
      'financing.requests',
      'events.participation',
      'events.b2b',
      'events.organization',
      'datahub.access',
      'export.pdf',
      'export.xlsx',
    ],
  },

  FEDERATION: {
    tier: 'FEDERATION',
    name: 'Fédération',
    category: 'collective',
    price: 30000,
    priceYearly: 350000,
    period: 'month',
    teamLimit: 100,
    features: [
      'auth.sso',
      'profile.public',
      'directory.read',
      'team.management',
      'affiliation.access',
      'marketplace.buyer',
      'marketplace.seller',
      'ao.consultation',
      'ao.submission',
      'ao.publishing',
      'formation.learner',
      'formation.creator',
      'incubator.access',
      'financing.requests',
      'financing.donations',
      'events.participation',
      'events.b2b',
      'events.organization',
      'datahub.access',
      'export.pdf',
      'export.xlsx',
    ],
  },

  INSTITUTIONNEL: {
    tier: 'INSTITUTIONNEL',
    name: 'Institutionnel',
    category: 'collective',
    price: 0, // sur devis
    priceYearly: 0,
    period: 'month',
    teamLimit: -1, // illimité
    features: [
      'auth.sso',
      'team.management',
      'marketplace.buyer',
      'ao.consultation',
      'formation.learner',
      'formation.creator',
      'financing.donations',
      'events.participation',
      'events.b2b',
      'events.organization',
      'datahub.access',
      'export.pdf',
      'export.xlsx',
      'api.access',
      'integrations.enabled',
    ],
  },
};

// Obtenir toutes les fonctionnalités d'un tier
export function getFeaturesForTier(tier: SubscriptionTier): Feature[] {
  return TIER_CONFIGS[tier].features;
}

// Vérifier si un utilisateur peut accéder à une fonctionnalité
export function canAccessFeature(
  userTier: SubscriptionTier,
  feature: Feature
): boolean {
  return TIER_CONFIGS[userTier].features.includes(feature);
}

// Vérifier la limite d'équipe
export function canAddTeamMember(
  currentSize: number,
  tierLimit: number
): boolean {
  if (tierLimit === -1) return true; // illimité
  return currentSize < tierLimit;
}

// Ordre des tiers par prix croissant (pour getRequiredTier)
const TIER_ORDER: SubscriptionTier[] = [
  'MI_BASIC',    // 1 000
  'ME_BASIC',    // 2 500
  'MI_ARGENT',   // 4 000
  'ME_ARGENT',   // 5 000
  'MI_OR',       // 7 000
  'ME_OR',       // 10 000
  'ORGANISATION', // 17 500
  'FEDERATION',   // 30 000
  'INSTITUTIONNEL', // sur devis
];

// Trouver le tier le moins cher qui donne accès à une fonctionnalité
export function getRequiredTier(feature: Feature): SubscriptionTier | null {
  for (const tier of TIER_ORDER) {
    if (TIER_CONFIGS[tier].features.includes(feature)) {
      return tier;
    }
  }
  return null;
}
