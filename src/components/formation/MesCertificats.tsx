import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { certificatsApi, FormationCertificat } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, Calendar, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function MesCertificats() {
  const { data: certificats = [], isLoading, error } = useQuery({
    queryKey: ["mes-certificats"],
    queryFn: () => certificatsApi.getAll(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
        <AlertCircle className="w-8 h-8" />
        <p>Impossible de charger vos certificats.</p>
      </div>
    );
  }

  if (certificats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Award className="w-16 h-16 text-muted-foreground/30" />
        <h3 className="text-lg font-semibold text-foreground">Aucun certificat</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Complétez une formation pour obtenir votre premier certificat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {certificats.length} certificat{certificats.length > 1 ? "s" : ""} obtenu{certificats.length > 1 ? "s" : ""}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {certificats.map((cert) => (
          <CertificatCard key={cert.id} cert={cert} />
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "d MMM yyyy", { locale: fr });
  } catch {
    return dateStr;
  }
}

function CertificatCard({ cert }: { cert: FormationCertificat }) {
  const [downloading, setDownloading] = useState(false);

  const slug = cert.formation?.slug ?? null;

  const handleDownload = async () => {
    if (!slug) return;
    setDownloading(true);
    try {
      const data = await certificatsApi.generate(slug);
      if (data.verifyUrl) window.open(data.verifyUrl, "_blank");
    } catch (e) {
      console.error("Erreur génération certificat", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      {cert.formation?.image && (
        <div className="h-28 overflow-hidden">
          <img
            src={cert.formation.image}
            alt={cert.formation.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
            {cert.typeCertification?.nom ?? "Certificat"}
          </CardTitle>
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
        </div>
        {cert.formation?.title && (
          <p className="text-xs text-muted-foreground line-clamp-1">{cert.formation.title}</p>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1 pb-4">
        <code className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 block truncate">
          {cert.code}
        </code>

        <div className="flex flex-wrap gap-1.5">
          {cert.typeCertification?.niveau && (
            <Badge variant="secondary" className="text-xs">
              {cert.typeCertification.niveau}
            </Badge>
          )}
          {cert.formation?.category && (
            <Badge variant="outline" className="text-xs">
              {cert.formation.category}
            </Badge>
          )}
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          {cert.dateDelivrance && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              Délivré le {formatDate(cert.dateDelivrance)}
            </div>
          )}
          {cert.dateExpiration && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              Expire le {formatDate(cert.dateExpiration)}
            </div>
          )}
          {cert.tauxReussite && (
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 shrink-0" />
              Score : {cert.tauxReussite}%
            </div>
          )}
        </div>

        <div className="mt-auto pt-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5 text-xs"
            onClick={handleDownload}
            disabled={downloading || !slug}
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {downloading ? "Génération..." : "Télécharger"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
