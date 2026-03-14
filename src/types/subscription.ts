// Types et interfaces pour le système d'abonnement

// Niveaux d'abonnement
export type SubscriptionTier =
  // Membre Individuel
  | 'MI_BASIC'
  | 'MI_ARGENT'
  | 'MI_OR'
  // Membre Entreprise
  | 'ME_BASIC'
  | 'ME_ARGENT'
  | 'ME_OR'
  // Collectif
  | 'ORGANISATION'
  | 'FEDERATION'
  | 'INSTITUTIONNEL';

export type SubscriptionCategory = 'individual' | 'entreprise' | 'collective';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial';

// Identifiants de fonctionnalités
export type Feature =
  // Auth & Profil
  | 'auth.sso'
  | 'profile.public'
  | 'directory.read'
  | 'team.management'

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

  // Incubateur
  | 'incubator.access'

  // Affiliation
  | 'affiliation.access'

  // Financement
  | 'financing.requests'
  | 'financing.donations'

  // Événements
  | 'events.participation'
  | 'events.b2b'
  | 'events.organization'

  // Data & Analytics
  | 'datahub.access'

  // Exports
  | 'export.pdf'
  | 'export.xlsx'

  // API & Intégrations
  | 'api.access'
  | 'integrations.enabled';

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
  priceYearly: number;
  period: 'month' | 'year';
  teamLimit: number;
  features: Feature[];
}
