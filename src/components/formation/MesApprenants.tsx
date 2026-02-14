import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Users, Search, Plus, Mail, Upload, BookOpen, Award, Clock, CheckCircle2, XCircle, MoreVertical } from "lucide-react";
import { toast } from "sonner";

interface Learner {
  id: string;
  name: string;
  email: string;
  department: string;
  status: "invited" | "active";
  enrolledCourses: number;
  completedCourses: number;
  certificates: number;
  lastActivity: string;
}

const mockLearners: Learner[] = [
  { id: "1", name: "Jean Kouassi", email: "j.kouassi@entreprise.ci", department: "Commercial", status: "active", enrolledCourses: 3, completedCourses: 2, certificates: 1, lastActivity: "2024-02-15" },
  { id: "2", name: "Marie Bamba", email: "m.bamba@entreprise.ci", department: "Marketing", status: "active", enrolledCourses: 2, completedCourses: 2, certificates: 2, lastActivity: "2024-02-14" },
  { id: "3", name: "Amadou Diallo", email: "a.diallo@entreprise.ci", department: "Finance", status: "active", enrolledCourses: 4, completedCourses: 1, certificates: 0, lastActivity: "2024-02-10" },
  { id: "4", name: "Fatou Koné", email: "f.kone@entreprise.ci", department: "RH", status: "invited", enrolledCourses: 0, completedCourses: 0, certificates: 0, lastActivity: "-" },
];

export function MesApprenants() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);

  const filteredLearners = mockLearners.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = () => {
    toast.success("Invitation envoyée !");
    setShowInviteDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10"><Users className="w-6 h-6 text-primary" /></div>
            <div><p className="text-2xl font-bold">{mockLearners.length}</p><p className="text-sm text-muted-foreground">Apprenants</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary/10"><CheckCircle2 className="w-6 h-6 text-secondary" /></div>
            <div><p className="text-2xl font-bold">{mockLearners.filter(l => l.status === "active").length}</p><p className="text-sm text-muted-foreground">Actifs</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10"><Award className="w-6 h-6 text-amber-500" /></div>
            <div><p className="text-2xl font-bold">{mockLearners.reduce((acc, l) => acc + l.certificates, 0)}</p><p className="text-sm text-muted-foreground">Certificats</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10"><BookOpen className="w-6 h-6 text-blue-500" /></div>
            <div><p className="text-2xl font-bold">{mockLearners.reduce((acc, l) => acc + l.enrolledCourses, 0)}</p><p className="text-sm text-muted-foreground">Inscriptions</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher un apprenant..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button variant="outline" className="gap-2"><Upload className="w-4 h-4" />Importer CSV</Button>
            <Button onClick={() => setShowInviteDialog(true)} className="gap-2"><Plus className="w-4 h-4" />Inviter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apprenant</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Formations</TableHead>
                <TableHead>Certificats</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLearners.map((learner) => (
                <TableRow key={learner.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{learner.name}</p>
                      <p className="text-sm text-muted-foreground">{learner.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{learner.department}</TableCell>
                  <TableCell>
                    <Badge className={learner.status === "active" ? "bg-secondary/10 text-secondary" : "bg-amber-500/10 text-amber-600"}>
                      {learner.status === "active" ? "Actif" : "Invité"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{learner.completedCourses}/{learner.enrolledCourses}</span>
                      {learner.enrolledCourses > 0 && (
                        <Progress value={(learner.completedCourses / learner.enrolledCourses) * 100} className="h-2 w-16" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline"><Award className="w-3 h-3 mr-1" />{learner.certificates}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {learner.lastActivity !== "-" ? new Date(learner.lastActivity).toLocaleDateString("fr-FR") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setShowEnrollDialog(true)}>Inscrire</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un apprenant</DialogTitle>
            <DialogDescription>Envoyez une invitation par email</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nom complet</Label><Input placeholder="Jean Dupont" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="jean@entreprise.ci" /></div>
            <div className="space-y-2">
              <Label>Département</Label>
              <Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="rh">RH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full gap-2" onClick={handleInvite}><Mail className="w-4 h-4" />Envoyer l'invitation</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enroll Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscrire à une formation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Formation</Label>
              <Select><SelectTrigger><SelectValue placeholder="Choisir une formation" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Transformation Digitale PME</SelectItem>
                  <SelectItem value="2">Comptabilité SYSCOHADA</SelectItem>
                  <SelectItem value="3">Marketing Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => { toast.success("Inscription effectuée !"); setShowEnrollDialog(false); }}>
              Confirmer l'inscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
