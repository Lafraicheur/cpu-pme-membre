import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Truck,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Tag,
  ArrowRight,
  Package,
  Store,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { regions } from "@/data/regions";

interface CartItem {
  id: string;
  nom: string;
  vendeur: string;
  prix: number;
  unite: string;
  quantite: number;
  image: string;
  stock: number;
  madeInCI?: "or" | "argent" | "bronze" | null;
}

interface Address {
  id: string;
  label: string;
  ligne1: string;
  ville: string;
  region: string;
  isDefault: boolean;
}

const mockCartItems: CartItem[] = [
  {
    id: "1",
    nom: "Cacao Premium Grade A",
    vendeur: "Coopérative Aboisso Cacao",
    prix: 850000,
    unite: "tonne",
    quantite: 2,
    image: "🍫",
    stock: 50,
    madeInCI: "or",
  },
  {
    id: "2",
    nom: "Attiéké séché - 25kg",
    vendeur: "Femmes de Dabou SARL",
    prix: 15000,
    unite: "sac",
    quantite: 10,
    image: "🌾",
    stock: 200,
    madeInCI: "argent",
  },
  {
    id: "3",
    nom: "Huile de palme raffinée - 20L",
    vendeur: "Palmeraie du Sud",
    prix: 25000,
    unite: "bidon",
    quantite: 5,
    image: "🫒",
    stock: 150,
    madeInCI: "bronze",
  },
];

const mockAddresses: Address[] = [
  {
    id: "1",
    label: "Siège social",
    ligne1: "Cocody Riviera 3, Rue des Jardins",
    ville: "Abidjan",
    region: "Abidjan",
    isDefault: true,
  },
  {
    id: "2",
    label: "Entrepôt",
    ligne1: "Zone Industrielle de Yopougon",
    ville: "Abidjan",
    region: "Abidjan",
    isDefault: false,
  },
];

const deliveryOptions = [
  { id: "standard", label: "Livraison standard", delai: "5-7 jours", prix: 15000 },
  { id: "express", label: "Livraison express", delai: "2-3 jours", prix: 35000 },
  { id: "pickup", label: "Retrait sur place", delai: "Immédiat", prix: 0 },
];

const paymentMethods = [
  { id: "mobile", label: "Mobile Money", icon: Smartphone, desc: "Orange Money, MTN, Moov" },
  { id: "card", label: "Carte bancaire", icon: CreditCard, desc: "Visa, Mastercard" },
  { id: "transfer", label: "Virement bancaire", icon: Store, desc: "Sous 48h" },
];

const madeInCIBadges = {
  or: { color: "bg-primary text-primary-foreground", label: "Or" },
  argent: { color: "bg-secondary text-secondary-foreground", label: "Argent" },
  bronze: { color: "bg-amber-600 text-white", label: "Bronze" },
};

type CheckoutStep = "cart" | "address" | "delivery" | "payment" | "confirmation";

