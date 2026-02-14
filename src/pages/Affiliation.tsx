import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AffiliationOverview } from "@/components/affiliation/AffiliationOverview";
import { AffiliationWizard } from "@/components/affiliation/AffiliationWizard";
import { AffiliationHistory } from "@/components/affiliation/AffiliationHistory";
import { AffiliationSettings } from "@/components/affiliation/AffiliationSettings";
import { useAuth } from "@/contexts/AuthContext";

type ViewMode = "overview" | "declare" | "change" | "history" | "settings";

export default function Affiliation() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const { isAuthenticated } = useAuth();

  const handleDeclare = () => setViewMode("declare");
  const handleChangeRequest = () => setViewMode("change");
  const handleViewHistory = () => setViewMode("history");
  const handleSettings = () => setViewMode("settings");
  const handleBack = () => setViewMode("overview");

  const handleWizardComplete = () => {
    setViewMode("overview");
  };

  return (
    <>
      <Helmet>
        <title>Affiliation | CPU-PME Hub</title>
        <meta name="description" content="Gérez votre affiliation à une coopérative, fédération ou association pour le reporting filière et l'animation." />
      </Helmet>
      <DashboardLayout>
        <div className="space-y-6">
          {viewMode === "overview" && (
            <AffiliationOverview
              onDeclare={handleDeclare}
              onChangeRequest={handleChangeRequest}
              onViewHistory={handleViewHistory}
              onSettings={handleSettings}
              isAccountActive={isAuthenticated}
            />
          )}

          {viewMode === "declare" && (
            <AffiliationWizard
              mode="declare"
              onComplete={handleWizardComplete}
              onCancel={handleBack}
            />
          )}

          {viewMode === "change" && (
            <AffiliationWizard
              mode="change"
              onComplete={handleWizardComplete}
              onCancel={handleBack}
            />
          )}

          {viewMode === "history" && (
            <AffiliationHistory onBack={handleBack} />
          )}

          {viewMode === "settings" && (
            <AffiliationSettings onBack={handleBack} />
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
