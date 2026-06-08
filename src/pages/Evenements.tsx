import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Ticket, Lock, CalendarDays } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeSubscriptionModal } from "@/components/subscription/UpgradeSubscriptionModal";
import { EvenementsOverview } from "@/components/evenements/EvenementsOverview";
import { DecouvrirEvenements } from "@/components/evenements/DecouvrirEvenements";
import { EventDetail } from "@/components/evenements/EventDetail";
import { MesInscriptions } from "@/components/evenements/MesInscriptions";
import { AjouterEvenement } from "@/components/evenements/AjouterEvenement";
import { MesEvenements } from "@/components/evenements/MesEvenements";
import { B2BMatchmaking } from "@/components/evenements/B2BMatchmaking";
import { ExposantModule } from "@/components/evenements/ExposantModule";
import { SponsorModule } from "@/components/evenements/SponsorModule";


type ViewMode = "list" | "detail";

export default function Evenements() {
  const { canAccess } = useSubscription();
  const canOrganize = canAccess('events.organization');

  const [activeTab, setActiveTab] = useState("apercu");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleViewDetail = (eventId: string) => {
    setSelectedEventId(eventId);
    setViewMode("detail");
  };

  const handleBack = () => {
    setViewMode("list");
    setSelectedEventId(null);
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  if (viewMode === "detail" && selectedEventId) {
    return (
      <DashboardLayout>
        <EventDetail eventId={selectedEventId} onBack={handleBack} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Réseautage & Événements
          </h1>
          <p className="text-muted-foreground mt-1">
            Découvrez les événements, inscrivez-vous et développez votre réseau B2B
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:inline-flex h-auto sm:h-10 w-full sm:w-auto">
            <TabsTrigger value="apercu" className="gap-1.5 text-xs sm:text-sm sm:gap-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />Aperçu
            </TabsTrigger>
            <TabsTrigger value="decouvrir" className="gap-1.5 text-xs sm:text-sm sm:gap-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />Découvrir
            </TabsTrigger>
            <TabsTrigger value="inscriptions" className="gap-1.5 text-xs sm:text-sm sm:gap-2">
              <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />Mes inscriptions
            </TabsTrigger>
            {canOrganize ? (
              <TabsTrigger value="mes-evenements" className="gap-1.5 text-xs sm:text-sm sm:gap-2">
                <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />Mes événements
              </TabsTrigger>
            ) : (
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground/60 ring-offset-background transition-all"
              >
                <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                Mes événements
                <Lock className="w-3 h-3" />
              </button>
            )}
            {/* <TabsTrigger value="b2b" className="gap-2"><Handshake className="w-4 h-4" />B2B Matchmaking</TabsTrigger> */}
            {/* {canOrganize ? (
              <>
                <TabsTrigger value="exposant" className="gap-2"><Store className="w-4 h-4" />Exposant</TabsTrigger>
                <TabsTrigger value="sponsor" className="gap-2"><Award className="w-4 h-4" />Sponsor</TabsTrigger>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-muted-foreground/60 ring-offset-background transition-all"
                >
                  <Store className="w-4 h-4" />
                  Exposant
                  <Lock className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium text-muted-foreground/60 ring-offset-background transition-all"
                >
                  <Award className="w-4 h-4" />
                  Sponsor
                  <Lock className="w-3 h-3" />
                </button>
              </>
            )} */}
          </TabsList>

          <TabsContent value="apercu">
            <EvenementsOverview onNavigate={handleNavigate} />
          </TabsContent>

          <TabsContent value="decouvrir">
            <DecouvrirEvenements onViewDetail={handleViewDetail} />
          </TabsContent>

          <TabsContent value="inscriptions">
            <MesInscriptions />
          </TabsContent>

          <TabsContent value="mes-evenements">
            <MesEvenements onCreateEvent={() => setShowCreateModal(true)} />
            <AjouterEvenement open={showCreateModal} onOpenChange={setShowCreateModal} />
          </TabsContent>

          <TabsContent value="b2b">
            <B2BMatchmaking />
          </TabsContent>

          <TabsContent value="exposant">
            <ExposantModule />
          </TabsContent>

          <TabsContent value="sponsor">
            <SponsorModule />
          </TabsContent>
        </Tabs>

        <UpgradeSubscriptionModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
          featureLabel="organisation d'événements"
        />
      </div>
    </DashboardLayout>
  );
}
