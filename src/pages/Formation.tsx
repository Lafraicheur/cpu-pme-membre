import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Award, CreditCard, Target, User, Lock, Building2, PlayCircle, ClipboardCheck } from "lucide-react";
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

type ViewMode = "list" | "detail" | "learning";

export default function Formation() {
  const [activeTab, setActiveTab] = useState("apercu");
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
          <TabsList className="w-full h-auto gap-1 p-1 flex flex-wrap">
            <TabsTrigger value="apercu" className="gap-1.5 text-xs sm:text-sm">
              <BookOpen className="w-3.5 h-3.5" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="catalogue" className="gap-1.5 text-xs sm:text-sm">
              <BookOpen className="w-3.5 h-3.5" />
              Catalogue
            </TabsTrigger>
            <TabsTrigger value="parcours" className="gap-1.5 text-xs sm:text-sm">
              <Target className="w-3.5 h-3.5" />
              Parcours
            </TabsTrigger>
            <TabsTrigger value="experts" className="gap-1.5 text-xs sm:text-sm">
              <User className="w-3.5 h-3.5" />
              Experts
            </TabsTrigger>
            <TabsTrigger value="apprentissage" className="gap-1.5 text-xs sm:text-sm">
              <PlayCircle className="w-3.5 h-3.5" />
              Mes cours
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-1.5 text-xs sm:text-sm">
              <Award className="w-3.5 h-3.5" />
              Certificats
            </TabsTrigger>
            <TabsTrigger value="apprenants" className="gap-1.5 text-xs sm:text-sm">
              <Users className="w-3.5 h-3.5" />
              Mes apprenants
            </TabsTrigger>
            <TabsTrigger value="equipe" className="gap-1.5 text-xs sm:text-sm">
              <Building2 className="w-3.5 h-3.5" />
              Mon équipe
            </TabsTrigger>
            <TabsTrigger value="formateur" className="gap-1.5 text-xs sm:text-sm">
              <Lock className="w-3.5 h-3.5" />
              Formateur
            </TabsTrigger>
            <TabsTrigger value="rac" className="gap-1.5 text-xs sm:text-sm">
              <ClipboardCheck className="w-3.5 h-3.5" />
              RAC
            </TabsTrigger>
            <TabsTrigger value="alternance" className="gap-1.5 text-xs sm:text-sm">
              <Building2 className="w-3.5 h-3.5" />
              Alternance
            </TabsTrigger>
            <TabsTrigger value="paiements" className="gap-1.5 text-xs sm:text-sm">
              <CreditCard className="w-3.5 h-3.5" />
              Paiements
            </TabsTrigger>
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

          <TabsContent value="experts">
            <ExpertsFormateurs />
          </TabsContent>

          <TabsContent value="apprentissage">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Mes cours en cours</h2>
                  <p className="text-muted-foreground">Continuez votre apprentissage</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "1", title: "Maîtriser les Appels d'Offres", progress: 65, expert: "Expert Konan" },
                  { id: "2", title: "Négociation bancaire", progress: 30, expert: "Dr. Koffi" },
                  { id: "3", title: "Vente & Marketplace", progress: 85, expert: "Mme Traoré" },
                ].map((course) => (
                  <div key={course.id} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">{course.expert}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleStartLearning(course.id)}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Continuer
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="apprenants">
            <MesApprenants />
          </TabsContent>

          <TabsContent value="equipe">
            <GestionEmployesFormation />
          </TabsContent>

          <TabsContent value="certifications">
            <ParcoursCertifications />
          </TabsContent>

          <TabsContent value="formateur">
            <EspaceFormateur />
          </TabsContent>

          <TabsContent value="rac">
            <EvaluationRAC />
          </TabsContent>

          <TabsContent value="alternance">
            <InscriptionAlternance />
          </TabsContent>

          <TabsContent value="paiements">
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Historique des paiements et factures</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
