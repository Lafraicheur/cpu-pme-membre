import { ReactNode } from 'react';
import { Feature } from '@/types/subscription';
import { useSubscription } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionGuardProps {
  feature: Feature;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function SubscriptionGuard({
  feature,
  children,
  fallback,
  showUpgrade = false,
}: SubscriptionGuardProps) {
  const { canAccess, requiresUpgrade } = useSubscription();
  const navigate = useNavigate();

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgrade) {
    const requiredTier = requiresUpgrade(feature);
    return (
      <Alert className="border-primary/50">
        <Lock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Cette fonctionnalité requiert un abonnement {requiredTier || 'supérieur'}
          </span>
          <Button
            size="sm"
            onClick={() => navigate('/abonnement')}
            className="gap-2"
          >
            <Crown className="h-4 w-4" />
            Mettre à niveau
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null; // Hide completely
}
