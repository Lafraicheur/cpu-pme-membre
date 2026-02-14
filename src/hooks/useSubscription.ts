import { useAuth } from '@/contexts/AuthContext';
import { Feature, SubscriptionTier } from '@/types/subscription';
import { getRequiredTier } from '@/lib/permissions';

export function useSubscription() {
  const { user, canAccess, canAddTeamMember, getTeamLimit } = useAuth();

  const requiresUpgrade = (feature: Feature): SubscriptionTier | null => {
    if (canAccess(feature)) return null;
    return getRequiredTier(feature);
  };

  return {
    subscription: user?.subscription || null,
    canAccess,
    getTeamLimit,
    canAddMember: canAddTeamMember,
    requiresUpgrade,
    tier: user?.subscription?.tier || null,
    category: user?.subscription?.category || null,
  };
}
