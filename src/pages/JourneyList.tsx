import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Calendar as CalendarIcon, Clock, SlidersHorizontal, ArrowUpDown, Plus } from "lucide-react";
import { useJourney } from "@/contexts/JourneyContext";
import JourneyList from "@/components/JourneyList";
import JourneyModal from "@/components/JourneyModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calculateJourney } from "@/lib/journeyCalculator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function JourneyListPage() {
  const navigate = useNavigate();
  const { journeys, settings } = useJourney();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filtros de período
  const [filterType, setFilterType] = useState<"all" | "specific" | "week" | "month">("all");
  const [specificDate, setSpecificDate] = useState<Date>();
  const [weekDate, setWeekDate] = useState<Date>();
  const [monthDate, setMonthDate] = useState<Date>();
  
  // Filtros complementares
  const [journeyTypeFilter, setJourneyTypeFilter] = useState<"all" | "normal" | "holiday">("all");
  const [kmFilter, setKmFilter] = useState<"all" | "with" | "without">("all");
  
  // Ordenação
  const [sortBy, setSortBy] = useState<"date" | "hours" | "extra">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Função para calcular o mês contábil baseado no ciclo
  const getAccountingMonth = (date: Date) => {
    const monthStartDay = settings?.monthStartDay || 1;
    const day = date.getDate();
    
    if (day >= monthStartDay) {
      // Se o dia é >= ao dia inicial do ciclo, pertence ao mês atual
      return { year: date.getFullYear(), month: date.getMonth() };
    } else {
      // Se o dia é < ao dia inicial, pertence ao mês anterior
      const prevMonth = new Date(date);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      return { year: prevMonth.getFullYear(), month: prevMonth.getMonth() };
    }
  };

  const filteredJourneys = journeys.filter((journey) => {
    // Filtro de busca textual (só aplica se houver termo de busca)
    if (searchTerm) {
      const matchesSearch =
        journey.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journey.rvNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false;
      
      if (!matchesSearch) return false;
    }

    const journeyDate = parseISO(journey.date);

    // Filtro de período
    let matchesPeriod = true;
    
    if (filterType === "specific" && specificDate) {
      matchesPeriod = format(journeyDate, "yyyy-MM-dd") === format(specificDate, "yyyy-MM-dd");
    } else if (filterType === "week" && weekDate) {
      const weekStart = startOfWeek(weekDate, { locale: ptBR });
      const weekEnd = endOfWeek(weekDate, { locale: ptBR });
      matchesPeriod = isWithinInterval(journeyDate, { start: weekStart, end: weekEnd });
    } else if (filterType === "month" && monthDate) {
      const selectedMonth = getAccountingMonth(monthDate);
      const journeyMonth = getAccountingMonth(journeyDate);
      matchesPeriod = selectedMonth.year === journeyMonth.year && selectedMonth.month === journeyMonth.month;
    }

    if (!matchesPeriod) return false;

    // Filtro de tipo de jornada
    if (journeyTypeFilter === "normal" && journey.isFeriado) return false;
    if (journeyTypeFilter === "holiday" && !journey.isFeriado) return false;

    // Filtro de KM
    if (kmFilter === "with" && (!journey.kmStart || !journey.kmEnd)) return false;
    if (kmFilter === "without" && journey.kmStart && journey.kmEnd) return false;

    return true;
  });

  // Aplicar ordenação
  const sortedJourneys = [...filteredJourneys].sort((a, b) => {
    let compareValue = 0;

    if (sortBy === "date") {
      compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "hours" && settings) {
      const calcA = calculateJourney(a, settings);
      const calcB = calculateJourney(b, settings);
      compareValue = calcA.totalWorked - calcB.totalWorked;
    } else if (sortBy === "extra" && settings) {
      const calcA = calculateJourney(a, settings);
      const calcB = calculateJourney(b, settings);
      const extraA = calcA.hoursExtra50 + calcA.hours100;
      const extraB = calcB.hoursExtra50 + calcB.hours100;
      compareValue = extraA - extraB;
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  // Função para obter o nome do mês contábil
  const getAccountingMonthName = (date: Date) => {
    const { year, month } = getAccountingMonth(date);
    const monthDate = new Date(year, month);
    return format(monthDate, "MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-primary/80"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
            <div className="flex items-center gap-3">
            <Clock className="w-6 h-6" />
            <h1 className="text-xl font-bold text-white">Minhas Jornadas</h1>

          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="p-4 mb-6 shadow-card">
          <div className="space-y-4">
            {/* Busca textual */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por RV ou observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de Período */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Período</Label>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as jornadas</SelectItem>
                    <SelectItem value="specific">Data específica</SelectItem>
                    <SelectItem value="week">Período semanal</SelectItem>
                    <SelectItem value="month">Período mensal (ciclo contábil)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Pickers para cada tipo de filtro */}
              {filterType === "specific" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {specificDate ? format(specificDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={specificDate}
                      onSelect={setSpecificDate}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              )}

              {filterType === "week" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {weekDate 
                        ? `Semana de ${format(startOfWeek(weekDate, { locale: ptBR }), "dd/MM", { locale: ptBR })} a ${format(endOfWeek(weekDate, { locale: ptBR }), "dd/MM/yyyy", { locale: ptBR })}`
                        : "Selecione uma semana"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={weekDate}
                      onSelect={setWeekDate}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              )}

              {filterType === "month" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {monthDate 
                        ? `Mês contábil: ${getAccountingMonthName(monthDate)}`
                        : "Selecione um mês"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={monthDate}
                      onSelect={setMonthDate}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Filtros Complementares */}
            <div className="pt-2 border-t space-y-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filtros Avançados
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    {/* Tipo de Jornada */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Tipo de Jornada</Label>
                      <RadioGroup value={journeyTypeFilter} onValueChange={(value: any) => setJourneyTypeFilter(value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="type-all" />
                          <Label htmlFor="type-all" className="font-normal cursor-pointer">Todas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="normal" id="type-normal" />
                          <Label htmlFor="type-normal" className="font-normal cursor-pointer">Normal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="holiday" id="type-holiday" />
                          <Label htmlFor="type-holiday" className="font-normal cursor-pointer">Feriado</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Filtro de KM */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Quilometragem</Label>
                      <RadioGroup value={kmFilter} onValueChange={(value: any) => setKmFilter(value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="km-all" />
                          <Label htmlFor="km-all" className="font-normal cursor-pointer">Todas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="with" id="km-with" />
                          <Label htmlFor="km-with" className="font-normal cursor-pointer">Com KM registrado</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="without" id="km-without" />
                          <Label htmlFor="km-without" className="font-normal cursor-pointer">Sem KM</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Ordenação */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Ordenar por</Label>
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Data</SelectItem>
                          <SelectItem value="hours">Total de horas</SelectItem>
                          <SelectItem value="extra">Horas extras</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ordem */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Ordem</Label>
                      <RadioGroup value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="asc" id="order-asc" />
                          <Label htmlFor="order-asc" className="font-normal cursor-pointer">Crescente</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="desc" id="order-desc" />
                          <Label htmlFor="order-desc" className="font-normal cursor-pointer">Decrescente</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Botão para resetar filtros */}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setJourneyTypeFilter("all");
                        setKmFilter("all");
                        setSortBy("date");
                        setSortOrder("desc");
                      }}
                    >
                      Limpar Filtros Avançados
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Indicador de filtros ativos */}
              {(journeyTypeFilter !== "all" || kmFilter !== "all" || sortBy !== "date" || sortOrder !== "desc") && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Filtros avançados ativos</span>
                </div>
              )}
            </div>

            {/* Botão para limpar todos os filtros */}
            {(searchTerm || filterType !== "all" || journeyTypeFilter !== "all" || kmFilter !== "all") && (
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setSpecificDate(undefined);
                  setWeekDate(undefined);
                  setMonthDate(undefined);
                  setJourneyTypeFilter("all");
                  setKmFilter("all");
                  setSortBy("date");
                  setSortOrder("desc");
                }}
              >
                Limpar Todos os Filtros
              </Button>
            )}
          </div>
        </Card>

        {/* Journey List */}
        <Card className="shadow-elegant">
          <div className="p-6">
            {/* Contador de resultados */}
            <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>{sortedJourneys.length} jornada{sortedJourneys.length !== 1 ? "s" : ""} encontrada{sortedJourneys.length !== 1 ? "s" : ""}</span>
              {sortBy !== "date" && (
                <div className="flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" />
                  <span>
                    Ordenado por: {sortBy === "hours" ? "Total de horas" : "Horas extras"} ({sortOrder === "asc" ? "Crescente" : "Decrescente"})
                  </span>
                </div>
              )}
            </div>

            {sortedJourneys.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma jornada encontrada</p>
                <p className="text-xs mt-2">Tente ajustar os filtros</p>
              </div>
            ) : (
              <JourneyList journeys={sortedJourneys} />
            )}
          </div>
        </Card>
      </div>

      {/* Floating Action Button */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elegant z-50"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Journey Modal */}
      <JourneyModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
