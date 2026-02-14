import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Ticket, Handshake, Store, Award } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { EvenementsOverview } from "@/components/evenements/EvenementsOverview";
import { DecouvrirEvenements } from "@/components/evenements/DecouvrirEvenements";
import { EventDetail } from "@/components/evenements/EventDetail";
import { MesInscriptions } from "@/components/evenements/MesInscriptions";
import { B2BMatchmaking } from "@/components/evenements/B2BMatchmaking";
import { ExposantModule } from "@/components/evenements/ExposantModule";
import { SponsorModule } from "@/components/evenements/SponsorModule";

type ViewMode = "list" | "detail";

export default function Evenements() {
  const { canAccess } = useSubscription();
  const canOrganize = canAccess('events.organization');

  const [activeTab, setActiveTab] = useState("apercu");
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
          <TabsList className="flex-wrap">
            <TabsTrigger value="apercu" className="gap-2"><Calendar className="w-4 h-4" />Aperçu</TabsTrigger>
            <TabsTrigger value="decouvrir" className="gap-2"><Calendar className="w-4 h-4" />Découvrir</TabsTrigger>
            <TabsTrigger value="inscriptions" className="gap-2"><Ticket className="w-4 h-4" />Mes inscriptions</TabsTrigger>
            <TabsTrigger value="billets" className="gap-2"><Ticket className="w-4 h-4" />Billets</TabsTrigger>
            <TabsTrigger value="b2b" className="gap-2"><Handshake className="w-4 h-4" />B2B Matchmaking</TabsTrigger>
            {canOrganize && (
              <>
                <TabsTrigger value="exposant" className="gap-2"><Store className="w-4 h-4" />Exposant</TabsTrigger>
                <TabsTrigger value="sponsor" className="gap-2"><Award className="w-4 h-4" />Sponsor</TabsTrigger>
              </>
            )}
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

          <TabsContent value="billets">
            <MesInscriptions />
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
      </div>
    </DashboardLayout>
  );
}
