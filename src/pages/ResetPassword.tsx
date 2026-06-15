import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Lock, Eye, EyeOff, ArrowRight, RefreshCw, CheckCircle2, XCircle, KeyRound,
} from "lucide-react";
import { authApi } from "@/lib/api";
import logo from "@/assets/logo-cpu-pme.png";
import { cn } from "@/lib/utils";

const PASSWORD_RULES = [
  { label: "8 caractères minimum", test: (p: string) => p.length >= 8 },
  { label: "Une lettre majuscule",  test: (p: string) => /[A-Z]/.test(p) },
  { label: "Un chiffre",            test: (p: string) => /[0-9]/.test(p) },
  { label: "Un caractère spécial",  test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordRules({ password }: { password: string }) {
  if (!password) return null;
  return (
    <ul className="space-y-1 mt-2">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li
            key={rule.label}
            className={cn("flex items-center gap-2 text-xs", ok ? "text-green-600" : "text-muted-foreground")}
          >
            {ok
              ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-600" />
              : <XCircle className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]               = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [done, setDone]                     = useState(false);

  const passwordValid = PASSWORD_RULES.every((r) => r.test(newPassword));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({ title: "Lien invalide", description: "Aucun token de réinitialisation trouvé dans l'URL.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    if (!passwordValid) {
      toast({ title: "Mot de passe trop faible", description: "Veuillez respecter toutes les règles.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      if (status === 400 || status === 404) {
        toast({
          title: "Lien expiré ou invalide",
          description: "Ce lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Une erreur est survenue.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5" />
        <div className="relative z-10 text-center space-y-6 text-white">
          <div className="w-20 h-20 mx-auto bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <img src={logo} alt="CPU-PME" className="w-12 h-12 object-contain" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">CPU-PME</h1>
            <p className="text-lg text-white/80 font-light">Plateforme des entreprises</p>
          </div>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-8">

          {/* Logo mobile */}
          <div className="lg:hidden text-center space-y-2">
            <img src={logo} alt="CPU-PME" className="w-16 h-16 mx-auto rounded-xl shadow-lg" />
            <h1 className="text-xl font-bold">CPU-PME</h1>
            <p className="text-sm text-muted-foreground">Plateforme des entreprises</p>
          </div>

          {!token ? (
            /* Token manquant */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold">Lien invalide</h2>
              <p className="text-muted-foreground text-sm">
                Ce lien de réinitialisation est invalide ou a expiré.
              </p>
              <Button className="w-full h-12" onClick={() => navigate("/auth")}>
                Retour à la connexion
              </Button>
            </div>

          ) : done ? (
            /* Succès */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Mot de passe réinitialisé !</h2>
              <p className="text-muted-foreground text-sm">
                Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <Button className="w-full h-12" onClick={() => navigate("/auth")}>
                Se connecter <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

          ) : (
            /* Formulaire */
            <div className="space-y-7">
              <div className="space-y-1">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Nouveau mot de passe</h2>
                <p className="text-muted-foreground text-sm">
                  Choisissez un nouveau mot de passe sécurisé pour votre compte.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nouveau mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">
                    Nouveau mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showNew ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      autoFocus
                      className="pl-10 pr-10 h-12 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordRules password={newPassword} />
                </div>

                {/* Confirmation */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className={cn(
                        "pl-10 pr-10 h-12 text-sm",
                        confirmPassword && (confirmPassword === newPassword
                          ? "border-green-500 focus-visible:ring-green-500/20"
                          : "border-destructive focus-visible:ring-destructive/20")
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 gap-2 font-semibold text-sm"
                  disabled={isLoading || !passwordValid || newPassword !== confirmPassword}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Enregistrement...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Réinitialiser mon mot de passe <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
