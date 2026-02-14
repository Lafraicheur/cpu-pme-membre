import { Badge } from '@/components/ui/badge';
import { SubscriptionTier } from '@/types/subscription';
import { Crown, Star, Sparkles, Building2, Users, Landmark } from 'lucide-react';

const TIER_STYLES: Record<SubscriptionTier, {
  color: string;
  icon: React.ElementType;
  label: string;
}> = {
  BASIC: {
    color: 'bg-muted text-muted-foreground',
    icon: Sparkles,
    label: 'Basic',
  },
  ARGENT: {
    color: 'bg-secondary text-secondary-foreground',
    icon: Star,
    label: 'Argent',
  },
  OR: {
    color: 'bg-primary text-primary-foreground',
    icon: Crown,
    label: 'Or',
  },
  ORGANISATION: {
    color: 'bg-blue-500 text-white',
    icon: Building2,
    label: 'Organisation',
  },
  FEDERATION: {
    color: 'bg-purple-500 text-white',
    icon: Users,
    label: 'Fédération',
  },
  INSTITUTIONNEL: {
    color: 'bg-amber-500 text-white',
    icon: Landmark,
    label: 'Institutionnel',
  },
};

interface FeatureBadgeProps {
  requiredTier: SubscriptionTier;
  size?: 'sm' | 'md' | 'lg';
}

export function FeatureBadge({ requiredTier, size = 'md' }: FeatureBadgeProps) {
  const config = TIER_STYLES[requiredTier];
  const Icon = config.icon;

  return (
    <Badge className={`gap-1 ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
