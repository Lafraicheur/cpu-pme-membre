import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, BookOpen, Users, Award, CreditCard, Settings, Lock, ArrowUpCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { TIER_CONFIGS } from "@/lib/permissions";
import { FormationOverview } from "@/components/formation/FormationOverview";
import { CatalogueFormations } from "@/components/formation/CatalogueFormations";
import { FormationDetail } from "@/components/formation/FormationDetail";
import { MesApprenants } from "@/components/formation/MesApprenants";
import { ParcoursCertifications } from "@/components/formation/ParcoursCertifications";

type ViewMode = "list" | "detail";

export default function Formation() {
  const { canAccess } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const canCreate = canAccess('formation.creator');
  const currentTierName = user?.subscription ? TIER_CONFIGS[user.subscription.tier].name : "Basic";

  const [activeTab, setActiveTab] = useState("apercu");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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
            {canCreate ? (
              <TabsTrigger value="creer" className="gap-2">
                <Settings className="w-4 h-4" />
                Créer
              </TabsTrigger>
            ) : (
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-muted-foreground/60 ring-offset-background transition-all"
              >
                <Settings className="w-4 h-4" />
                Créer
                <Lock className="w-3 h-3" />
              </button>
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

        {/* Modal upgrade création */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader className="text-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7 text-amber-500" />
              </div>
              <DialogTitle>Création de formation verrouillée</DialogTitle>
              <DialogDescription className="pt-2">
                Pour créer et publier des formations, vous devez passer au plan <span className="font-semibold text-primary">Or</span> ou supérieur.
                <br />
                Vous êtes actuellement sur le plan <span className="font-semibold">{currentTierName}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-4">
              <Button
                className="w-full gap-2"
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate("/subscription-selector");
                }}
              >
                <ArrowUpCircle className="w-4 h-4" />
                Passer au plan Or
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowUpgradeModal(false)}
              >
                Plus tard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
