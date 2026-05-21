import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, Users, Award, Target, User, Lock, Building2, PlayCircle, ClipboardCheck } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeSubscriptionModal } from "@/components/subscription/UpgradeSubscriptionModal";
import { FormationOverview } from "@/components/formation/FormationOverview";
import { CatalogueFormations } from "@/components/formation/CatalogueFormations";
import { FormationDetail } from "@/components/formation/FormationDetail";
import { MesApprenants } from "@/components/formation/MesApprenants";
import { ParcoursCertifications } from "@/components/formation/ParcoursCertifications";
import { ParcoursFormations } from "@/components/formation/ParcoursFormations";
import { ExpertsFormateurs } from "@/components/formation/ExpertsFormateurs";
import { EspaceCoursApprentissage } from "@/components/formation/EspaceCoursApprentissage";
import { EspaceFormateur } from "@/components/formation/EspaceFormateur";
import { GestionEmployesFormation } from "@/components/formation/GestionEmployesFormation";
import { EvaluationRAC } from "@/components/formation/EvaluationRAC";
import { InscriptionAlternance } from "@/components/formation/InscriptionAlternance";
import { MesCoursApprentissage } from "@/components/formation/MesCoursApprentissage";

type ViewMode = "list" | "detail" | "learning";

export default function Formation() {
  const { canAccess } = useSubscription();
  const canCreate = canAccess("formation.creator");

  const [activeTab, setActiveTab] = useState("apercu");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFormationId, setSelectedFormationId] = useState<string | null>(null);

  const handleViewDetail = (formationId: string) => {
    setSelectedFormationId(formationId);
    setViewMode("detail");
  };

  const handleStartLearning = (formationId: string) => {
    setSelectedFormationId(formationId);
    setViewMode("learning");
  };

  const handleBack = () => {
    setViewMode("list");
    setSelectedFormationId(null);
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  // Learning mode - full screen course player
  if (viewMode === "learning" && selectedFormationId) {
    return (
      <EspaceCoursApprentissage formationId={selectedFormationId} onBack={handleBack} />
    );
  }

  if (viewMode === "detail" && selectedFormationId) {
    return (
      <DashboardLayout>
        <FormationDetail formationId={selectedFormationId} onBack={handleBack} onStartLearning={handleStartLearning} />
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
            Développez les compétences qui font grandir vos activités
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full h-auto gap-1 p-1 flex flex-wrap justify-start">
            <TabsTrigger value="apercu" className="gap-1.5 text-xs sm:text-sm">
              <BookOpen className="w-3.5 h-3.5" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="catalogue" className="gap-1.5 text-xs sm:text-sm">
              <BookOpen className="w-3.5 h-3.5" />
              Catalogue
            </TabsTrigger>
            {/* <TabsTrigger value="experts" className="gap-1.5 text-xs sm:text-sm">
              <User className="w-3.5 h-3.5" />
              Experts
            </TabsTrigger> */}
            <TabsTrigger value="apprentissage" className="gap-1.5 text-xs sm:text-sm">
              <PlayCircle className="w-3.5 h-3.5" />
              Mes cours
            </TabsTrigger>
            {canCreate ? (
              <TabsTrigger value="formateur" className="gap-1.5 text-xs sm:text-sm">
                <Lock className="w-3.5 h-3.5" />
                Formateur
              </TabsTrigger>
            ) : (
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-muted-foreground/60 ring-offset-background transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                Formateur
                <Lock className="w-3 h-3" />
              </button>
            )}
            {/* <TabsTrigger value="parcours" className="gap-1.5 text-xs sm:text-sm">
              <Target className="w-3.5 h-3.5" />
              Parcours
            </TabsTrigger> */}
            
            
            
            <TabsTrigger value="rac" className="gap-1.5 text-xs sm:text-sm">
              <ClipboardCheck className="w-3.5 h-3.5" />
              RAC
            </TabsTrigger>
            {/* <TabsTrigger value="alternance" className="gap-1.5 text-xs sm:text-sm">
              <Building2 className="w-3.5 h-3.5" />
              Alternance
            </TabsTrigger> */}
            {/* <TabsTrigger value="paiements" className="gap-1.5 text-xs sm:text-sm">
              <CreditCard className="w-3.5 h-3.5" />
              Paiements
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="apercu">
            <FormationOverview onNavigate={handleNavigate} />
          </TabsContent>

          <TabsContent value="catalogue">
            <CatalogueFormations onViewDetail={handleViewDetail} />
          </TabsContent>

          <TabsContent value="parcours">
            <ParcoursFormations onViewDetail={handleViewDetail} />
          </TabsContent>

          {/* <TabsContent value="experts">
            <ExpertsFormateurs />
          </TabsContent> */}

          <TabsContent value="apprentissage">
            <MesCoursApprentissage onStartLearning={handleStartLearning} />
          </TabsContent>

          <TabsContent value="formateur">
            <Tabs defaultValue="espace" className="space-y-4">
              <TabsList className="gap-1 p-1">
                <TabsTrigger value="espace" className="gap-1.5 text-xs sm:text-sm">
                  <Lock className="w-3.5 h-3.5" />
                  Espace formateur
                </TabsTrigger>
                {/* <TabsTrigger value="certifications" className="gap-1.5 text-xs sm:text-sm">
                  <Award className="w-3.5 h-3.5" />
                  Certificats
                </TabsTrigger> */}
                <TabsTrigger value="apprenants" className="gap-1.5 text-xs sm:text-sm">
                  <Users className="w-3.5 h-3.5" />
                  Mes apprenants
                </TabsTrigger>
                {/*   */}
              </TabsList>
              <TabsContent value="espace">
                <EspaceFormateur />
              </TabsContent>
              <TabsContent value="certifications">
                <ParcoursCertifications />
              </TabsContent>
              <TabsContent value="apprenants">
                <MesApprenants />
              </TabsContent>
              <TabsContent value="equipe">
                <GestionEmployesFormation />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="rac">
            <EvaluationRAC />
          </TabsContent>

          <TabsContent value="alternance">
            <InscriptionAlternance />
          </TabsContent>
        </Tabs>
      </div>

      <UpgradeSubscriptionModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        featureLabel="création de formation"
      />
    </DashboardLayout>
  );
}
