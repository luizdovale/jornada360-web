import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJourney } from "@/contexts/JourneyContext";
import { AppSettings } from "@/types/journey";
import { Clock, Navigation, Calendar } from "lucide-react";
import appIcon from "/app-icon-white-bg.png";

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateSettings, completeOnboarding, settings } = useJourney();

  const [formData, setFormData] = useState<Partial<AppSettings>>(
    settings || {
      jornadaBase: 440, // 7:20
      kmEnabled: false,
      monthStartDay: 21,
      escalaPattern: "6x2",
      escalaStartDate: null,
    }
  );

  const handleSubmit = () => {
    const now = new Date().toISOString();
    updateSettings({
      ...formData,
      createdAt: settings?.createdAt || now,
      updatedAt: now,
    } as AppSettings);
    completeOnboarding();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-elegant animate-scale-in">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-20 h-20 rounded-lg mb-2 bg-primary p-3 flex items-center justify-center">
            <img src={appIcon} alt="Jornada 360" className="w-full h-full object-contain brightness-0 invert" />
          </div>
          <p className="text-lg text-foreground mb-2">Bem vindo ao Jornada 360</p>
          <CardTitle className="text-3xl text-foreground">Configuração Inicial</CardTitle>
          <CardDescription className="text-base">
            Configure suas preferências para começar a registrar suas jornadas
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Jornada Base */}
          <div className="space-y-2">
            <Label htmlFor="jornadaBase" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Jornada Diária (horas de trabalho por dia)
            </Label>
            <Select
              value={formData.jornadaBase?.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, jornadaBase: parseInt(value) })
              }
            >
              <SelectTrigger id="jornadaBase">
                <SelectValue placeholder="Selecione a jornada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="440">7:20 (7h20min)</SelectItem>
                <SelectItem value="480">8:00 (8h)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Controle de KM */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-accent" />
              <div>
                <Label htmlFor="kmEnabled">Controle de Quilometragem</Label>
                <p className="text-sm text-muted-foreground">
                  Registrar KM inicial e final em cada jornada
                </p>
              </div>
            </div>
            <Switch
              id="kmEnabled"
              checked={formData.kmEnabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, kmEnabled: checked })
              }
            />
          </div>

          {/* Escala de Trabalho */}
          <div className="space-y-2">
            <Label htmlFor="escala" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              Escala de Trabalho (padrão de dias trabalhados e folgas)
            </Label>
            <Select
              value={formData.escalaPattern}
              onValueChange={(value) =>
                setFormData({ ...formData, escalaPattern: value })
              }
            >
              <SelectTrigger id="escala">
                <SelectValue placeholder="Selecione a escala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6x2">6x2 (6 dias trabalho, 2 folga)</SelectItem>
                <SelectItem value="5x2">5x2 (5 dias trabalho, 2 folga)</SelectItem>
                <SelectItem value="6x1">6x1 (6 dias trabalho, 1 folga)</SelectItem>
                <SelectItem value="4x2">4x2 (4 dias trabalho, 2 folga)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dia de Início do Mês */}
          <div className="space-y-2">
            <Label htmlFor="monthStart">Primeiro Dia Contábil (dia que inicia o ciclo mensal)</Label>
            <Input
              id="monthStart"
              type="number"
              min="1"
              max="31"
              value={formData.monthStartDay || ""}
              onChange={(e) =>
                setFormData({ ...formData, monthStartDay: e.target.value ? parseInt(e.target.value) : undefined })
              }
              placeholder="Digite o dia (1-31)"
            />
          </div>

          {/* Data Base da Escala */}
          <div className="space-y-2">
            <Label htmlFor="escalaStart">Data Base da Escala (primeiro dia do ciclo de trabalho)</Label>
            <Input
              id="escalaStart"
              type="date"
              value={formData.escalaStartDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, escalaStartDate: e.target.value || null })
              }
              placeholder="Selecione a data"
            />
            <p className="text-xs text-muted-foreground">
              Primeiro dia da sua escala de trabalho (ex: início do ciclo 6x2)
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/")}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-secondary hover:bg-secondary/90"
              onClick={handleSubmit}
            >
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
