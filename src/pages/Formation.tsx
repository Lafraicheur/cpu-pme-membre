import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, Users, Award, CreditCard, FileText, Settings, Lock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { FormationOverview } from "@/components/formation/FormationOverview";
import { CatalogueFormations } from "@/components/formation/CatalogueFormations";
import { FormationDetail } from "@/components/formation/FormationDetail";
import { MesApprenants } from "@/components/formation/MesApprenants";
import { ParcoursCertifications } from "@/components/formation/ParcoursCertifications";

type ViewMode = "list" | "detail";

export default function Formation() {
  const { canAccess } = useSubscription();
  const canCreate = canAccess('formation.creator');

  const [activeTab, setActiveTab] = useState("apercu");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFormationId, setSelectedFormationId] = useState<string | null>(null);

  const handleViewDetail = (formationId: string) => {
    setSelectedFormationId(formationId);
    setViewMode("detail");
  };

  const handleBack = () => {
    setViewMode("list");
    setSelectedFormationId(null);
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  if (viewMode === "detail" && selectedFormationId) {
    return (
      <DashboardLayout>
        <FormationDetail formationId={selectedFormationId} onBack={handleBack} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            CPU Academy - Formation
          </h1>
          <p className="text-muted-foreground mt-1">
            Développez les compétences de votre équipe avec nos formations certifiantes
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="apercu" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="catalogue" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Catalogue
            </TabsTrigger>
            <TabsTrigger value="apprenants" className="gap-2">
              <Users className="w-4 h-4" />
              Mes apprenants
            </TabsTrigger>
            <TabsTrigger value="inscriptions" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Inscriptions
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-2">
              <Award className="w-4 h-4" />
              Certificats
            </TabsTrigger>
            {canCreate && (
              <TabsTrigger value="creer" className="gap-2">
                <Settings className="w-4 h-4" />
                Créer
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="apercu">
            <FormationOverview onNavigate={handleNavigate} />
          </TabsContent>

          <TabsContent value="catalogue">
            <CatalogueFormations onViewDetail={handleViewDetail} />
          </TabsContent>

          <TabsContent value="apprenants">
            <MesApprenants />
          </TabsContent>

          <TabsContent value="inscriptions">
            <MesApprenants />
          </TabsContent>

          <TabsContent value="certifications">
            <ParcoursCertifications />
          </TabsContent>

          {canCreate && (
            <TabsContent value="creer">
              <div className="text-center py-12 text-muted-foreground">
                <p>Interface de création de formations</p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
