import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  Ticket,
  QrCode,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Share2,
  FileText,
  CreditCard,
  User,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RegistrationStatus = 
  | "pending_payment" 
  | "confirmed" 
  | "checked_in" 
  | "attended" 
  | "cancelled";

interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  ticketPrice: number;
  quantity: number;
  status: RegistrationStatus;
  registeredAt: string;
  qrCode: string;
  invoiceNumber?: string;
}

const mockRegistrations: Registration[] = [
  {
    id: "reg-001",
    eventId: "evt-001",
    eventTitle: "Forum PME Côte d'Ivoire 2024",
    eventDate: "2024-03-15",
    eventLocation: "Palais de la Culture, Abidjan",
    ticketType: "VIP",
    ticketPrice: 75000,
    quantity: 2,
    status: "confirmed",
    registeredAt: "2024-01-20",
    qrCode: "QR-FORUM-VIP-001",
    invoiceNumber: "INV-2024-001",
  },
  {
    id: "reg-002",
    eventId: "evt-003",
    eventTitle: "Atelier Transformation Numérique PME",
    eventDate: "2024-02-28",
    eventLocation: "CPU-PME Hub, Plateau",
    ticketType: "Standard",
    ticketPrice: 0,
    quantity: 1,
    status: "confirmed",
    registeredAt: "2024-02-10",
    qrCode: "QR-ATELIER-001",
  },
  {
    id: "reg-003",
    eventId: "evt-002",
    eventTitle: "Salon de l'Agro-industrie",
    eventDate: "2024-04-20",
    eventLocation: "Parc des Expositions",
    ticketType: "Standard",
    ticketPrice: 15000,
    quantity: 1,
    status: "pending_payment",
    registeredAt: "2024-02-15",
    qrCode: "",
  },
];

const statusConfig: Record<RegistrationStatus, { 
  label: string; 
  color: string; 
  icon: typeof Clock;
}> = {
  pending_payment: { 
    label: "En attente de paiement", 
    color: "bg-amber-500/10 text-amber-600", 
    icon: Clock 
  },
  confirmed: { 
    label: "Confirmé", 
    color: "bg-secondary/10 text-secondary", 
    icon: CheckCircle2 
  },
  checked_in: { 
    label: "Enregistré", 
    color: "bg-blue-500/10 text-blue-600", 
    icon: CheckCircle2 
  },
  attended: { 
    label: "Participé", 
    color: "bg-primary/10 text-primary", 
    icon: CheckCircle2 
  },
  cancelled: { 
    label: "Annulé", 
    color: "bg-destructive/10 text-destructive", 
    icon: XCircle 
  },
};

export function MesInscriptions() {
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  const upcomingRegistrations = mockRegistrations.filter(r => 
    new Date(r.eventDate) >= new Date() && r.status !== "cancelled"
  );
  const pastRegistrations = mockRegistrations.filter(r => 
    new Date(r.eventDate) < new Date() || r.status === "cancelled"
  );

  const handleShowQR = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowQRDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Ticket className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockRegistrations.length}</p>
              <p className="text-sm text-muted-foreground">Total inscriptions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary/10">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingRegistrations.length}</p>
              <p className="text-sm text-muted-foreground">À venir</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockRegistrations.filter(r => r.status === "pending_payment").length}
              </p>
              <p className="text-sm text-muted-foreground">Paiement en attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {mockRegistrations.filter(r => r.status === "attended").length}
              </p>
              <p className="text-sm text-muted-foreground">Participés</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">À venir ({upcomingRegistrations.length})</TabsTrigger>
          <TabsTrigger value="past">Passés ({pastRegistrations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingRegistrations.map((registration) => {
            const status = statusConfig[registration.status];
            const StatusIcon = status.icon;
            
            return (
              <Card key={registration.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                        <Badge variant="outline">{registration.ticketType}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold">{registration.eventTitle}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(registration.eventDate).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {registration.eventLocation.split(",")[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {registration.quantity} participant{registration.quantity > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {registration.status === "pending_payment" ? (
                        <Button className="gap-2">
                          <CreditCard className="w-4 h-4" />
                          Payer {(registration.ticketPrice * registration.quantity).toLocaleString()} FCFA
                        </Button>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            className="gap-2"
                            onClick={() => handleShowQR(registration)}
                          >
                            <QrCode className="w-4 h-4" />
                            Pass
                          </Button>
                          {registration.invoiceNumber && (
                            <Button variant="outline" className="gap-2">
                              <Download className="w-4 h-4" />
                              Facture
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {upcomingRegistrations.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Aucune inscription à venir</p>
                <p className="text-sm text-muted-foreground">
                  Découvrez les événements disponibles
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastRegistrations.map((registration) => {
            const status = statusConfig[registration.status];
            const StatusIcon = status.icon;
            
            return (
              <Card key={registration.id} className="opacity-75">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{registration.eventTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(registration.eventDate).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {registration.invoiceNumber && (
                        <Button variant="outline" size="sm" className="gap-1">
                          <FileText className="w-4 h-4" />
                          Facture
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Laisser un avis
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Pass Événement</DialogTitle>
            <DialogDescription>
              {selectedRegistration?.eventTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="py-8">
            <div className="w-48 h-48 mx-auto bg-muted rounded-xl flex items-center justify-center border-4 border-primary/20">
              <QrCode className="w-32 h-32 text-primary" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Code: {selectedRegistration?.qrCode}
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-medium">{selectedRegistration?.ticketType}</p>
            <p className="text-sm text-muted-foreground">
              {selectedRegistration && new Date(selectedRegistration.eventDate).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 gap-2">
              <Share2 className="w-4 h-4" />
              Partager
            </Button>
            <Button className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Télécharger
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
