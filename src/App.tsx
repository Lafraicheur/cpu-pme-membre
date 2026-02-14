import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import SubscriptionSelector from "./pages/SubscriptionSelector";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Abonnement from "./pages/Abonnement";
import MonEntreprise from "./pages/MonEntreprise";
import Marketplace from "./pages/Marketplace";
import AppelsOffres from "./pages/AppelsOffres";
import Annuaire from "./pages/Annuaire";
import Financement from "./pages/Financement";
import KYCConformite from "./pages/KYCConformite";
import Incubateur from "./pages/Incubateur";
import Evenements from "./pages/Evenements";
import Formation from "./pages/Formation";
import Affiliation from "./pages/Affiliation";
import DataHub from "./pages/DataHub";
import Support from "./pages/Support";
import Historique from "./pages/Historique";
import Parametres from "./pages/Parametres";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/subscription-selector" element={<SubscriptionSelector />} />
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              {/* <Route path="/abonnement" element={<Abonnement />} /> */}
              <Route path="/mon-entreprise" element={<MonEntreprise />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/appels-offres" element={<AppelsOffres />} />
              <Route path="/annuaire" element={<Annuaire />} />
              <Route path="/financement" element={<Financement />} />
              <Route path="/kyc" element={<KYCConformite />} />
              <Route path="/incubateur" element={<Incubateur />} />
              <Route path="/evenements" element={<Evenements />} />
              <Route path="/formation" element={<Formation />} />
              <Route path="/affiliation" element={<Affiliation />} />
              <Route path="/data-hub" element={<DataHub />} />
              <Route path="/support" element={<Support />} />
              <Route path="/historique" element={<Historique />} />
              <Route path="/parametres" element={<Parametres />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
