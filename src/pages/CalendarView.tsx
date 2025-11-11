import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useJourney } from "@/contexts/JourneyContext";
import { Badge } from "@/components/ui/badge";

export default function CalendarView() {
  const navigate = useNavigate();
  const { settings } = useJourney();
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(now);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first and last day of month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  // Navegação entre meses
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Swipe gesture handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goToNextMonth();
    } else if (isRightSwipe) {
      goToPreviousMonth();
    }
  };

  // Create calendar grid
  const days: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Função para determinar o status do dia baseado na escala
  const getDayStatus = (day: number): "work" | "off" | "neutral" => {
    if (!settings?.escalaStartDate || !settings.escalaPattern) {
      return "neutral";
    }

    const currentDayDate = new Date(year, month, day);
    const startDate = new Date(settings.escalaStartDate);
    
    // Calcular diferença em dias
    const diffTime = currentDayDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "neutral";

    // Parsear padrão da escala (ex: "6x2" = 6 dias trabalho, 2 dias folga)
    const [workDays, offDays] = settings.escalaPattern.split("x").map(Number);
    const cycleDays = workDays + offDays;
    const positionInCycle = diffDays % cycleDays;

    return positionInCycle < workDays ? "work" : "off";
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary/80"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6" />
            <h1 className="text-xl font-bold text-primary-foreground">Calendário de Folgas</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Card 
          className="shadow-elegant"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
                  currentDate
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextMonth}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Legend */}
            <div className="flex gap-6 justify-center text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700" />
                <span>Dia de Trabalho</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" />
                <span>Dia de Folga</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Week day headers */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square"></div>;
                }

                const status = getDayStatus(day);
                const isToday = 
                  day === now.getDate() && 
                  month === now.getMonth() && 
                  year === now.getFullYear();

                return (
                  <div
                    key={day}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg
                      transition-smooth border
                      ${status === "work" ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700" : ""}
                      ${status === "off" ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700" : ""}
                      ${status === "neutral" ? "border-border" : ""}
                      ${isToday ? "ring-2 ring-primary" : ""}
                    `}
                  >
                    <span className={`text-sm font-medium ${isToday ? "font-bold" : ""}`}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Scale Info */}
            {settings?.escalaPattern && (
              <div className="mt-6 p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Escala de trabalho:{" "}
                  <Badge variant="secondary">{settings.escalaPattern}</Badge>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
