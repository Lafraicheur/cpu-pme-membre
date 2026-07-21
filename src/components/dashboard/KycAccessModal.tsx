import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useKycStatus } from "@/hooks/useKycStatus";

// N'affiche la modale qu'une fois par session (le layout se remonte à chaque changement de page).
const SESSION_FLAG = "cpu-kyc-overdue-modal-shown";

/** Modale KYC Niveau 1 : affichée quand le compte a dépassé le délai de 30 jours
 * sans dossier KYC validé (profil masqué de l'annuaire, services Marketplace suspendus côté back). */
export function KycAccessModal() {
  const { isOverdue } = useKycStatus();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isOverdue && !sessionStorage.getItem(SESSION_FLAG)) {
      setOpen(true);
    }
  }, [isOverdue]);

  const handleOpenChange = (next: boolean) => {
    if (!next) sessionStorage.setItem(SESSION_FLAG, "1");
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle>KYC non complété</DialogTitle>
          <DialogDescription>
            Votre compte n'a pas encore rempli les conditions du KYC. Merci de compléter votre KYC afin de réactiver vos services CPU-PME.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button
            onClick={() => {
              handleOpenChange(false);
              navigate("/kyc");
            }}
          >
            Compléter mon KYC
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
