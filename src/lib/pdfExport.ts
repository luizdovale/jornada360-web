import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { JourneyRecord, AppSettings } from "@/types/journey";
import { calculateJourney, minutesToHHMM } from "./journeyCalculator";

export async function generatePDF(journeys: JourneyRecord[], settings: AppSettings) {
  const doc = new jsPDF();
  
  // Adicionar logo (se necessário, podemos adicionar depois)
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Jornada 360", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório Mensal de Jornadas", 105, 28, { align: "center" });
  
  // Data de geração
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
      fillColor: [59, 130, 246], // Primary blue
      textColor: 255,
      fontStyle: "bold",
    },
    footStyles: {
      fillColor: [229, 231, 235], // Gray
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

  // Salvar PDF
  const fileName = `Jornada360_Relatorio_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`;
  doc.save(fileName);
}
