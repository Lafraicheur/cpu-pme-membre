import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  MapPin, 
  Calendar,
  FileText,
  Eye,
  MessageSquare,
  Download,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

interface AffiliationRequest {
  id: string;
  companyName: string;
  companyId: string;
  sector: string;
  region: string;
  city: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected" | "needs_info";
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  role: string;
  justification: string;
  documents: { name: string; type: string }[];
}

const mockRequests: AffiliationRequest[] = [
  {
    id: "REQ-001",
    companyName: "Agro-Business Côte d'Ivoire SARL",
    companyId: "ENT-12345",
    sector: "Agriculture & Agroalimentaire",
    region: "Abidjan",
    city: "Cocody",
    requestDate: "2024-01-15",
    status: "pending",
    contactName: "Kouamé Yao",
    contactEmail: "k.yao@agrobusiness-ci.com",
    contactPhone: "+225 07 08 09 10 11",
    role: "Membre actif",
    justification: "Souhaitons rejoindre la fédération pour bénéficier du réseau et des opportunités de marché.",
    documents: [
      { name: "Attestation d'adhésion.pdf", type: "attestation" },
      { name: "RCCM.pdf", type: "legal" }
    ]
  },
  {
    id: "REQ-002",
    companyName: "Tech Solutions Abidjan",
    companyId: "ENT-12346",
    sector: "Technologies & Digital",
    region: "Abidjan",
    city: "Plateau",
    requestDate: "2024-01-14",
    status: "pending",
    contactName: "Aminata Diallo",
    contactEmail: "a.diallo@techsolutions.ci",
    contactPhone: "+225 05 06 07 08 09",
    role: "Partenaire",
    justification: "Entreprise tech cherchant à s'intégrer dans l'écosystème local.",
    documents: [
      { name: "Lettre de motivation.pdf", type: "letter" }
    ]
  },
  {
    id: "REQ-003",
    companyName: "BTP Construction Plus",
    companyId: "ENT-12347",
    sector: "BTP & Construction",
    region: "Bouaké",
    city: "Bouaké",
    requestDate: "2024-01-10",
    status: "approved",
    contactName: "Jean-Pierre Koffi",
    contactEmail: "jp.koffi@btpplus.ci",
    contactPhone: "+225 01 02 03 04 05",
    role: "Membre actif",
    justification: "Entreprise de construction souhaitant intégrer le réseau régional.",
    documents: [
      { name: "Attestation.pdf", type: "attestation" },
      { name: "Agrément technique.pdf", type: "technical" }
    ]
  },
  {
    id: "REQ-004",
    companyName: "Import-Export Sahel",
    companyId: "ENT-12348",
    sector: "Commerce & Distribution",
    region: "San-Pédro",
    city: "San-Pédro",
    requestDate: "2024-01-08",
    status: "rejected",
    contactName: "Moussa Traoré",
    contactEmail: "m.traore@imexsahel.ci",
    contactPhone: "+225 02 03 04 05 06",
    role: "Membre",
    justification: "Développer notre réseau commercial dans la région.",
    documents: []
  },
  {
    id: "REQ-005",
    companyName: "Textile Mode Afrique",
    companyId: "ENT-12349",
    sector: "Textile & Mode",
    region: "Abidjan",
    city: "Yopougon",
    requestDate: "2024-01-12",
    status: "needs_info",
    contactName: "Fatou Bamba",
    contactEmail: "f.bamba@textilemode.ci",
    contactPhone: "+225 03 04 05 06 07",
    role: "Membre actif",
    justification: "Intégrer la coopérative pour accéder aux marchés internationaux.",
    documents: [
      { name: "Brochure entreprise.pdf", type: "brochure" }
    ]
  }
];

interface AdminAffiliationRequestsProps {
  onBack: () => void;
}

