import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Search, Download, CheckCircle2, Clock, AlertCircle, XCircle, Calendar, FileText, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

type CertificateStatus = "eligible" | "issued" | "expired" | "revoked";

interface Certificate {
  id: string;
  formationTitle: string;
  employeeName: string;
  employeeEmail: string;
  status: CertificateStatus;
  issuedAt?: string;
  expiresAt?: string;
  score?: number;
  credentialId?: string;
}

const mockCertificates: Certificate[] = [
  { id: "1", formationTitle: "Gestion Financière PME", employeeName: "Jean Kouassi", employeeEmail: "j.kouassi@ent.ci", status: "issued", issuedAt: "2024-01-15", expiresAt: "2026-01-15", score: 85, credentialId: "CERT-2024-001" },
  { id: "2", formationTitle: "Marketing Digital", employeeName: "Marie Bamba", employeeEmail: "m.bamba@ent.ci", status: "issued", issuedAt: "2024-01-20", expiresAt: "2026-01-20", score: 92, credentialId: "CERT-2024-002" },
  { id: "3", formationTitle: "Transformation Digitale", employeeName: "Amadou Diallo", employeeEmail: "a.diallo@ent.ci", status: "eligible", score: 78 },
  { id: "4", formationTitle: "Comptabilité SYSCOHADA", employeeName: "Jean Kouassi", employeeEmail: "j.kouassi@ent.ci", status: "expired", issuedAt: "2022-06-15", expiresAt: "2024-06-15", credentialId: "CERT-2022-015" },
];

const statusConfig: Record<CertificateStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  eligible: { label: "Éligible", color: "bg-blue-500/10 text-blue-600", icon: Clock },
  issued: { label: "Délivré", color: "bg-secondary/10 text-secondary", icon: CheckCircle2 },
  expired: { label: "Expiré", color: "bg-amber-500/10 text-amber-600", icon: AlertCircle },
  revoked: { label: "Révoqué", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

export function ParcoursCertifications() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCertificates = mockCertificates.filter((c) =>
    c.formationTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const issuedCount = mockCertificates.filter(c => c.status === "issued").length;
  const eligibleCount = mockCertificates.filter(c => c.status === "eligible").length;
  const expiringCount = mockCertificates.filter(c => c.status === "expired").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10"><Award className="w-6 h-6 text-primary" /></div>
            <div><p className="text-2xl font-bold">{mockCertificates.length}</p><p className="text-sm text-muted-foreground">Total certificats</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary/10"><CheckCircle2 className="w-6 h-6 text-secondary" /></div>
            <div><p className="text-2xl font-bold">{issuedCount}</p><p className="text-sm text-muted-foreground">Délivrés</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10"><Clock className="w-6 h-6 text-blue-500" /></div>
            <div><p className="text-2xl font-bold">{eligibleCount}</p><p className="text-sm text-muted-foreground">Éligibles</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10"><AlertCircle className="w-6 h-6 text-amber-500" /></div>
            <div><p className="text-2xl font-bold">{expiringCount}</p><p className="text-sm text-muted-foreground">Expirés / À renouveler</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />Exporter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Formation</TableHead>
                <TableHead>Apprenant</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date délivrance</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((cert) => {
                const status = statusConfig[cert.status];
                const StatusIcon = status.icon;
                return (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">{cert.formationTitle}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cert.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{cert.employeeEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cert.score && <Badge variant="outline">{cert.score}%</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString("fr-FR") : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cert.expiresAt ? new Date(cert.expiresAt).toLocaleDateString("fr-FR") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {cert.status === "issued" && (
                          <Button variant="outline" size="sm" className="gap-1">
                            <Download className="w-4 h-4" />
                            PDF
                          </Button>
                        )}
                        {cert.status === "eligible" && (
                          <Button size="sm">Délivrer</Button>
                        )}
                        {cert.status === "expired" && (
                          <Button size="sm" variant="outline">Renouveler</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
