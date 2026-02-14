import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Send,
  Paperclip,
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Eye,
  Phone,
  Video,
  MoreVertical,
  Receipt,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaiementMobileMoney } from "./PaiementMobileMoney";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "buyer" | "seller";
  content: string;
  timestamp: string;
  type: "message" | "proforma" | "deposit" | "document" | "system";
  attachment?: {
    name: string;
    type: string;
    url: string;
  };
  proforma?: {
    id: string;
    amount: number;
    depositPercent: number;
    depositAmount: number;
    validUntil: string;
    items: { description: string; qty: number; unitPrice: number }[];
    status: "pending" | "accepted" | "rejected" | "paid";
  };
}

interface Conversation {
  id: string;
  rfqId: string;
  rfqTitle: string;
  counterpartyId: string;
  counterpartyName: string;
  counterpartyAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "active" | "pending_proforma" | "pending_deposit" | "completed" | "cancelled";
}

const mockConversations: Conversation[] = [
  {
    id: "conv-001",
    rfqId: "RFQ-2024-A01",
    rfqTitle: "Cacao en poudre premium - 500kg",
    counterpartyId: "vendor-001",
    counterpartyName: "Coopérative Aboisso Cacao",
    lastMessage: "Voici la facture proforma pour votre commande",
    lastMessageTime: "10:45",
    unreadCount: 2,
    status: "pending_proforma",
  },
  {
    id: "conv-002",
    rfqId: "RFQ-2024-A02",
    rfqTitle: "Transport frigorifique - 5 trajets",
    counterpartyId: "vendor-002",
    counterpartyName: "Transports Ivoire Express",
    lastMessage: "Nous pouvons faire 10% de réduction sur le volume",
    lastMessageTime: "Hier",
    unreadCount: 0,
    status: "active",
  },
  {
    id: "conv-003",
    rfqId: "RFQ-2024-A03",
    rfqTitle: "Impression cartons personnalisés - 1000 pièces",
    counterpartyId: "vendor-003",
    counterpartyName: "Imprimerie Moderne CI",
    lastMessage: "Acompte reçu, production lancée",
    lastMessageTime: "Lun",
    unreadCount: 0,
    status: "pending_deposit",
  },
];

const mockMessages: Message[] = [
  {
    id: "msg-001",
    senderId: "vendor-001",
    senderName: "Coopérative Aboisso Cacao",
    senderRole: "seller",
    content: "Bonjour, merci pour votre demande. Nous pouvons fournir 500kg de cacao premium grade A.",
    timestamp: "2024-01-24 09:30",
    type: "message",
  },
  {
    id: "msg-002",
    senderId: "buyer-001",
    senderName: "Moi",
    senderRole: "buyer",
    content: "Excellent ! Pouvez-vous me confirmer le délai de livraison et les conditions de paiement ?",
    timestamp: "2024-01-24 09:45",
    type: "message",
  },
  {
    id: "msg-003",
    senderId: "vendor-001",
    senderName: "Coopérative Aboisso Cacao",
    senderRole: "seller",
    content: "Livraison sous 7 jours ouvrés. Nous demandons un acompte de 30% avant production.",
    timestamp: "2024-01-24 10:00",
    type: "message",
  },
  {
    id: "msg-004",
    senderId: "vendor-001",
    senderName: "Coopérative Aboisso Cacao",
    senderRole: "seller",
    content: "Voici la fiche technique de notre cacao premium",
    timestamp: "2024-01-24 10:05",
    type: "document",
    attachment: {
      name: "Fiche_technique_cacao_premium.pdf",
      type: "pdf",
      url: "#",
    },
  },
  {
    id: "msg-005",
    senderId: "vendor-001",
    senderName: "Coopérative Aboisso Cacao",
    senderRole: "seller",
    content: "",
    timestamp: "2024-01-24 10:45",
    type: "proforma",
    proforma: {
      id: "PRO-2024-001",
      amount: 1400000,
      depositPercent: 30,
      depositAmount: 420000,
      validUntil: "2024-02-08",
      items: [
        { description: "Cacao en poudre premium Grade A", qty: 500, unitPrice: 2800 },
      ],
      status: "pending",
    },
  },
];

const statusConfig = {
  active: { label: "En cours", color: "text-blue-500", bg: "bg-blue-500/10" },
  pending_proforma: { label: "Proforma en attente", color: "text-amber-500", bg: "bg-amber-500/10" },
  pending_deposit: { label: "Acompte en attente", color: "text-purple-500", bg: "bg-purple-500/10" },
  completed: { label: "Terminée", color: "text-green-500", bg: "bg-green-500/10" },
  cancelled: { label: "Annulée", color: "text-muted-foreground", bg: "bg-muted" },
};

