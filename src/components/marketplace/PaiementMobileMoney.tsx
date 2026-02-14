import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Phone,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Shield,
  Copy,
  QrCode,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentMethod = "orange_money" | "mtn_momo" | "wave" | "moov_money" | "card";
type PaymentStatus = "pending" | "processing" | "success" | "failed" | "cancelled";

interface PaymentProvider {
  id: PaymentMethod;
  name: string;
  logo: string;
  color: string;
  ussdCode?: string;
  instructions: string[];
}

const providers: PaymentProvider[] = [
  {
    id: "orange_money",
    name: "Orange Money",
    logo: "🟠",
    color: "bg-orange-500",
    ussdCode: "#144#",
    instructions: [
      "Composez #144# sur votre téléphone",
      "Sélectionnez 'Paiement marchand'",
      "Entrez le code marchand affiché",
      "Confirmez avec votre code secret",
    ],
  },
  {
    id: "mtn_momo",
    name: "MTN Mobile Money",
    logo: "🟡",
    color: "bg-yellow-500",
    ussdCode: "*133#",
    instructions: [
      "Composez *133# sur votre téléphone",
      "Sélectionnez 'Payer un marchand'",
      "Entrez le code marchand",
      "Validez avec votre PIN",
    ],
  },
  {
    id: "wave",
    name: "Wave",
    logo: "🔵",
    color: "bg-blue-500",
    instructions: [
      "Ouvrez l'application Wave",
      "Scannez le QR code ou entrez le numéro",
      "Confirmez le montant",
      "Validez avec votre code",
    ],
  },
  {
    id: "moov_money",
    name: "Moov Money",
    logo: "🟣",
    color: "bg-purple-500",
    ussdCode: "*155#",
    instructions: [
      "Composez *155# sur votre téléphone",
      "Sélectionnez 'Paiement'",
      "Entrez le code marchand",
      "Confirmez avec votre PIN",
    ],
  },
];

interface PaiementMobileMoneyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  depositPercent?: number;
  reference: string;
  description: string;
  onPaymentSuccess?: (transactionId: string) => void;
  onPaymentCancel?: () => void;
}

export function PaiementMobileMoney({
  open,
  onOpenChange,
  amount,
  depositPercent,
  reference,
  description,
  onPaymentSuccess,
  onPaymentCancel,
}: PaiementMobileMoneyProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<"select" | "confirm" | "processing" | "result">("select");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [transactionId, setTransactionId] = useState("");

  const depositAmount = depositPercent ? Math.round(amount * (depositPercent / 100)) : amount;

  const selectedProvider = providers.find(p => p.id === selectedMethod);

  const handleConfirmPayment = async () => {
    if (!selectedMethod || !phoneNumber) return;

    setStep("processing");
    setPaymentStatus("processing");

    // Simuler le traitement du paiement
    // À remplacer par l'intégration réelle avec les APIs des opérateurs
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% de succès simulé
      if (success) {
        const txId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        setTransactionId(txId);
        setPaymentStatus("success");
        setStep("result");
        onPaymentSuccess?.(txId);
      } else {
        setPaymentStatus("failed");
        setStep("result");
      }
    }, 3000);
  };

  const handleClose = () => {
    setStep("select");
    setSelectedMethod(null);
    setPhoneNumber("");
    setPaymentStatus("pending");
    onOpenChange(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Paiement Mobile Money
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4 py-4">
            {/* Résumé du paiement */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Référence</p>
                    <p className="font-mono text-sm">{reference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {depositPercent ? `Acompte ${depositPercent}%` : "Montant à payer"}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {depositAmount.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sélection du mode de paiement */}
            <div className="space-y-2">
              <Label>Choisissez votre mode de paiement</Label>
              <RadioGroup 
                value={selectedMethod || ""} 
                onValueChange={(v) => setSelectedMethod(v as PaymentMethod)}
              >
                <div className="grid grid-cols-2 gap-3">
                  {providers.map((provider) => (
                    <div key={provider.id}>
                      <RadioGroupItem
                        value={provider.id}
                        id={provider.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={provider.id}
                        className={cn(
                          "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                          "hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xl", provider.color)}>
                          {provider.logo}
                        </div>
                        <span className="font-medium text-sm">{provider.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Numéro de téléphone */}
            {selectedMethod && (
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone {selectedProvider?.name}</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-muted rounded-l-md border border-r-0">
                    <span className="text-sm text-muted-foreground">+225</span>
                  </div>
                  <Input
                    id="phone"
                    placeholder="07 XX XX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                className="flex-1"
                disabled={!selectedMethod || !phoneNumber}
                onClick={() => setStep("confirm")}
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {step === "confirm" && selectedProvider && (
          <div className="space-y-4 py-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-2xl", selectedProvider.color)}>
                    {selectedProvider.logo}
                  </div>
                  <div>
                    <CardTitle className="text-base">{selectedProvider.name}</CardTitle>
                    <CardDescription>{phoneNumber}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Montant</span>
                    <span className="font-bold text-lg">{depositAmount.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Référence</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{reference}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(reference)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {selectedProvider.ussdCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Code USSD</span>
                      <Badge variant="secondary" className="font-mono">{selectedProvider.ussdCode}</Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Instructions :</p>
                  <ol className="space-y-2">
                    {selectedProvider.instructions.map((instruction, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </Badge>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {selectedMethod === "wave" && (
                  <div className="flex justify-center p-4 bg-muted/50 rounded-lg">
                    <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Shield className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">
                Transaction sécurisée. Vous recevrez une confirmation par SMS.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("select")}>
                Modifier
              </Button>
              <Button className="flex-1" onClick={handleConfirmPayment}>
                J'ai effectué le paiement
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
            <h3 className="font-semibold text-lg mb-2">Vérification en cours...</h3>
            <p className="text-sm text-muted-foreground">
              Nous vérifions votre paiement. Cela peut prendre quelques instants.
            </p>
          </div>
        )}

        {step === "result" && (
          <div className="py-8 text-center space-y-4">
            {paymentStatus === "success" ? (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-green-600">Paiement réussi !</h3>
                  <p className="text-sm text-muted-foreground">
                    Votre paiement de {depositAmount.toLocaleString()} FCFA a été confirmé
                  </p>
                </div>
                <Card className="text-left">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transaction ID</span>
                      <span className="font-mono">{transactionId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Montant</span>
                      <span className="font-bold">{depositAmount.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mode</span>
                      <span>{selectedProvider?.name}</span>
                    </div>
                  </CardContent>
                </Card>
                <Button className="w-full" onClick={handleClose}>
                  Fermer
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-destructive">Paiement échoué</h3>
                  <p className="text-sm text-muted-foreground">
                    Le paiement n'a pas pu être confirmé. Veuillez réessayer.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleClose}>
                    Annuler
                  </Button>
                  <Button className="flex-1" onClick={() => setStep("confirm")}>
                    Réessayer
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
