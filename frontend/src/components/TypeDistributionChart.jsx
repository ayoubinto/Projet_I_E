import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

function TypeDistributionChart({ operations }) {
  const imports = operations.filter(
    (operation) => operation.type_operation === "IMPORT"
  ).length;

  const exports = operations.filter(
    (operation) => operation.type_operation === "EXPORT"
  ).length;

  const total = imports + exports;

  const importPercentage =
    total > 0 ? Math.round((imports / total) * 100) : 0;

  const exportPercentage =
    total > 0 ? Math.round((exports / total) * 100) : 0;

  const data = {
    labels: ["Importations", "Exportations"],
    datasets: [
      {
        data: [imports, exports],
        backgroundColor: ["#0EA5E9", "#14B8A6"],
        borderColor: "#FFFFFF",
        borderWidth: 5,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "74%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label} : ${context.raw} opération(s)`,
        },
      },
    },
  };

  return (
    <div className="type-chart-layout">
      <div className="type-chart-canvas">
        <Doughnut data={data} options={options} />

        <div className="type-chart-center">
          <span>Total</span>
          <strong>{total}</strong>
        </div>
      </div>

      <div className="type-chart-details">
        <div className="type-chart-item">
          <div className="type-chart-item-label">
            <span className="chart-dot chart-dot--import" />
            <span>Importations</span>
          </div>

          <div>
            <strong>{imports}</strong>
            <small>{importPercentage}%</small>
          </div>
        </div>

        <div className="type-chart-item">
          <div className="type-chart-item-label">
            <span className="chart-dot chart-dot--export" />
            <span>Exportations</span>
          </div>

          <div>
            <strong>{exports}</strong>
            <small>{exportPercentage}%</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypeDistributionChart;