import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { useJourney } from "@/contexts/JourneyContext";
import { toast } from "sonner";
import { generatePDF } from "@/lib/pdfExport";

export default function Reports() {
  const navigate = useNavigate();
  const { journeys, settings } = useJourney();
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("monthly");

  // Função para abrir pré-visualização do PDF
  const handleExportPDF = () => {
    if (journeys.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }

    // Redireciona para página de pré-visualização passando dados via state
    navigate("/pdf-preview", { 
      state: { journeys, settings } 
    });
  };

  const handleExportExcel = () => {
    // Simple CSV export
    if (journeys.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }

    const headers = [
      "Data",
      "Início",
      "Fim",
      "Refeição (min)",
      "Descanso (min)",
      "Feriado",
      "KM Inicial",
      "KM Final",
      "RV",
      "Observações",
    ];

    const rows = journeys.map((j) => [
      j.date,
      j.startAt ? new Date(j.startAt).toLocaleTimeString("pt-BR") : "",
      j.endAt ? new Date(j.endAt).toLocaleTimeString("pt-BR") : "",
      j.mealDuration,
      j.restDuration || 0,
      j.isFeriado ? "Sim" : "Não",
      j.kmStart || "",
      j.kmEnd || "",
      j.rvNumber || "",
      j.notes || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `jornada360_relatorio_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();

    toast.success("Relatório exportado com sucesso!");
  };

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
            <FileText className="w-6 h-6" />
            <h1 className="text-xl font-bold text-primary-foreground">Relatórios</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Exportar Relatórios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Period Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Período</label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={reportType === "daily" ? "default" : "outline"}
                  onClick={() => setReportType("daily")}
                  className={reportType === "daily" ? "bg-secondary hover:bg-secondary/90" : ""}
                >
                  Diário
                </Button>
                <Button
                  variant={reportType === "weekly" ? "default" : "outline"}
                  onClick={() => setReportType("weekly")}
                  className={reportType === "weekly" ? "bg-secondary hover:bg-secondary/90" : ""}
                >
                  Semanal
                </Button>
                <Button
                  variant={reportType === "monthly" ? "default" : "outline"}
                  onClick={() => setReportType("monthly")}
                  className={reportType === "monthly" ? "bg-secondary hover:bg-secondary/90" : ""}
                >
                  Mensal
                </Button>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
                onClick={handleExportPDF}
              >
                <Download className="w-5 h-5 mr-2" />
                Exportar PDF
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleExportExcel}
              >
                <Download className="w-5 h-5 mr-2" />
                Exportar CSV
              </Button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Total de jornadas registradas:</strong> {journeys.length}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Os relatórios incluirão: data, horários, duração, horas extras, KM rodados e observações.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