export function RFQMessaging() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [showProformaDialog, setShowProformaDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedProforma, setSelectedProforma] = useState<Message["proforma"] | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "pending" | "completed">("all");
  const currentUserId = "buyer-001";

  const filteredConversations = mockConversations.filter(conv => {
    if (viewMode === "all") return true;
    if (viewMode === "pending") return ["active", "pending_proforma", "pending_deposit"].includes(conv.status);
    if (viewMode === "completed") return ["completed", "cancelled"].includes(conv.status);
    return true;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // Logique d'envoi du message
    setNewMessage("");
  };

  const handleProformaAction = (action: "accept" | "reject" | "pay") => {
    if (action === "pay" && selectedProforma) {
      setShowProformaDialog(false);
      setShowPaymentDialog(true);
      return;
    }
    // Logique d'acceptation/rejet de la proforma
    setShowProformaDialog(false);
    setSelectedProforma(null);
  };

  const handlePaymentSuccess = (transactionId: string) => {
    console.log("Paiement réussi:", transactionId);
    setShowPaymentDialog(false);
    setSelectedProforma(null);
    // Mettre à jour le statut de la conversation/proforma
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Liste des conversations */}
      <Card className="w-80 flex-shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Négociations RFQ</CardTitle>
            <Badge variant="secondary">{mockConversations.length}</Badge>
          </div>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1 text-xs">Toutes</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1 text-xs">En cours</TabsTrigger>
              <TabsTrigger value="completed" className="flex-1 text-xs">Terminées</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100%-8rem)]">
            {filteredConversations.map((conv) => {
              const status = statusConfig[conv.status];
              return (
                <div
                  key={conv.id}
                  className={cn(
                    "p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                    selectedConversation?.id === conv.id && "bg-muted"
                  )}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={conv.counterpartyAvatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {conv.counterpartyName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{conv.counterpartyName}</p>
                        <span className="text-xs text-muted-foreground">{conv.lastMessageTime}</span>
                      </div>
                      <p className="text-xs text-primary font-medium truncate">{conv.rfqId}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                      <Badge variant="outline" className={cn("text-[10px] mt-1", status.color)}>
                        {status.label}
                      </Badge>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Zone de conversation */}
      {selectedConversation ? (
        <Card className="flex-1 flex flex-col">
          {/* Header conversation */}
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedConversation.counterpartyName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedConversation.counterpartyName}</p>
                  <p className="text-sm text-muted-foreground">{selectedConversation.rfqTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {mockMessages.map((message) => {
                const isMe = message.senderRole === "buyer";
                
                if (message.type === "proforma") {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <Card className="w-full max-w-md border-2 border-primary/30 bg-primary/5">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Receipt className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Facture Proforma</span>
                            <Badge variant="outline" className="ml-auto">
                              {message.proforma?.id}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Montant total</span>
                              <span className="font-bold text-lg">{message.proforma?.amount.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="text-muted-foreground">Acompte requis ({message.proforma?.depositPercent}%)</span>
                              <span className="font-semibold text-primary">{message.proforma?.depositAmount.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Valide jusqu'au</span>
                              <span>{message.proforma?.validUntil}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                setSelectedProforma(message.proforma!);
                                setShowProformaDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Détails
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleProformaAction("reject")}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Refuser
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleProformaAction("accept")}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Accepter
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                }

                if (message.type === "document") {
                  return (
                    <div key={message.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-xs rounded-lg p-3",
                        isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {message.content && <p className="text-sm mb-2">{message.content}</p>}
                        <div className={cn(
                          "flex items-center gap-2 p-2 rounded",
                          isMe ? "bg-primary-foreground/10" : "bg-background"
                        )}>
                          <FileText className="w-8 h-8" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{message.attachment?.name}</p>
                            <p className="text-xs opacity-70">PDF Document</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className={cn("text-xs mt-1", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {message.timestamp.split(" ")[1]}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={message.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-xs rounded-lg p-3",
                      isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <p className="text-sm">{message.content}</p>
                      <p className={cn("text-xs mt-1", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {message.timestamp.split(" ")[1]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Receipt className="w-4 h-4" />
              </Button>
              <Input
                placeholder="Votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Sélectionnez une conversation</p>
          </div>
        </Card>
      )}

      {/* Dialog Détails Proforma */}
      <Dialog open={showProformaDialog} onOpenChange={setShowProformaDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Facture Proforma
            </DialogTitle>
            <DialogDescription>
              {selectedProforma?.id} • Valide jusqu'au {selectedProforma?.validUntil}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProforma && (
            <div className="space-y-4 py-4">
              <div className="border rounded-lg divide-y">
                <div className="p-3 bg-muted/50 font-medium text-sm grid grid-cols-4 gap-2">
                  <span className="col-span-2">Description</span>
                  <span className="text-center">Qté</span>
                  <span className="text-right">Prix</span>
                </div>
                {selectedProforma.items.map((item, idx) => (
                  <div key={idx} className="p-3 grid grid-cols-4 gap-2 text-sm">
                    <span className="col-span-2">{item.description}</span>
                    <span className="text-center">{item.qty}</span>
                    <span className="text-right">{item.unitPrice.toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{selectedProforma.amount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary">{selectedProforma.amount.toLocaleString()} FCFA</span>
                </div>
              </div>

              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-amber-500" />
                    <div className="flex-1">
                      <p className="font-medium">Acompte requis ({selectedProforma.depositPercent}%)</p>
                      <p className="text-2xl font-bold text-primary">{selectedProforma.depositAmount.toLocaleString()} FCFA</p>
                      <p className="text-sm text-muted-foreground">À payer avant le début de production</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowProformaDialog(false)}>
                  <Download className="w-4 h-4 mr-1" />
                  Télécharger PDF
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleProformaAction("reject")}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Refuser
                </Button>
                <Button onClick={() => handleProformaAction("pay")}>
                  <Smartphone className="w-4 h-4 mr-1" />
                  Payer l'acompte
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Paiement Mobile Money */}
      {selectedProforma && (
        <PaiementMobileMoney
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          amount={selectedProforma.amount}
          depositPercent={selectedProforma.depositPercent}
          reference={selectedProforma.id}
          description={`Acompte pour ${selectedConversation?.rfqTitle || "commande"}`}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
