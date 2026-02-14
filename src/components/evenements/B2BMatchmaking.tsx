import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Handshake, Search, Building2, MapPin, Calendar, Clock, Check, X, MessageSquare, Send, User, Target, Edit } from "lucide-react";
import { toast } from "sonner";

const mockSuggestions = [
  { id: "1", company: "SIFCA Group", sector: "Agro-industrie", region: "LAGUNES", match: 92, needs: "Sourcing local" },
  { id: "2", company: "Nestlé CI", sector: "Agro-alimentaire", region: "LAGUNES", match: 87, needs: "Fournisseurs cacao" },
  { id: "3", company: "Orange CI", sector: "Télécom", region: "National", match: 78, needs: "Solutions digitales" },
];

const mockMeetings = [
  { id: "1", company: "SIFCA Group", contact: "Jean Konan", date: "2024-03-15", time: "10:00", status: "accepted", objective: "Partenariat distribution" },
  { id: "2", company: "Nestlé CI", contact: "Marie Bamba", date: "2024-03-15", time: "14:30", status: "requested", objective: "Sourcing local" },
];

export function B2BMatchmaking() {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  
  const handleRequest = (company: any) => {
    setSelectedCompany(company);
    setShowRequestDialog(true);
  };

  const sendRequest = () => {
    toast.success(`Demande envoyée à ${selectedCompany?.company}`);
    setShowRequestDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-full bg-blue-500/10"><Handshake className="w-6 h-6 text-blue-500" /></div><div><p className="text-2xl font-bold">5</p><p className="text-sm text-muted-foreground">RDV planifiés</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-full bg-secondary/10"><Check className="w-6 h-6 text-secondary" /></div><div><p className="text-2xl font-bold">3</p><p className="text-sm text-muted-foreground">Confirmés</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-full bg-amber-500/10"><Clock className="w-6 h-6 text-amber-500" /></div><div><p className="text-2xl font-bold">2</p><p className="text-sm text-muted-foreground">En attente</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="p-3 rounded-full bg-primary/10"><Target className="w-6 h-6 text-primary" /></div><div><p className="text-2xl font-bold">12</p><p className="text-sm text-muted-foreground">Leads générés</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="suggestions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="meetings">Mes RDV</TabsTrigger>
          <TabsTrigger value="profile">Mon profil B2B</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          {mockSuggestions.map(company => (
            <Card key={company.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-muted"><Building2 className="w-6 h-6" /></div>
                  <div>
                    <h3 className="font-semibold">{company.company}</h3>
                    <p className="text-sm text-muted-foreground">{company.sector} • {company.region}</p>
                    <p className="text-sm mt-1">Recherche: {company.needs}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-primary/10 text-primary">{company.match}% match</Badge>
                  <Button onClick={() => handleRequest(company)}>Demander RDV</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          {mockMeetings.map(meeting => (
            <Card key={meeting.id}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-500/10"><Handshake className="w-6 h-6 text-blue-500" /></div>
                  <div>
                    <h3 className="font-semibold">{meeting.company}</h3>
                    <p className="text-sm text-muted-foreground">{meeting.contact}</p>
                    <p className="text-sm">{meeting.objective}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="font-medium">{new Date(meeting.date).toLocaleDateString("fr-FR")}</p>
                    <p className="text-muted-foreground">{meeting.time}</p>
                  </div>
                  <Badge className={meeting.status === "accepted" ? "bg-secondary/10 text-secondary" : "bg-amber-500/10 text-amber-600"}>
                    {meeting.status === "accepted" ? "Confirmé" : "En attente"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Mon profil B2B</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Ce que je propose</Label><Textarea placeholder="Décrivez vos produits/services..." rows={3} /></div>
              <div className="space-y-2"><Label>Ce que je recherche</Label><Textarea placeholder="Décrivez vos besoins..." rows={3} /></div>
              <Button><Edit className="w-4 h-4 mr-2" />Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Demander un RDV avec {selectedCompany?.company}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Objectif</Label><Input placeholder="Ex: Partenariat distribution" /></div>
            <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Présentez-vous..." rows={3} /></div>
            <Button className="w-full" onClick={sendRequest}><Send className="w-4 h-4 mr-2" />Envoyer la demande</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
