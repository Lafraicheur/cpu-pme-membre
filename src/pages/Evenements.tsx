import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Ticket, Store, Award, Lock, ArrowUpCircle, PlusCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { TIER_CONFIGS } from "@/lib/permissions";
import { EvenementsOverview } from "@/components/evenements/EvenementsOverview";
import { DecouvrirEvenements } from "@/components/evenements/DecouvrirEvenements";
import { EventDetail } from "@/components/evenements/EventDetail";
import { MesInscriptions } from "@/components/evenements/MesInscriptions";
import { AjouterEvenement } from "@/components/evenements/AjouterEvenement";
import { B2BMatchmaking } from "@/components/evenements/B2BMatchmaking";
import { ExposantModule } from "@/components/evenements/ExposantModule";
import { SponsorModule } from "@/components/evenements/SponsorModule";

type ViewMode = "list" | "detail";

export default function Evenements() {
  const { canAccess } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const canOrganize = canAccess('events.organization');
  const currentTierName = user?.subscription ? TIER_CONFIGS[user.subscription.tier].name : "Basic";

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
          <TabsList className="flex-wrap">
            <TabsTrigger value="apercu" className="gap-2"><Calendar className="w-4 h-4" />Aperçu</TabsTrigger>
            <TabsTrigger value="decouvrir" className="gap-2"><Calendar className="w-4 h-4" />Découvrir</TabsTrigger>
            <TabsTrigger value="inscriptions" className="gap-2"><Ticket className="w-4 h-4" />Mes inscriptions</TabsTrigger>
            {/* <TabsTrigger value="ajouter" className="gap-2"><PlusCircle className="w-4 h-4" />Ajouter un événement</TabsTrigger> */}
            {/* <TabsTrigger value="b2b" className="gap-2"><Handshake className="w-4 h-4" />B2B Matchmaking</TabsTrigger> */}
            {canOrganize ? (
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

          <TabsContent value="ajouter">
            {/* Page d'accueil de l'onglet */}
            <div className="flex flex-col items-center justify-center py-20 gap-8 text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
                  <PlusCircle className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow">
                  <Calendar className="w-4 h-4 text-yellow-900" />
                </div>
              </div>
              <div className="space-y-2 max-w-sm">
                <h2 className="text-2xl font-bold">Créer un événement</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Organisez des forums, conférences, webinaires ou rencontres B2B. Gérez les inscriptions, les billets et les intervenants en quelques étapes.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
                {["3 étapes guidées", "Billets & tarification", "Intervenants", "QR check-in"].map((f) => (
                  <span key={f} className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />{f}
                  </span>
                ))}
              </div>
              <Button size="lg" onClick={() => setShowCreateModal(true)} className="gap-2 px-10 rounded-xl shadow-md">
                <PlusCircle className="w-5 h-5" /> Créer un événement
              </Button>
            </div>

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

        {/* Modal upgrade organisation */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader className="text-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7 text-amber-500" />
              </div>
              <DialogTitle>Organisation d'événements verrouillée</DialogTitle>
              <DialogDescription className="pt-2">
                Pour accéder aux modules Exposant et Sponsor, vous devez passer au plan <span className="font-semibold text-primary">Or</span> ou supérieur.
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
