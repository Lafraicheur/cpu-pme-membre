import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Mail, ArrowRight, ShieldCheck, RefreshCw, Clock, ArrowLeft,
  Lock, Eye, EyeOff, CheckCircle2, XCircle, KeyRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import logo from "@/assets/logo-cpu-pme.png";
import { cn } from "@/lib/utils";

type OtpStep = "email" | "otp";
const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 10 * 60;

// ── Sons ─────────────────────────────────────────────────────────────────────
function playSuccessSound() {
  const ctx = new AudioContext();
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.start(t);
    osc.stop(t + 0.35);
  });
}

function playErrorSound() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
}

// ── OTP input ────────────────────────────────────────────────────────────────
function OtpInput({ value, onChange, disabled }: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => refs.current[i]?.focus();

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = value.split("");
    next[i] = digit;
    onChange(next.join("").slice(0, OTP_LENGTH));
    if (digit && i < OTP_LENGTH - 1) focus(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (value[i]) { const n = value.split(""); n[i] = ""; onChange(n.join("")); }
      else if (i > 0) focus(i - 1);
    } else if (e.key === "ArrowLeft" && i > 0) focus(i - 1);
    else if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) focus(i + 1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(pasted);
    focus(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          autoFocus={i === 0}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          className={cn(
            "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-background/60 transition-all duration-150 outline-none shadow-sm",
            "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background",
            value[i] ? "border-primary text-primary bg-primary/5" : "border-border text-foreground",
            disabled && "opacity-40 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
}

// ── Countdown ────────────────────────────────────────────────────────────────
function useCountdown(seconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (!active) return;
    setRemaining(seconds);
    const id = setInterval(() => setRemaining((p) => {
      if (p <= 1) { clearInterval(id); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [active, seconds]);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return { remaining, formatted: `${mm}:${ss}` };
}

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, expired }: { pct: number; expired: boolean }) {
  return (
    <div className="w-full h-1 bg-border rounded-full overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-1000",
          expired ? "bg-destructive" : pct > 16 ? "bg-primary" : "bg-amber-500"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Règles de mot de passe ────────────────────────────────────────────────────
const PASSWORD_RULES = [
  { label: "8 caractères minimum", test: (p: string) => p.length >= 8 },
  { label: "Une lettre majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Un chiffre",           test: (p: string) => /[0-9]/.test(p) },
  { label: "Un caractère spécial", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordRules({ password }: { password: string }) {
  if (!password) return null;
  return (
    <ul className="space-y-1 mt-2">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.label} className={cn("flex items-center gap-2 text-xs", ok ? "text-green-600" : "text-muted-foreground")}>
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

// ── Panneau gauche (réutilisé) ────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex-col items-center justify-center p-12 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03]" />
      <div className="relative z-10 text-center space-y-6 text-white">
        <div className="w-20 h-20 mx-auto bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
          <img src={logo} alt="CPU-PME" className="w-12 h-12 object-contain" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">CPU-PME</h1>
          <p className="text-lg text-white/80 font-light">Plateforme des entreprises</p>
        </div>
        <div className="flex flex-col gap-4 mt-10 text-left">
          {[
            { icon: "", title: "Annuaire entreprises", desc: "Accédez à tout l'écosystème PME" },
            { icon: "", title: "Événements & Forums", desc: "Rejoignez les rencontres business" },
            { icon: "", title: "Marketplace", desc: "Achetez et vendez en B2B" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-white/70">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Auth() {
  const [searchParams] = useSearchParams();
  const adhesionId = searchParams.get("adhesionId");

  // ── État OTP
  const [otpStep, setOtpStep] = useState<OtpStep>("email");
  const [otpEmail, setOtpEmail] = useState("");
  const [code, setCode] = useState("");
  const [countdownActive, setCountdownActive] = useState(false);

  // ── État mot de passe (onglet login)
  const [pwdEmail, setPwdEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── État création de mot de passe (lien e-mail)
  const [setpwdEmail, setSetpwdEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [setpwdDone, setSetpwdDone] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const { sendOtp, login, loginWithPassword, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const returnUrl = searchParams.get("returnUrl");
  const isSafeReturnUrl = (url: string | null): url is string => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.hostname === "localhost" || parsed.hostname.endsWith(".cpupme.ci");
    } catch { return false; }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated) {
      if (isSafeReturnUrl(returnUrl)) window.location.href = returnUrl;
      else navigate("/", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading]);

  const { remaining, formatted } = useCountdown(OTP_EXPIRY_SECONDS, countdownActive);
  const isExpired = countdownActive && remaining === 0;
  const pct = Math.round((remaining / OTP_EXPIRY_SECONDS) * 100);

  const startCountdown = () => {
    setCountdownActive(false);
    setTimeout(() => setCountdownActive(true), 50);
  };

  const redirectAfterLogin = () => {
    if (isSafeReturnUrl(returnUrl)) window.location.href = returnUrl;
    else navigate("/");
  };

  const passwordValid = PASSWORD_RULES.every((r) => r.test(newPassword));

  // ── Création de mot de passe (première connexion via lien e-mail) ──────────
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await authApi.setPassword({ adhesionId: adhesionId!, email: setpwdEmail, password: newPassword });
      playSuccessSound();
      setSetpwdDone(true);
      // Auto-connexion
      try {
        await loginWithPassword(setpwdEmail, newPassword);
        toast({ title: "Mot de passe créé", description: "Bienvenue sur CPU-PME !" });
        redirectAfterLogin();
      } catch {
        // Si auto-login échoue, on laisse l'utilisateur se connecter manuellement
        toast({ title: "Mot de passe créé", description: "Vous pouvez maintenant vous connecter avec votre mot de passe." });
      }
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      playErrorSound();
      if (status === 404) {
        toast({
          title: "Lien invalide",
          description: "Ce lien d'activation est introuvable ou a expiré.",
          variant: "destructive",
        });
      } else if (status === 400) {
        toast({
          title: "Non éligible",
          description: "Un mot de passe a déjà été défini pour ce compte. Connectez-vous normalement.",
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

  // ── OTP : envoi ───────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendOtp(otpEmail);
      setCode("");
      setOtpStep("otp");
      startCountdown();
      toast({ title: "Code envoyé", description: `Code envoyé à ${otpEmail}.` });
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Impossible d'envoyer le code.", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  // ── OTP : vérification ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return;
    setIsLoading(true);
    try {
      await login(otpEmail, code);
      playSuccessSound();
      toast({ title: "Connexion réussie", description: "Bienvenue sur CPU-PME !" });
      redirectAfterLogin();
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      playErrorSound();
      toast({
        title: status === 401 ? "Code invalide" : "Erreur",
        description: status === 401 ? "Le code est incorrect ou expiré." : (err instanceof Error ? err.message : "Une erreur est survenue."),
        variant: "destructive",
      });
      if (status === 401) setCode("");
    } finally { setIsLoading(false); }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await sendOtp(otpEmail);
      setCode("");
      startCountdown();
      toast({ title: "Code renvoyé", description: `Nouveau code envoyé à ${otpEmail}.` });
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Impossible de renvoyer le code.", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  // ── Connexion par mot de passe ─────────────────────────────────────────────
  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginWithPassword(pwdEmail, password);
      playSuccessSound();
      toast({ title: "Connexion réussie", description: "Bienvenue sur CPU-PME !" });
      redirectAfterLogin();
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      playErrorSound();
      if (status === 400) {
        toast({ title: "Compte non sécurisé", description: "Aucun mot de passe n'est défini pour ce compte. Veuillez contacter l'administrateur.", variant: "destructive" });
      } else if (status === 401) {
        toast({ title: "Identifiants incorrects", description: "E-mail ou mot de passe incorrect.", variant: "destructive" });
        setPassword("");
      } else {
        toast({ title: "Erreur", description: err instanceof Error ? err.message : "Une erreur est survenue.", variant: "destructive" });
      }
    } finally { setIsLoading(false); }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">
      <LeftPanel />

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-8">

          {/* Logo mobile */}
          <div className="lg:hidden text-center space-y-2">
            <img src={logo} alt="CPU-PME" className="w-16 h-16 mx-auto rounded-xl shadow-lg" />
            <h1 className="text-xl font-bold">CPU-PME</h1>
            <p className="text-sm text-muted-foreground">Plateforme des entreprises</p>
          </div>

          {/* ══ CAS 1 : lien e-mail avec adhesionId → création de mot de passe ══ */}
          {adhesionId ? (
            <div className="space-y-7">
              {setpwdDone ? (
                /* Succès (si auto-login a échoué, on affiche cette confirmation) */
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Mot de passe créé !</h2>
                  <p className="text-muted-foreground text-sm">
                    Votre compte est maintenant sécurisé. Vous pouvez vous connecter.
                  </p>
                  <Button className="w-full h-12" onClick={() => navigate("/auth")}>
                    Se connecter
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <KeyRound className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Créez votre mot de passe</h2>
                    <p className="text-muted-foreground text-sm">
                      Première connexion — sécurisez votre compte adhérent
                    </p>
                  </div>

                  <form onSubmit={handleSetPassword} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="setpwd-email" className="text-sm font-medium">
                        E-mail d'adhésion
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="setpwd-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={setpwdEmail}
                          onChange={(e) => setSetpwdEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className="pl-10 h-12 text-sm"
                        />
                      </div>
                    </div>

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
                      disabled={isLoading || !passwordValid || !setpwdEmail || newPassword !== confirmPassword}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" /> Enregistrement...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Créer mon mot de passe <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>

          /* ══ CAS 2 : vérification OTP (plein écran, sans tabs) ══ */
          ) : otpStep === "otp" ? (
            <div className="space-y-7">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Vérification</h2>
                <p className="text-muted-foreground text-sm">
                  Code envoyé à{" "}
                  <span className="font-semibold text-foreground">{otpEmail}</span>
                </p>
              </div>

              <ProgressBar pct={pct} expired={isExpired} />

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                      isExpired ? "bg-destructive/10" : "bg-primary/10"
                    )}>
                      <ShieldCheck className={cn("w-7 h-7", isExpired ? "text-destructive" : "text-primary")} />
                    </div>
                  </div>
                  <OtpInput value={code} onChange={setCode} disabled={isLoading || isExpired} />
                </div>

                <div className={cn(
                  "flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-lg",
                  isExpired ? "bg-destructive/10 text-destructive"
                    : remaining <= 60 ? "bg-amber-500/10 text-amber-600"
                    : "bg-muted text-muted-foreground"
                )}>
                  <Clock className="w-4 h-4 shrink-0" />
                  {isExpired ? (
                    <span>Code expiré — veuillez en demander un nouveau</span>
                  ) : (
                    <span>Expire dans <span className="tabular-nums font-bold text-base">{formatted}</span></span>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 gap-2 font-semibold"
                  disabled={isLoading || code.length < OTP_LENGTH || isExpired}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Vérification...</span>
                  ) : (
                    <span className="flex items-center gap-2">Se connecter <ArrowRight className="w-4 h-4" /></span>
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => { setOtpStep("email"); setCode(""); setCountdownActive(false); }}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Changer d'e-mail
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Renvoyer le code
                  </button>
                </div>
              </form>

              <p className="text-xs text-center text-muted-foreground">
                Vérifiez vos spams si vous ne recevez pas le code
              </p>
            </div>

          /* ══ CAS 3 : formulaire de connexion avec tabs ══ */
          ) : (
            <div className="space-y-7">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Bon retour 👋</h2>
                <p className="text-muted-foreground text-sm">
                  Connectez-vous avec votre e-mail d'adhésion
                </p>
              </div>

              <Tabs defaultValue="otp" className="w-full">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="otp" className="flex-1 gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Code OTP
                  </TabsTrigger>
                  <TabsTrigger value="password" className="flex-1 gap-2">
                    <Lock className="w-4 h-4" />
                    Mot de passe
                  </TabsTrigger>
                </TabsList>

                {/* Onglet OTP */}
                <TabsContent value="otp" className="space-y-5 mt-0">
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="otp-email" className="text-sm font-medium">E-mail d'adhésion</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="otp-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className="pl-10 h-12 text-sm"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 gap-2 font-semibold text-sm" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Envoi en cours...</span>
                      ) : (
                        <span className="flex items-center gap-2">Recevoir mon code <ArrowRight className="w-4 h-4" /></span>
                      )}
                    </Button>
                  </form>
                  <p className="text-xs text-center text-muted-foreground">
                    Un code à usage unique sera envoyé à votre adresse e-mail
                  </p>
                </TabsContent>

                {/* Onglet Mot de passe */}
                <TabsContent value="password" className="space-y-5 mt-0">
                  <form onSubmit={handleLoginWithPassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="pwd-email" className="text-sm font-medium">E-mail d'adhésion</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="pwd-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={pwdEmail}
                          onChange={(e) => setPwdEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className="pl-10 h-12 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          className="pl-10 pr-10 h-12 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 gap-2 font-semibold text-sm"
                      disabled={isLoading || !pwdEmail || !password}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Connexion...</span>
                      ) : (
                        <span className="flex items-center gap-2">Se connecter <ArrowRight className="w-4 h-4" /></span>
                      )}
                    </Button>
                  </form>
                  <p className="text-xs text-center text-muted-foreground">
                    Réservé aux comptes sécurisés
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
