import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useJourney } from "@/contexts/JourneyContext";
import { JourneyRecord } from "@/types/journey";

interface JourneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  journeyId?: string;
}

export default function JourneyModal({ open, onOpenChange, journeyId }: JourneyModalProps) {
  const { journeys, settings, addJourney, updateJourney } = useJourney();
  const existingJourney = journeyId ? journeys.find((j) => j.id === journeyId) : null;

  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    mealDuration: "60",
    restDuration: "0",
    isFeriado: false,
    kmStart: "",
    kmEnd: "",
    rvNumber: "",
    notes: "",
  });

  useEffect(() => {
    if (existingJourney) {
      setFormData({
        date: existingJourney.date.split("T")[0],
        startTime: existingJourney.startAt
          ? new Date(existingJourney.startAt).toTimeString().slice(0, 5)
          : "",
        endTime: existingJourney.endAt
          ? new Date(existingJourney.endAt).toTimeString().slice(0, 5)
          : "",
        mealDuration: existingJourney.mealDuration.toString(),
        restDuration: (existingJourney.restDuration || 0).toString(),
        isFeriado: existingJourney.isFeriado,
        kmStart: existingJourney.kmStart?.toString() || "",
        kmEnd: existingJourney.kmEnd?.toString() || "",
        rvNumber: existingJourney.rvNumber || "",
        notes: existingJourney.notes || "",
      });
    } else {
      // Reset for new journey
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        date: today,
        startTime: "",
        endTime: "",
        mealDuration: "60",
        restDuration: "0",
        isFeriado: false,
        kmStart: "",
        kmEnd: "",
        rvNumber: "",
        notes: "",
      });
    }
  }, [existingJourney, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Criar data mantendo a data local sem conversão de timezone
    const localDate = new Date(formData.date + 'T12:00:00');
    const dateStr = localDate.toISOString();
    
    const startAt = formData.startTime
      ? `${formData.date}T${formData.startTime}:00`
      : null;
    const endAt = formData.endTime
      ? `${formData.date}T${formData.endTime}:00`
      : null;

    const journeyData: Omit<JourneyRecord, "id" | "createdAt" | "updatedAt"> = {
      date: dateStr,
      startAt,
      endAt,
      mealDuration: parseInt(formData.mealDuration) || 0,
      restDuration: parseInt(formData.restDuration) || 0,
      isFeriado: formData.isFeriado,
      kmStart: formData.kmStart ? parseFloat(formData.kmStart) : null,
      kmEnd: formData.kmEnd ? parseFloat(formData.kmEnd) : null,
      rvNumber: formData.rvNumber || null,
      notes: formData.notes || null,
    };

    if (journeyId) {
      updateJourney(journeyId, journeyData);
    } else {
      addJourney(journeyData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {journeyId ? "Editar Jornada" : "Nova Jornada"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Início *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Fim *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Refeição e Descanso */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mealDuration">Refeição (minutos) *</Label>
              <Input
                id="mealDuration"
                type="number"
                min="0"
                value={formData.mealDuration}
                onChange={(e) => setFormData({ ...formData, mealDuration: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restDuration">Descanso (minutos)</Label>
              <Input
                id="restDuration"
                type="number"
                min="0"
                value={formData.restDuration}
                onChange={(e) => setFormData({ ...formData, restDuration: e.target.value })}
              />
            </div>
          </div>

          {/* Feriado */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="feriado">Feriado</Label>
              <p className="text-sm text-muted-foreground">
                Todas as horas serão contadas como 100%
              </p>
            </div>
            <Switch
              id="feriado"
              checked={formData.isFeriado}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isFeriado: checked })
              }
            />
          </div>

          {/* KM (se habilitado) */}
          {settings?.kmEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kmStart">KM Inicial</Label>
                <Input
                  id="kmStart"
                  type="number"
                  step="0.1"
                  value={formData.kmStart}
                  onChange={(e) => setFormData({ ...formData, kmStart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kmEnd">KM Final</Label>
                <Input
                  id="kmEnd"
                  type="number"
                  step="0.1"
                  value={formData.kmEnd}
                  onChange={(e) => setFormData({ ...formData, kmEnd: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* RV Number */}
          <div className="space-y-2">
            <Label htmlFor="rvNumber">Número RV</Label>
            <Input
              id="rvNumber"
              value={formData.rvNumber}
              onChange={(e) => setFormData({ ...formData, rvNumber: e.target.value })}
              placeholder="Opcional"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione observações sobre esta jornada..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-secondary hover:bg-secondary/90">
              {journeyId ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
