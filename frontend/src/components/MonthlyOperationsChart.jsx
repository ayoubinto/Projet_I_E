import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

function MonthlyOperationsChart({ operations }) {
  // Regrouper les opérations selon l'année et le mois : 2026-07
  const monthlyGroups = operations.reduce((result, operation) => {
    if (!operation.date_operation) {
      return result;
    }

    const monthKey = operation.date_operation.slice(0, 7);

    if (!result[monthKey]) {
      result[monthKey] = {
        imports: 0,
        exports: 0,
      };
    }

    if (operation.type_operation === "IMPORT") {
      result[monthKey].imports += 1;
    }

    if (operation.type_operation === "EXPORT") {
      result[monthKey].exports += 1;
    }

    return result;
  }, {});

  // Trier les clés comme 2026-01, 2026-02, 2026-03...
  const sortedMonths = Object.keys(monthlyGroups).sort();

  const labels = sortedMonths.map((monthKey) => {
    const [year, month] = monthKey.split("-");

    return new Intl.DateTimeFormat("fr-FR", {
      month: "short",
      year: "numeric",
    }).format(new Date(Number(year), Number(month) - 1, 1));
  });

  const importValues = sortedMonths.map(
    (monthKey) => monthlyGroups[monthKey].imports
  );

  const exportValues = sortedMonths.map(
    (monthKey) => monthlyGroups[monthKey].exports
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Importations",
        data: importValues,
        borderColor: "#0EA5E9",
        backgroundColor: "rgba(14, 165, 233, 0.10)",
        pointBackgroundColor: "#FFFFFF",
        pointBorderColor: "#0EA5E9",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
        tension: 0.38,
        fill: true,
      },
      {
        label: "Exportations",
        data: exportValues,
        borderColor: "#14B8A6",
        backgroundColor: "rgba(20, 184, 166, 0.08)",
        pointBackgroundColor: "#FFFFFF",
        pointBorderColor: "#14B8A6",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
        tension: 0.38,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          padding: 18,
          color: "#475569",
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
      tooltip: {
        backgroundColor: "#0B1F3A",
        titleColor: "#FFFFFF",
        bodyColor: "#E2E8F0",
        padding: 12,
        cornerRadius: 9,
        displayColors: true,
        callbacks: {
          label: (context) =>
            `${context.dataset.label} : ${context.raw} opération(s)`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#64748B",
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: "rgba(148, 163, 184, 0.18)",
        },
        ticks: {
          precision: 0,
          color: "#64748B",
          padding: 10,
          font: {
            size: 11,
          },
        },
      },
    },
  };

  if (sortedMonths.length === 0) {
    return (
      <div className="analytics-empty-chart">
        Aucune donnée disponible pour afficher l’évolution.
      </div>
    );
  }

  return <Line data={data} options={options} />;
}

export default MonthlyOperationsChart;