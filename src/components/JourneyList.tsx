import { useState } from "react";
import { useJourney } from "@/contexts/JourneyContext";
import { JourneyRecord } from "@/types/journey";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Calendar, Clock, Navigation } from "lucide-react";
import { formatDate, minutesToHHMM, calculateJourney } from "@/lib/journeyCalculator";
import JourneyModal from "./JourneyModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface JourneyListProps {
  journeys?: JourneyRecord[];
}

export default function JourneyList({ journeys: customJourneys }: JourneyListProps = {}) {
  const { journeys: contextJourneys, settings, deleteJourney } = useJourney();
  const journeys = customJourneys || contextJourneys;
  const [editingJourney, setEditingJourney] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (journeys.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma jornada registrada</h3>
        <p className="text-muted-foreground">
          Clique em "Nova Jornada" para começar
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {journeys.map((journey) => {
          const calc = settings ? calculateJourney(journey, settings) : null;
          
          return (
            <div
              key={journey.id}
              className="p-3 border rounded-lg hover:shadow-md transition-smooth bg-card cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">
                      {formatDate(journey.date)}
                    </span>
                    {journey.isFeriado && (
                      <Badge variant="destructive" className="text-xs">
                        Feriado
                      </Badge>
                    )}
                    {calc && (
                      <span className="text-sm text-accent font-medium">
                        {minutesToHHMM(calc.totalWorked)}
                      </span>
                    )}
                    {calc && calc.hoursExtra50 > 0 && (
                      <Badge variant="secondary" className="text-xs bg-warning text-warning-foreground">
                        +{minutesToHHMM(calc.hoursExtra50)}
                      </Badge>
                    )}
                    {calc && calc.hours100 > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        100%
                      </Badge>
                    )}
                  </div>
                  
                  {journey.startAt && journey.endAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(journey.startAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" - "}
                      {new Date(journey.endAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setEditingJourney(journey.id)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setDeletingId(journey.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingJourney && (
        <JourneyModal
          open={!!editingJourney}
          onOpenChange={(open) => !open && setEditingJourney(null)}
          journeyId={editingJourney}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta jornada? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deletingId) {
                  deleteJourney(deletingId);
                  setDeletingId(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