export function PanierCheckout() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(mockAddresses[0].id);
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [selectedPayment, setSelectedPayment] = useState("mobile");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, Math.min(item.stock, item.quantite + delta));
          return { ...item, quantite: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.prix * item.quantite, 0);
  const deliveryFee = deliveryOptions.find(d => d.id === selectedDelivery)?.prix || 0;
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + deliveryFee - discount;

  const applyPromo = () => {
    if (promoCode.toLowerCase() === "cpupme10") {
      setPromoApplied(true);
    }
  };

  const proceedToCheckout = () => {
    if (step === "cart") setStep("address");
    else if (step === "address") setStep("delivery");
    else if (step === "delivery") setStep("payment");
    else if (step === "payment") {
      setShowConfirmation(true);
    }
  };

  const goBack = () => {
    if (step === "address") setStep("cart");
    else if (step === "delivery") setStep("address");
    else if (step === "payment") setStep("delivery");
  };

  if (cartItems.length === 0 && step === "cart") {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Votre panier est vide</h3>
          <p className="text-muted-foreground mb-6">
            Parcourez le catalogue pour ajouter des produits
          </p>
          <Button>
            <Package className="w-4 h-4 mr-2" />
            Voir le catalogue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      {(() => {
        const allSteps = ["cart", "address", "delivery", "payment"];
        const stepLabels = ["Panier", "Adresse", "Livraison", "Paiement"];
        const currentIndex = allSteps.indexOf(step);
        return (
          <div className="flex items-center justify-center gap-2">
            {allSteps.map((s, i) => {
              const isCompleted = i < currentIndex;
              const isCurrent = s === step;
              return (
                <div key={s} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                        isCompleted && "bg-green-500 text-white",
                        isCurrent && "bg-primary text-primary-foreground",
                        !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium",
                      isCompleted && "text-green-600",
                      isCurrent && "text-primary",
                      !isCompleted && !isCurrent && "text-muted-foreground"
                    )}>
                      {stepLabels[i]}
                    </span>
                  </div>
                  {i < 3 && (
                    <div
                      className={cn(
                        "w-12 h-1 mx-1 mb-5 rounded-full transition-colors",
                        isCompleted ? "bg-green-500" : isCurrent ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {step === "cart" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Panier ({cartItems.length} article{cartItems.length > 1 ? "s" : ""})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border overflow-hidden"
                  >
                    {/* Ligne principale : image + infos produit */}
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-2xl shrink-0">
                        {item.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm">{item.nom}</h4>
                          {item.madeInCI && (
                            <Badge className={cn(madeInCIBadges[item.madeInCI].color, "text-[10px] px-1.5 py-0")}>
                              {madeInCIBadges[item.madeInCI].label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{item.vendeur}</p>
                        <p className="text-sm font-medium text-muted-foreground mt-0.5">
                          {item.prix.toLocaleString()} FCFA/{item.unite}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Ligne bas : quantité + total */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground mr-1">Qté</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantite <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantite}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={item.quantite >= item.stock}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <span className="text-xs text-muted-foreground ml-1">/ {item.stock} dispo</span>
                      </div>
                      <p className="font-bold text-primary">
                        {(item.prix * item.quantite).toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {step === "address" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Adresse de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  <div className="space-y-3">
                    {mockAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                          selectedAddress === addr.id && "border-primary bg-primary/5"
                        )}
                        onClick={() => setSelectedAddress(addr.id)}
                      >
                        <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={addr.id} className="font-medium cursor-pointer">
                              {addr.label}
                            </Label>
                            {addr.isDefault && (
                              <Badge variant="secondary" className="text-xs">Par défaut</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{addr.ligne1}</p>
                          <p className="text-sm text-muted-foreground">{addr.ville}, {addr.region}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <Button variant="outline" className="w-full mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une nouvelle adresse
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "delivery" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Mode de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedDelivery} onValueChange={setSelectedDelivery}>
                  <div className="space-y-3">
                    {deliveryOptions.map((option) => (
                      <div
                        key={option.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                          selectedDelivery === option.id && "border-primary bg-primary/5"
                        )}
                        onClick={() => setSelectedDelivery(option.id)}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <div>
                            <Label htmlFor={option.id} className="font-medium cursor-pointer">
                              {option.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{option.delai}</p>
                          </div>
                        </div>
                        <p className="font-semibold">
                          {option.prix === 0 ? "Gratuit" : `${option.prix.toLocaleString()} FCFA`}
                        </p>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {step === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Mode de paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                            selectedPayment === method.id && "border-primary bg-primary/5"
                          )}
                          onClick={() => setSelectedPayment(method.id)}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <div className="p-2 rounded-lg bg-muted">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <Label htmlFor={method.id} className="font-medium cursor-pointer">
                              {method.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{method.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>

                {selectedPayment === "mobile" && (
                  <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-3">
                    <Label>Numéro de téléphone</Label>
                    <Input placeholder="07 XX XX XX XX" />
                    <p className="text-xs text-muted-foreground">
                      Vous recevrez une demande de paiement sur ce numéro
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{subtotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>{deliveryFee === 0 ? "Gratuit" : `${deliveryFee.toLocaleString()} FCFA`}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction (10%)</span>
                    <span>-{discount.toLocaleString()} FCFA</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{total.toLocaleString()} FCFA</span>
                </div>
              </div>

              {step === "cart" && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Code promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <Button
                      variant="outline"
                      onClick={applyPromo}
                      disabled={promoApplied || !promoCode}
                    >
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                  {promoApplied && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Code CPUPME10 appliqué
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {step !== "cart" && (
                  <Button variant="outline" className="w-full" onClick={goBack}>
                    Retour
                  </Button>
                )}
                <Button className="w-full" onClick={proceedToCheckout}>
                  {step === "payment" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirmer et payer
                    </>
                  ) : (
                    <>
                      Continuer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Paiement sécurisé • Garantie CPU-PME
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="text-center">
          <div className="py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl">Commande confirmée !</DialogTitle>
              <DialogDescription>
                Votre commande #CMD-2024-1256 a été enregistrée avec succès.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 p-4 rounded-lg bg-muted/50 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Numéro de commande</span>
                <span className="font-mono font-medium">CMD-2024-1256</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Montant total</span>
                <span className="font-semibold text-primary">{total.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livraison estimée</span>
                <span>{deliveryOptions.find(d => d.id === selectedDelivery)?.delai}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                Continuer mes achats
              </Button>
              <Button>
                Suivre ma commande
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
