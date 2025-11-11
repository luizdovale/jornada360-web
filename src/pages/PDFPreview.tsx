// Página de pré-visualização do PDF antes de baixar ou compartilhar
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { JourneyRecord, AppSettings } from "@/types/journey";
import { calculateJourney, minutesToHHMM } from "@/lib/journeyCalculator";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PDFPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { journeys, settings } = location.state as { journeys: JourneyRecord[], settings: AppSettings };
  const [pdfUrl, setPdfUrl] = useState<string>("");

  // Gera o PDF em memória para pré-visualização
  useEffect(() => {
    if (!journeys || !settings) {
      navigate("/reports");
      return;
    }

    generatePDFPreview();
  }, [journeys, settings]);

  // Função para gerar o PDF e criar URL de visualização
  const generatePDFPreview = () => {
    const doc = new jsPDF();
    
    // Cabeçalho do PDF
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Jornada 360", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Relatório Mensal de Jornadas", 105, 28, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
      105,
      35,
      { align: "center" }
    );

    // Preparar dados da tabela
    const tableData = journeys.map((journey) => {
      const calc = calculateJourney(journey, settings);
      const date = new Date(journey.date);
      const dateStr = date.toLocaleDateString("pt-BR");
      
      const startTime = journey.startAt
        ? new Date(journey.startAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";
      
      const endTime = journey.endAt
        ? new Date(journey.endAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";

      return [
        dateStr,
        startTime,
        endTime,
        minutesToHHMM(calc.totalWorked),
        minutesToHHMM(calc.hoursExtra50),
        minutesToHHMM(calc.hours100),
        calc.kmDriven !== null ? calc.kmDriven.toFixed(1) : "-",
        journey.rvNumber || "-",
        journey.notes || "-",
      ];
    });

    // Calcular totais
    const totals = journeys.reduce(
      (acc, journey) => {
        const calc = calculateJourney(journey, settings);
        return {
          totalWorked: acc.totalWorked + calc.totalWorked,
          totalExtra50: acc.totalExtra50 + calc.hoursExtra50,
          total100: acc.total100 + calc.hours100,
          totalKm: acc.totalKm + (calc.kmDriven || 0),
        };
      },
      { totalWorked: 0, totalExtra50: 0, total100: 0, totalKm: 0 }
    );

    // Criar tabela
    autoTable(doc, {
      startY: 45,
      head: [
        [
          "Data",
          "Início",
          "Fim",
          "Total",
          "Extra 50%",
          "Extra 100%",
          "KM",
          "RV",
          "Obs.",
        ],
      ],
      body: tableData,
      foot: [
        [
          "TOTAIS",
          "",
          "",
          minutesToHHMM(totals.totalWorked),
          minutesToHHMM(totals.totalExtra50),
          minutesToHHMM(totals.total100),
          totals.totalKm.toFixed(1),
          "",
          "",
        ],
      ],
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [42, 105, 178], // Cor azul do app
        textColor: 255,
        fontStyle: "bold",
      },
      footStyles: {
        fillColor: [229, 231, 235],
        textColor: 0,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 18 },
        2: { cellWidth: 18 },
        3: { cellWidth: 18 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 15 },
        7: { cellWidth: 20 },
        8: { cellWidth: 30 },
      },
    });

    // Resumo final
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo do Período", 14, finalY);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de Jornadas: ${journeys.length}`, 14, finalY + 8);
    doc.text(`Total Trabalhado: ${minutesToHHMM(totals.totalWorked)}`, 14, finalY + 14);
    doc.text(`Horas Extras 50%: ${minutesToHHMM(totals.totalExtra50)}`, 14, finalY + 20);
    doc.text(`Horas Extras 100%: ${minutesToHHMM(totals.total100)}`, 14, finalY + 26);
    
    if (settings.kmEnabled) {
      doc.text(`Total KM: ${totals.totalKm.toFixed(1)} km`, 14, finalY + 32);
    }

    // Cria URL do PDF para visualização
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
  };

  // Função para baixar o PDF
  const handleBaixar = () => {
    const fileName = `Jornada360_Relatorio_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
    toast.success("PDF baixado com sucesso!");
  };

  // Função para compartilhar o PDF (usa API Web Share)
  const handleCompartilhar = async () => {
    try {
      // Verifica se o navegador suporta Web Share API
      if (navigator.share) {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const file = new File(
          [blob], 
          `Jornada360_Relatorio_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`,
          { type: "application/pdf" }
        );

        await navigator.share({
          title: "Relatório Jornada360",
          text: "Confira meu relatório de jornadas",
          files: [file],
        });

        toast.success("PDF compartilhado!");
      } else {
        // Fallback: copia o link ou baixa o arquivo
        toast.info("Compartilhamento não disponível. Use o botão Baixar.");
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      toast.error("Erro ao compartilhar PDF");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary/80"
              onClick={() => navigate("/reports")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-primary-foreground">Pré-visualização do PDF</h1>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-6">
        <Card className="shadow-elegant p-4">
          {/* Área de pré-visualização do PDF */}
          {pdfUrl && (
            <div className="w-full h-[calc(100vh-300px)] bg-muted rounded-lg overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="Pré-visualização do PDF"
              />
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              size="lg"
              onClick={handleBaixar}
            >
              <Download className="w-5 h-5 mr-2" />
              Baixar PDF
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={handleCompartilhar}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Compartilhar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}