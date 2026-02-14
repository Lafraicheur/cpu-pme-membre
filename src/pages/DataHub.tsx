import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DataHubOverview } from "@/components/datahub/DataHubOverview";
import { DataHubDashboards } from "@/components/datahub/DataHubDashboards";
import { DataQuality } from "@/components/datahub/DataQuality";
import { ReportsLibrary } from "@/components/datahub/ReportsLibrary";
import { ReportWizard } from "@/components/datahub/ReportWizard";
import { Benchmarks } from "@/components/datahub/Benchmarks";
import { InsightsAlerts } from "@/components/datahub/InsightsAlerts";
import { DataAudit } from "@/components/datahub/DataAudit";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";

type ViewMode = "overview" | "dashboards" | "quality" | "reports" | "generate-report" | "benchmarks" | "insights" | "audit";

export default function DataHub() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const { user } = useAuth();
  const { canAccess } = useSubscription();

  const handleBack = () => setViewMode("overview");

  // Permission check - export requires OR tier or higher
  const canExport = canAccess('export.pdf') || canAccess('export.xlsx');

  return (
    <>
      <Helmet>
        <title>Data Hub - CPU-PME</title>
        <meta name="description" content="Accédez à vos données, rapports et analyses business sur le Hub CPU-PME." />
      </Helmet>
      <DashboardLayout>
        <SubscriptionGuard feature="datahub.access" showUpgrade={true}>
          <div className="space-y-6 animate-fade-in">
            {viewMode === "overview" && (
              <DataHubOverview
                onNavigateDashboards={() => setViewMode("dashboards")}
                onNavigateQuality={() => setViewMode("quality")}
                onNavigateReports={() => setViewMode("reports")}
                onNavigateBenchmarks={() => setViewMode("benchmarks")}
                onNavigateInsights={() => setViewMode("insights")}
                onNavigateAudit={() => setViewMode("audit")}
                canExport={canExport}
              />
            )}

            {viewMode === "dashboards" && (
              <DataHubDashboards onBack={handleBack} />
            )}

            {viewMode === "quality" && (
              <DataQuality onBack={handleBack} />
            )}

            {viewMode === "reports" && (
              <ReportsLibrary
                onBack={handleBack}
                onGenerateReport={() => setViewMode("generate-report")}
                canExport={canExport}
              />
            )}

            {viewMode === "generate-report" && (
              <ReportWizard
                onBack={() => setViewMode("reports")}
                onComplete={() => setViewMode("reports")}
                canExport={canExport}
              />
            )}

            {viewMode === "benchmarks" && (
              <Benchmarks onBack={handleBack} />
            )}

            {viewMode === "insights" && (
              <InsightsAlerts onBack={handleBack} />
            )}

            {viewMode === "audit" && (
              <DataAudit onBack={handleBack} />
            )}
          </div>
        </SubscriptionGuard>
      </DashboardLayout>
    </>
  );
}
