import { JourneyRecord, AppSettings, JourneyCalculation } from "@/types/journey";

export function calculateJourney(
  journey: JourneyRecord,
  settings: AppSettings
): JourneyCalculation {
  if (!journey.startAt || !journey.endAt) {
    return {
      totalWorked: 0,
      hoursExtra50: 0,
      hours100: 0,
      kmDriven: journey.kmStart && journey.kmEnd ? journey.kmEnd - journey.kmStart : null,
    };
  }

  const start = new Date(journey.startAt);
  const end = new Date(journey.endAt);
  
  // Total em minutos
  const totalMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  
  // Subtrair refeição e descanso
  const deductions = journey.mealDuration + (journey.restDuration || 0);
  const totalWorked = Math.max(0, totalMinutes - deductions);
  
  // Calcular KM
  const kmDriven = journey.kmStart && journey.kmEnd ? journey.kmEnd - journey.kmStart : null;

  // Se é feriado, todas as horas trabalhadas são 100%
  if (journey.isFeriado) {
    return {
      totalWorked,
      hoursExtra50: 0,
      hours100: totalWorked,
      kmDriven,
    };
  }

  // Senão, calcular horas extras 50%
  const extra50 = Math.max(0, totalWorked - settings.jornadaBase);

  return {
    totalWorked,
    hoursExtra50: extra50,
    hours100: 0,
    kmDriven,
  };
}

export function minutesToHHMM(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function HHMMToMinutes(hhMM: string): number {
  const [hours, minutes] = hhMM.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
