export interface JourneyRecord {
  id: string;
  date: string; // ISO date string
  startAt: string | null; // ISO datetime string
  endAt: string | null; // ISO datetime string
  mealDuration: number; // minutes
  restDuration: number | null; // minutes
  isFeriado: boolean;
  kmStart: number | null;
  kmEnd: number | null;
  rvNumber: string | null;
  notes: string | null;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface AppSettings {
  jornadaBase: number; // minutes (7:20 = 440, 8:00 = 480)
  kmEnabled: boolean;
  monthStartDay?: number; // 1-31
  escalaPattern: string; // "6x2", "5x2", "6x1", "4x2"
  escalaStartDate: string | null; // ISO date string - primeiro dia da escala
  createdAt: string;
  updatedAt: string;
}

export interface JourneyCalculation {
  totalWorked: number; // minutes
  hoursExtra50: number; // minutes
  hours100: number; // minutes
  kmDriven: number | null;
}

export interface MonthSummary {
  totalWorked: number; // minutes
  totalExtra50: number; // minutes
  total100: number; // minutes
  totalKm: number;
  journeyCount: number;
}
