import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function DestinationCountriesChart({ operations }) {
  // Compter le nombre d'opérations par pays de destination
  const destinationCounts = operations.reduce((result, operation) => {
    const country = operation.pays_destination?.trim();

    if (!country) {
      return result;
    }

    result[country] = (result[country] || 0) + 1;

    return result;
  }, {});

  // Trier les pays et conserver uniquement les cinq premiers
  const topDestinations = Object.entries(destinationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const labels = topDestinations.map(([country]) => country);
  const values = topDestinations.map(([, count]) => count);

  const data = {
    labels,
    datasets: [
      {
        label: "Nombre d’opérations",
        data: values,
        backgroundColor: [
          "#0EA5E9",
          "#14B8A6",
          "#6366F1",
          "#8B5CF6",
          "#F59E0B",
        ],
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 25,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0B1F3A",
        titleColor: "#FFFFFF",
        bodyColor: "#E2E8F0",
        padding: 12,
        cornerRadius: 9,

        callbacks: {
          label: (context) =>
            `${context.raw} opération(s) vers cette destination`,
        },
      },
    },

    scales: {
      x: {
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
          font: {
            size: 11,
          },
        },
      },

      y: {
        border: {
          display: false,
        },

        grid: {
          display: false,
        },

        ticks: {
          color: "#334155",
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
    },
  };

  if (topDestinations.length === 0) {
    return (
      <div className="analytics-empty-chart">
        Aucune destination disponible.
      </div>
    );
  }

  return <Bar data={data} options={options} />;
}

export default DestinationCountriesChart;