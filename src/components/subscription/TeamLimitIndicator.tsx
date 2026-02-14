import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export function TeamLimitIndicator() {
  const { subscription, getTeamLimit } = useSubscription();

  if (!subscription) return null;

  const limit = getTeamLimit();
  const current = subscription.currentTeamSize;
  const unlimited = limit === -1;
  const percentage = unlimited ? 0 : (current / limit) * 100;
  const nearLimit = percentage > 80;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Membres de l'équipe
          </span>
          {nearLimit && !unlimited && (
            <Badge variant="outline" className="text-warning border-warning">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Limite proche
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Utilisateurs</span>
            <span className="font-medium">
              {current} / {unlimited ? '∞' : limit}
            </span> 
          </div>
          {!unlimited && (
            <Progress value={percentage} className="h-2" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
