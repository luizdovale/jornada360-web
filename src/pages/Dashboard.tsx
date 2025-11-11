import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJourney } from "@/contexts/JourneyContext";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Settings, Calendar, FileText, Clock, TrendingUp, Navigation, List, LogOut } from "lucide-react";
import { minutesToHHMM } from "@/lib/journeyCalculator";
import JourneyModal from "@/components/JourneyModal";
import appIcon from "@/assets/app-icon.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const { getMonthSummary, settings } = useJourney();
  const { signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const now = new Date();
  const summary = getMonthSummary(now.getFullYear(), now.getMonth());

  return (
    <div className="min-h-screen bg-background">
      {/* Header com título e mês/ano */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={appIcon} alt="Jornada 360" className="w-12 h-12 rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-white">Jornada 360</h1>
                <p className="text-xs opacity-90">
                  {new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(now)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-primary/80"
              onClick={signOut}
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Cards de Navegação */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow bg-card"
            onClick={() => navigate("/journeys")}
          >
            <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <List className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-center">Minhas Jornadas</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow bg-card"
            onClick={() => navigate("/calendar")}
          >
            <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-center">Calendário</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow bg-card"
            onClick={() => navigate("/reports")}
          >
            <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-center">Relatórios</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow bg-card"
            onClick={() => navigate("/settings")}
          >
            <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-center">Configurações</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="container mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent" />
                Total Trabalhado
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <p className="text-xl font-bold">{minutesToHHMM(summary.totalWorked)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {summary.journeyCount} jornadas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-warning" />
                Horas Extras 50%
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <p className="text-xl font-bold text-warning">
                {minutesToHHMM(summary.totalExtra50)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-destructive" />
                Horas 100% (Feriados)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <p className="text-xl font-bold text-destructive">
                {minutesToHHMM(summary.total100)}
              </p>
            </CardContent>
          </Card>

          {settings?.kmEnabled && (
            <Card className="shadow-sm">
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-accent" />
                  Total KM
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <p className="text-xl font-bold">
                  {summary.totalKm.toFixed(1)} km
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Botão de Adicionar Jornada */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-lg px-8 py-6"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Jornada
          </Button>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="bg-muted py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Desenvolvido por Luiz do Vale Dev
        </div>
      </footer>

      {/* Botão Flutuante de Ação */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-secondary hover:bg-secondary/90 md:hidden"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Modal de Jornada */}
      <JourneyModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
