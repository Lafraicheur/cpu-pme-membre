import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Building2, ArrowRight } from "lucide-react";
import logo from "@/assets/logo-cpu-pme.png";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login - Replace with real auth when Cloud is enabled
    setTimeout(() => {
      localStorage.setItem("cpu-pme-user", JSON.stringify({
        id: "demo-user",
        name: "Utilisateur Demo",
        email: "demo@cpu-pme.sn",
        role: "owner",
      }));
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur CPU-PME !",
      });
      navigate("/");
      setIsLoading(false);
    }, 1000);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate signup - Replace with real auth when Cloud is enabled
    setTimeout(() => {
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé. Vous pouvez maintenant vous connecter.",
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <img src={logo} alt="CPU-PME" className="w-20 h-20 mx-auto rounded-xl shadow-lg" />
          <h1 className="text-2xl font-bold text-foreground">CPU-PME</h1>
          <p className="text-muted-foreground">Plateforme des entreprises camerounaises</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <Tabs defaultValue="login">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-4">
              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Mot de passe
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="link" className="text-primary p-0 h-auto text-sm">
                      Mot de passe oublié ?
                    </Button>
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    {isLoading ? "Connexion..." : "Se connecter"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Prénom
                      </Label>
                      <Input
                        id="signup-firstname"
                        placeholder="Prénom"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname">Nom</Label>
                      <Input
                        id="signup-lastname"
                        placeholder="Nom"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-company" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Nom de l'entreprise
                    </Label>
                    <Input
                      id="signup-company"
                      placeholder="Votre entreprise"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email professionnel
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@entreprise.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Mot de passe
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min. 8 caractères"
                      required
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    {isLoading ? "Création..." : "Créer mon compte"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </TabsContent>

              {/* Demo Notice */}
              <div className="mt-6 p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">
                  🔒 Version démo - L'authentification réelle nécessite Lovable Cloud
                </p>
              </div>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
