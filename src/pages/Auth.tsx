import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowRight, ShieldCheck, RefreshCw, Clock, ArrowLeft, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo-cpu-pme.png";
import { cn } from "@/lib/utils";

type Step = "email" | "otp";
const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 10 * 60;

// ── Sons ─────────────────────────────────────────────────────────────────────
function playSuccessSound() {
  const ctx = new AudioContext();
  const notes = [523.25, 659.25, 783.99]; // Do Mi Sol
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
    const id = setInterval(() => setRemaining((p) => { if (p <= 1) { clearInterval(id); return 0; } return p - 1; }), 1000);
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

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Auth() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);

  const { sendOtp, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const returnUrl = searchParams.get("returnUrl");
  const isSafeReturnUrl = (url: string | null): url is string => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.hostname === "localhost" || parsed.hostname.endsWith(".cpupme.ci");
    } catch {
      return false;
    }
  };

  const { remaining, formatted } = useCountdown(OTP_EXPIRY_SECONDS, countdownActive);
  const isExpired = countdownActive && remaining === 0;
  const pct = Math.round((remaining / OTP_EXPIRY_SECONDS) * 100);

  const startCountdown = () => {
    setCountdownActive(false);
    setTimeout(() => setCountdownActive(true), 50);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendOtp(email);
      setCode("");
      setStep("otp");
      startCountdown();
      toast({ title: "Code envoyé", description: `Code envoyé à ${email}.` });
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Impossible d'envoyer le code.", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return;
    setIsLoading(true);
    try {
      await login(email, code);
      playSuccessSound();
      toast({ title: "Connexion réussie", description: "Bienvenue sur CPU-PME !" });
      if (isSafeReturnUrl(returnUrl)) {
        window.location.href = returnUrl;
      } else {
        navigate("/");
      }
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
      await sendOtp(email);
      setCode("");
      startCountdown();
      toast({ title: "Code renvoyé", description: `Nouveau code envoyé à ${email}.` });
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Impossible de renvoyer le code.", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Panneau gauche décoratif ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Cercles décoratifs */}
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

      {/* ── Panneau droit : formulaire ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-8">

          {/* Logo mobile */}
          <div className="lg:hidden text-center space-y-2">
            <img src={logo} alt="CPU-PME" className="w-16 h-16 mx-auto rounded-xl shadow-lg" />
            <h1 className="text-xl font-bold">CPU-PME</h1>
            <p className="text-sm text-muted-foreground">Plateforme des entreprises</p>
          </div>

          {/* ── Étape email ── */}
          {step === "email" && (
            <div className="space-y-7">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Bon retour 👋</h2>
                <p className="text-muted-foreground text-sm">
                  Connectez-vous avec votre e-mail d'adhésion
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-mail d'adhésion
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="pl-10 h-12 text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 gap-2 font-semibold text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Recevoir mon code <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <p className="text-xs text-center text-muted-foreground">
                Un code à usage unique sera envoyé à votre adresse e-mail
              </p>
            </div>
          )}

          {/* ── Étape OTP ── */}
          {step === "otp" && (
            <div className="space-y-7">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Vérification</h2>
                <p className="text-muted-foreground text-sm">
                  Code envoyé à{" "}
                  <span className="font-semibold text-foreground">{email}</span>
                </p>
              </div>

              {/* Barre de progression temps */}
              <ProgressBar pct={pct} expired={isExpired} />

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {/* Icône + cases OTP */}
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

                {/* Timer */}
                <div className={cn(
                  "flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-lg",
                  isExpired
                    ? "bg-destructive/10 text-destructive"
                    : remaining <= 60
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-muted text-muted-foreground"
                )}>
                  <Clock className="w-4 h-4 shrink-0" />
                  {isExpired ? (
                    <span>Code expiré — veuillez en demander un nouveau</span>
                  ) : (
                    <span>
                      Expire dans{" "}
                      <span className="tabular-nums font-bold text-base">{formatted}</span>
                    </span>
                  )}
                </div>

                {/* Bouton */}
                <Button
                  type="submit"
                  className="w-full h-12 gap-2 font-semibold"
                  disabled={isLoading || code.length < OTP_LENGTH || isExpired}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Vérification...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Se connecter <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                {/* Actions secondaires */}
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => { setStep("email"); setCode(""); setCountdownActive(false); }}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Changer d'e-mail
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Renvoyer le code
                  </button>
                </div>
              </form>

              <p className="text-xs text-center text-muted-foreground">
                Vérifiez vos spams si vous ne recevez pas le code
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