export function AdminAffiliationRequests({ onBack }: AdminAffiliationRequestsProps) {
  const [requests, setRequests] = useState<AffiliationRequest[]>(mockRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<AffiliationRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "request_info">("approve");
  const [actionReason, setActionReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const stats = {
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
    needsInfo: requests.filter(r => r.status === "needs_info").length,
    total: requests.length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approuvée</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Refusée</Badge>;
      case "needs_info":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><MessageSquare className="h-3 w-3 mr-1" />Compléments requis</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.region.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pending") return matchesSearch && req.status === "pending";
    if (activeTab === "approved") return matchesSearch && req.status === "approved";
    if (activeTab === "rejected") return matchesSearch && req.status === "rejected";
    if (activeTab === "needs_info") return matchesSearch && req.status === "needs_info";
    return matchesSearch;
  });

  const handleAction = (request: AffiliationRequest, type: "approve" | "reject" | "request_info") => {
    setSelectedRequest(request);
    setActionType(type);
    setActionReason("");
    setShowActionDialog(true);
  };

  const confirmAction = () => {
    if (!selectedRequest) return;

    if ((actionType === "reject" || actionType === "request_info") && !actionReason.trim()) {
      toast.error("Veuillez fournir un motif");
      return;
    }

    const newStatus = actionType === "approve" ? "approved" : actionType === "reject" ? "rejected" : "needs_info";
    
    setRequests(prev => prev.map(req => 
      req.id === selectedRequest.id ? { ...req, status: newStatus } : req
    ));

    const messages = {
      approve: `Affiliation de ${selectedRequest.companyName} approuvée`,
      reject: `Affiliation de ${selectedRequest.companyName} refusée`,
      request_info: `Demande de compléments envoyée à ${selectedRequest.companyName}`
    };

    toast.success(messages[actionType]);
    setShowActionDialog(false);
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestion des Affiliations</h1>
            <p className="text-muted-foreground">Gérez les demandes d'affiliation reçues de la part des entreprises</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approuvées</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Refusées</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compléments</p>
                <p className="text-2xl font-bold">{stats.needsInfo}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par entreprise, secteur, région..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader className="pb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Toutes ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">En attente ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approuvées ({stats.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Refusées ({stats.rejected})</TabsTrigger>
              <TabsTrigger value="needs_info">Compléments ({stats.needsInfo})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune demande trouvée</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{request.companyName}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {request.sector}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {request.region}, {request.city}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {request.documents.length} document(s)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                      {request.status === "pending" && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAction(request, "approve")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAction(request, "request_info")}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Compléments
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleAction(request, "reject")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Refuser
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
            <DialogDescription>
              Demande d'affiliation de {selectedRequest?.companyName}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Entreprise</Label>
                  <p className="font-medium">{selectedRequest.companyName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">ID Entreprise</Label>
                  <p className="font-medium">{selectedRequest.companyId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Secteur</Label>
                  <p className="font-medium">{selectedRequest.sector}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Localisation</Label>
                  <p className="font-medium">{selectedRequest.region}, {selectedRequest.city}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Contact</Label>
                  <p className="font-medium">{selectedRequest.contactName}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.contactEmail}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.contactPhone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rôle souhaité</Label>
                  <p className="font-medium">{selectedRequest.role}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Justification</Label>
                <p className="mt-1 p-3 bg-muted rounded-md">{selectedRequest.justification}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Documents joints ({selectedRequest.documents.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedRequest.documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun document fourni</p>
                  ) : (
                    selectedRequest.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm">{doc.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground">Statut actuel</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                {selectedRequest.status === "pending" && (
                  <div className="flex gap-2">
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setShowDetailDialog(false);
                        handleAction(selectedRequest, "approve");
                      }}
                    >
                      Approuver
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowDetailDialog(false);
                        handleAction(selectedRequest, "request_info");
                      }}
                    >
                      Demander compléments
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        setShowDetailDialog(false);
                        handleAction(selectedRequest, "reject");
                      }}
                    >
                      Refuser
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approuver l'affiliation"}
              {actionType === "reject" && "Refuser l'affiliation"}
              {actionType === "request_info" && "Demander des compléments"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && `Confirmez l'approbation de ${selectedRequest?.companyName}`}
              {actionType === "reject" && "Veuillez fournir un motif de refus (obligatoire)"}
              {actionType === "request_info" && "Précisez les informations complémentaires requises"}
            </DialogDescription>
          </DialogHeader>
          
          {(actionType === "reject" || actionType === "request_info") && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">
                  {actionType === "reject" ? "Motif du refus *" : "Informations demandées *"}
                </Label>
                <Textarea 
                  id="reason"
                  placeholder={actionType === "reject" 
                    ? "Expliquez la raison du refus..." 
                    : "Listez les documents ou informations nécessaires..."
                  }
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={confirmAction}
              className={actionType === "reject" ? "bg-red-600 hover:bg-red-700" : actionType === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
