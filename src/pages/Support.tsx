import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  HeadphonesIcon, 
  MessageSquare, 
  FileText, 
  Phone, 
  Mail, 
  ExternalLink,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Book,
  Video,
  Send
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

const faqItems = [
  {
    category: "Compte & Abonnement",
    questions: [
      { q: "Comment modifier mon abonnement ?", a: "Rendez-vous dans Abonnement > Gérer mon plan pour voir les options disponibles et modifier votre formule." },
      { q: "Comment ajouter un utilisateur à mon compte ?", a: "Allez dans Mon Entreprise > Équipe pour inviter de nouveaux membres avec les rôles appropriés." },
      { q: "Que se passe-t-il si je dépasse mes limites ?", a: "Vous recevrez une notification et pourrez passer au plan supérieur ou attendre le renouvellement mensuel." },
    ]
  },
  {
    category: "Marketplace",
    questions: [
      { q: "Comment publier un produit ?", a: "Accédez à Marketplace > Ma Boutique > Ajouter un produit et suivez l'assistant de création." },
      { q: "Comment gérer mes commandes ?", a: "Les commandes se gèrent depuis Marketplace > Commandes vendeur avec toutes les actions disponibles." },
      { q: "Comment activer le label Made in CI ?", a: "Demandez l'activation via Marketplace > Ma Boutique > Labels et fournissez les justificatifs requis." },
    ]
  },
  {
    category: "Appels d'offres",
    questions: [
      { q: "Comment soumissionner à un AO ?", a: "Depuis la fiche AO, cliquez sur 'Soumissionner' et complétez le formulaire avec vos documents." },
      { q: "Comment suivre mes soumissions ?", a: "Consultez Appels d'offres > Mes Soumissions pour voir l'état de chaque candidature." },
    ]
  },
  {
    category: "KYC & Conformité",
    questions: [
      { q: "Quels documents sont requis pour le KYC ?", a: "Le registre de commerce, les documents fiscaux récents et les attestations sociales sont obligatoires." },
      { q: "Combien de temps prend la vérification ?", a: "La vérification prend généralement 24-48h ouvrées après soumission complète." },
    ]
  },
];

const tickets = [
  { id: "TK-2024-089", subject: "Problème de paiement commande", status: "open", date: "22 déc. 2024", priority: "high" },
  { id: "TK-2024-085", subject: "Question facturation", status: "pending", date: "20 déc. 2024", priority: "medium" },
  { id: "TK-2024-078", subject: "Accès formation bloqué", status: "resolved", date: "15 déc. 2024", priority: "low" },
];

const statusConfig = {
  open: { label: "Ouvert", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" },
  resolved: { label: "Résolu", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
};

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("faq");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketCategory, setTicketCategory] = useState("");

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Ticket créé avec succès", {
      description: "Notre équipe vous répondra sous 24-48h.",
    });
    setTicketSubject("");
    setTicketMessage("");
    setTicketCategory("");
  };

  const filteredFaq = faqItems.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <>
      <Helmet>
        <title>Support - CPU-PME</title>
        <meta name="description" content="Centre d'aide et support CPU-PME. FAQ, tickets et ressources." />
      </Helmet>
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Support</h1>
              <p className="text-muted-foreground">
                Comment pouvons-nous vous aider ?
              </p>
            </div>
          </div>

          {/* Quick Contact */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-sm text-muted-foreground">+225 27 22 XX XX XX</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">support@cpu-pme.ci</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Chat en direct</p>
                    <p className="text-sm text-muted-foreground">Lun-Ven 8h-18h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="faq" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="tickets" className="gap-2">
                <FileText className="h-4 w-4" />
                Mes tickets
              </TabsTrigger>
              <TabsTrigger value="new-ticket" className="gap-2">
                <Send className="h-4 w-4" />
                Nouveau ticket
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-2">
                <Book className="h-4 w-4" />
                Ressources
              </TabsTrigger>
            </TabsList>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="mt-6 space-y-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans la FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {filteredFaq.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      {category.questions.map((item, qIndex) => (
                        <AccordionItem key={qIndex} value={`${index}-${qIndex}`}>
                          <AccordionTrigger className="text-left">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent>
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mes tickets de support</CardTitle>
                  <CardDescription>Historique de vos demandes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            {ticket.status === "open" && <AlertCircle className="h-5 w-5 text-blue-500" />}
                            {ticket.status === "pending" && <Clock className="h-5 w-5 text-yellow-500" />}
                            {ticket.status === "resolved" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{ticket.subject}</p>
                              <Badge variant="outline" className="text-xs">{ticket.id}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{ticket.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={statusConfig[ticket.status as keyof typeof statusConfig].color}>
                            {statusConfig[ticket.status as keyof typeof statusConfig].label}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* New Ticket Tab */}
            <TabsContent value="new-ticket" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Créer un ticket</CardTitle>
                  <CardDescription>Décrivez votre problème et notre équipe vous répondra sous 24-48h</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Select value={ticketCategory} onValueChange={setTicketCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="account">Compte & Abonnement</SelectItem>
                          <SelectItem value="marketplace">Marketplace</SelectItem>
                          <SelectItem value="ao">Appels d'offres</SelectItem>
                          <SelectItem value="formation">Formation</SelectItem>
                          <SelectItem value="financement">Financement</SelectItem>
                          <SelectItem value="kyc">KYC & Conformité</SelectItem>
                          <SelectItem value="technical">Problème technique</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sujet</Label>
                      <Input
                        placeholder="Résumez votre demande"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        placeholder="Décrivez votre problème en détail..."
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        rows={6}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer le ticket
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                      <Book className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Guide utilisateur</CardTitle>
                    <CardDescription>Documentation complète de la plateforme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Consulter
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Tutoriels vidéo</CardTitle>
                    <CardDescription>Apprenez à utiliser chaque fonctionnalité</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Voir les vidéos
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Conditions générales</CardTitle>
                    <CardDescription>CGU, CGV et politique de confidentialité</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Lire
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                      <HeadphonesIcon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Webinaires</CardTitle>
                    <CardDescription>Sessions de formation en ligne</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      S'inscrire
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
}
