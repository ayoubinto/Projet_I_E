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

function StatusChart({ operations }) {
  const planifiees = operations.filter(
    (operation) => operation.status === "PLANIFIEE"
  ).length;

  const enTransit = operations.filter(
    (operation) => operation.status === "EN_TRANSIT"
  ).length;

  const livrees = operations.filter(
    (operation) => operation.status === "LIVREE"
  ).length;

  const annulees = operations.filter(
    (operation) => operation.status === "ANNULEE"
  ).length;

  const data = {
    labels: ["Planifiées", "En transit", "Livrées", "Annulées"],
    datasets: [
      {
        label: "Nombre d’opérations",
        data: [planifiees, enTransit, livrees, annulees],
        backgroundColor: [
          "#8B5CF6",
          "#F97316",
          "#10B981",
          "#EF4444",
        ],
        borderRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}

export default StatusChart;