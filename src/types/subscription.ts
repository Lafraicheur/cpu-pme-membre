// Types et interfaces pour le système d'abonnement

// Niveaux d'abonnement
export type SubscriptionTier =
  | 'BASIC'
  | 'ARGENT'
  | 'OR'
  | 'ORGANISATION'
  | 'FEDERATION'
  | 'INSTITUTIONNEL';

export type SubscriptionCategory = 'individual' | 'collective';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial';

// Identifiants de fonctionnalités
export type Feature =
  // Auth & Profile
  | 'auth.sso'
  | 'profile.public'
  | 'directory.read'

  // Marketplace
  | 'marketplace.buyer'
  | 'marketplace.seller'

  // Appels d'offres
  | 'ao.consultation'
  | 'ao.submission'
  | 'ao.publishing'

  // Formation
  | 'formation.learner'
  | 'formation.creator'

  // Events
  | 'events.participation'
  | 'events.organization'

  // Incubator
  | 'incubator.access'
  | 'incubator.mentoring'

  // Affiliation
  | 'affiliation.access'

  // Financing
  | 'financing.requests'
  | 'financing.donations'

  // Analytics & Data
  | 'analytics.basic'
  | 'analytics.advanced'
  | 'analytics.sector'
  | 'datahub.access'

  // Exports
  | 'export.pdf'
  | 'export.xlsx'

  // API & Integrations
  | 'api.access'
  | 'integrations.enabled'

  // Support
  | 'support.standard'
  | 'support.priority'
  | 'support.premium';

// Interface d'abonnement
export interface Subscription {
  tier: SubscriptionTier;
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  teamLimit: number;
  currentTeamSize: number;
  features: Feature[];
}

// Configuration d'un tier
export interface TierConfig {
  tier: SubscriptionTier;
  name: string;
  category: SubscriptionCategory;
  price: number;
  period: 'month' | 'year';
  teamLimit: number;
  features: Feature[];
  inheritsFrom?: SubscriptionTier;
}
