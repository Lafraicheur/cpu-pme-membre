import { cn } from "@/lib/utils";

interface HealthScoreProps {
  score: number;
  breakdown: { label: string; score: number; max: number }[];
}

export function HealthScore({ score, breakdown }: HealthScoreProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-success";
    if (value >= 60) return "text-warning";
    return "text-destructive";
  };

  const getProgressColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return "bg-success";
    if (percentage >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Santé de l'activité
          </h2>
          <p className="text-sm text-muted-foreground">
            Score global de votre entreprise
          </p>
        </div>
      </div>

      {/* Main score */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-6 mb-6">
        <div className="relative flex-shrink-0">
          <svg className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 transform -rotate-90" viewBox="0 0 112 112">
            <circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="10"
            />
            <circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="10"
              strokeDasharray={`${(score / 100) * 301.6} 301.6`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-2xl sm:text-3xl font-bold", getScoreColor(score))}>
              {score}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {breakdown.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">
                  {item.score}/{item.max}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    getProgressColor(item.score, item.max)
                  )}
                  style={{
                    width: `${(item.score / item.max) * 100}%`,
                    animationDelay: `${idx * 0.2}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-2.5 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300">
        Voir les recommandations
      </button>
    </div>
  );
}
