import "../components/OperationsChart.css"
import {
    ArcElement,
    Chart as ChartJS,
    Legend,
    Tooltip,
}
from "chart.js";

import { Doughnut } from "react-chartjs-2";
ChartJS.register(ArcElement,Tooltip,Legend);

function OperationChart( {operations = []}){
    const importations = operations.filter(
        (operation) => operation.type_operation === "IMPORT"
    ).length;
    const exportations = operations.filter(
        (operation) => operation.type_operation === "EXPORT"
    ).length;

    const data = {
    labels: ["Importations", "Exportations"],
    datasets: [
      {
        data: [importations, exportations],
        backgroundColor: ["#22b8cf", "#10b981"],
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 4,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        enabled: true,
      },
    },

    cutout: "68%",
  };

  return (
      <section className="operations-chart">
          <div className="operations-chart-header">
              <h2>Répartitions des opérations</h2>
              <p>Comparaison entre les importations et les exportations</p>
          </div>
          <div className="operations-chart-container">
              <Doughnut data={data} options={options} />
          </div>
      </section>
  )
}

export default OperationChart;