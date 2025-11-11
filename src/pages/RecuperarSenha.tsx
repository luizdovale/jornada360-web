// Página de recuperação de senha
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import appIcon from "@/assets/app-icon.png";

export default function RecuperarSenha() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // Função para enviar email de recuperação
  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (!error) {
      setEnviado(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={appIcon} alt="Jornada360" className="w-20 h-20" />
          </div>
          <CardTitle className="text-2xl font-bold">Recuperar senha</CardTitle>
          <CardDescription>
            {enviado 
              ? "Email enviado! Verifique sua caixa de entrada."
              : "Digite seu email para receber as instruções de recuperação"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!enviado ? (
            <form onSubmit={handleRecuperar} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar instruções"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Enviamos um email com as instruções para recuperar sua senha.
                Verifique também sua caixa de spam.
              </div>
              <Button 
                onClick={() => navigate("/login")} 
                className="w-full" 
                size="lg"
              >
                Voltar para o login
              </Button>
            </div>
          )}

          {/* Link para voltar ao login */}
          {!enviado && (
            <div className="text-center">
              <Link 
                to="/login" 
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}