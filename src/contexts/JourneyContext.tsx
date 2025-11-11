import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { JourneyRecord, AppSettings, MonthSummary } from "@/types/journey";
import { calculateJourney } from "@/lib/journeyCalculator";
import { toast } from "sonner";

interface JourneyContextType {
  journeys: JourneyRecord[];
  settings: AppSettings | null;
  isOnboarded: boolean;
  addJourney: (journey: Omit<JourneyRecord, "id" | "createdAt" | "updatedAt">) => void;
  updateJourney: (id: string, journey: Partial<JourneyRecord>) => void;
  deleteJourney: (id: string) => void;
  updateSettings: (settings: AppSettings) => void;
  getMonthSummary: (year: number, month: number) => MonthSummary;
  completeOnboarding: () => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  JOURNEYS: "jornada360_journeys",
  SETTINGS: "jornada360_settings",
  ONBOARDED: "jornada360_onboarded",
};

const DEFAULT_SETTINGS: AppSettings = {
  jornadaBase: 440, // 7:20
  kmEnabled: false,
  monthStartDay: 1,
  escalaPattern: "6x2",
  escalaStartDate: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [journeys, setJourneys] = useState<JourneyRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const storedJourneys = localStorage.getItem(STORAGE_KEYS.JOURNEYS);
    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const storedOnboarded = localStorage.getItem(STORAGE_KEYS.ONBOARDED);

    if (storedJourneys) {
      setJourneys(JSON.parse(storedJourneys));
    }

    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      setSettings(DEFAULT_SETTINGS);
    }

    if (storedOnboarded === "true") {
      setIsOnboarded(true);
    }
  }, []);

  // Save journeys to localStorage
  useEffect(() => {
    if (journeys.length > 0 || localStorage.getItem(STORAGE_KEYS.JOURNEYS)) {
      localStorage.setItem(STORAGE_KEYS.JOURNEYS, JSON.stringify(journeys));
    }
  }, [journeys]);

  // Save settings to localStorage
  useEffect(() => {
    if (settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  }, [settings]);

  const addJourney = (journey: Omit<JourneyRecord, "id" | "createdAt" | "updatedAt">) => {
    // Verificar duplicidade
    const journeyDate = journey.date.split("T")[0]; // Pegar apenas a data (YYYY-MM-DD)
    const existingJourney = journeys.find((j) => j.date.split("T")[0] === journeyDate);
    
    if (existingJourney) {
      toast.error("Já existe uma jornada registrada nesta data!");
      return;
    }

    const now = new Date().toISOString();
    const newJourney: JourneyRecord = {
      ...journey,
      id: `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    setJourneys((prev) => [newJourney, ...prev].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    
    toast.success("Jornada registrada com sucesso!");
  };

  const updateJourney = (id: string, updates: Partial<JourneyRecord>) => {
    setJourneys((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, ...updates, updatedAt: new Date().toISOString() }
          : j
      )
    );
    toast.success("Jornada atualizada!");
  };

  const deleteJourney = (id: string) => {
    setJourneys((prev) => prev.filter((j) => j.id !== id));
    toast.success("Jornada excluída!");
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings({
      ...newSettings,
      updatedAt: new Date().toISOString(),
    });
    toast.success("Configurações atualizadas!");
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, "true");
  };

  const getMonthSummary = (year: number, month: number): MonthSummary => {
    if (!settings) {
      return {
        totalWorked: 0,
        totalExtra50: 0,
        total100: 0,
        totalKm: 0,
        journeyCount: 0,
      };
    }

    const monthJourneys = journeys.filter((j) => {
      const date = new Date(j.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });

    const summary = monthJourneys.reduce(
      (acc, journey) => {
        const calc = calculateJourney(journey, settings);
        return {
          totalWorked: acc.totalWorked + calc.totalWorked,
          totalExtra50: acc.totalExtra50 + calc.hoursExtra50,
          total100: acc.total100 + calc.hours100,
          totalKm: acc.totalKm + (calc.kmDriven || 0),
          journeyCount: acc.journeyCount + 1,
        };
      },
      { totalWorked: 0, totalExtra50: 0, total100: 0, totalKm: 0, journeyCount: 0 }
    );

    return summary;
  };

  return (
    <JourneyContext.Provider
      value={{
        journeys,
        settings,
        isOnboarded,
        addJourney,
        updateJourney,
        deleteJourney,
        updateSettings,
        getMonthSummary,
        completeOnboarding,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const context = useContext(JourneyContext);
  if (context === undefined) {
    throw new Error("useJourney must be used within a JourneyProvider");
  }
  return context;
}
