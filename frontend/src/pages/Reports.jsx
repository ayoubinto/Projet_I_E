import { FileText, Filter, FileSpreadsheet,CalendarRange, RotateCcw } from "lucide-react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "./Reports.css";
import {useEffect, useState} from "react";
import api from "../services/api.js";

function Reports() {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("")
  const [type_operation,setType_operation] = useState("")
  const [status_o,setStatus] = useState("")
  const [date_d , setDate_d] = useState("")
  const [date_f, setDate_f] = useState("")
  const [reportFormat, setReportFormat] = useState("")
  useEffect(() => {
    const fetchAllOperation = async () => {
      try{
        const response = await api.get("/operations/");
        setOperations(response.data);
      }catch (e){
        console.error(e)
        setError("Impossible de charger les données")
      }finally {
        setLoading(false)
      }
    };
    fetchAllOperation();
  }, []);
  const filteredOperations = operations.filter((operation) => {
    const operationDate = operation.date_operation;
    const matchtype =
        type_operation === "" ||
        operation.type_operation === type_operation;

    const matchstatus =
        status_o === "" ||
        operation.status === status_o;

    const matchstrtdate =
        date_d === "" ||
        (operationDate && operationDate >= date_d);

    const matchfnldate =
        date_f === "" ||
        (operationDate && operationDate <= date_f);
    return (
            matchtype &&
            matchstatus &&
            matchstrtdate &&
            matchfnldate
    );
  });
  const resetFilters = () => {
        setType_operation("");
        setStatus("");
        setDate_d("");
        setDate_f("");
    };

  console.log(operations.length)
const generateCSV = () => {
    if (filteredOperations.length === 0) {
      return;
    }

    // Colonnes du fichier CSV
    const headers = [
      "Référence",
      "Type",
      "Produit",
      "Quantité",
      "Prix unitaire",
      "Devise",
      "Pays d'origine",
      "Pays de destination",
      "Date opération",
      "Date livraison",
      "Statut",
    ];

    // Protège les valeurs contenant ; " ou un retour à la ligne
    const escapeCSV = (value) => {
      if (value === null || value === undefined) {
        return "";
      }

      const text = String(value).replaceAll('"', '""');

      return `"${text}"`;
    };

    // Transformer chaque opération en ligne CSV
    const rows = filteredOperations.map((operation) => [
      operation.reference,
      operation.type_operation,
      operation.produit,
      operation.quantite,
      operation.prix_unitaire,
      operation.devise,
      operation.pays_origine,
      operation.pays_destination,
      operation.date_operation,
      operation.date_livraison || "",
      operation.status,
    ]);

    // Construction du contenu CSV
    const csvContent = [
      headers.map(escapeCSV).join(";"),
      ...rows.map((row) => row.map(escapeCSV).join(";")),
    ].join("\n");

    // BOM UTF-8 pour conserver correctement les accents dans Excel
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    // Création temporaire du lien de téléchargement
    const link = document.createElement("a");

    const today = new Date().toISOString().split("T")[0];

    link.href = url;
    link.download = `rapport_operations_${today}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
    const handleGenerateReport = () => {
    if (reportFormat === "CSV") {
      generateCSV();
    }
    if(reportFormat === "PDF"){
      generatePDF();
    }
};
const generatePDF = () => {
    if (filteredOperations.length === 0) {
      return;
    }

  // PDF A4 en mode paysage
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Titre
  doc.setFontSize(18);
  doc.setTextColor(11, 31, 58);
  doc.text("AYO TradeFlow", 14, 15);

  doc.setFontSize(14);
  doc.text("Rapport des opérations import-export", 14, 23);

  // Informations du rapport
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  doc.text(
    `Nombre d'opérations : ${filteredOperations.length}`,
    14,
    31
  );

  let filterText = "Filtres : ";

  filterText += type_operation
    ? `Type : ${type_operation} | `
    : "Tous les types | ";

  filterText += status_o
    ? `Statut : ${status_o} | `
    : "Tous les statuts | ";

  if (date_d || date_f) {
    filterText += `Période : ${date_d || "..."} - ${date_f || "..."}`;
  } else {
    filterText += "Toutes les périodes";
  }

  doc.text(filterText, 14, 37);

  // Colonnes du tableau
  const tableHead = [
    [
      "Référence",
      "Type",
      "Produit",
      "Quantité",
      "Prix",
      "Devise",
      "Origine",
      "Destination",
      "Date opération",
      "Livraison",
      "Statut",
    ],
  ];

  // Données
  const tableBody = filteredOperations.map((operation) => [
    operation.reference,
    operation.type_operation,
    operation.produit,
    operation.quantite,
    operation.prix_unitaire,
    operation.devise,
    operation.pays_origine,
    operation.pays_destination,
    operation.date_operation,
    operation.date_livraison || "-",
    operation.status.replaceAll("_", " "),
  ]);

  // Tableau
  autoTable(doc, {
    head: tableHead,
    body: tableBody,

    startY: 44,

    theme: "grid",

    styles: {
      fontSize: 7,
      cellPadding: 2.2,
      textColor: [51, 65, 85],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },

    headStyles: {
      fillColor: [11, 31, 58],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },

    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },

    margin: {
      left: 14,
      right: 14,
    },

    didDrawPage: () => {
      const pageNumber = doc.getNumberOfPages();

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      doc.text(
        `Page ${pageNumber}`,
        doc.internal.pageSize.getWidth() - 25,
        doc.internal.pageSize.getHeight() - 8
      );
    },
  });

  // Nom du fichier
  const today = new Date().toISOString().split("T")[0];

  doc.save(`rapport_operations_${today}.pdf`);
};
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar
          title="Rapports"
          subtitle="Générez et exportez les rapports de vos opérations import-export."
        />

        <main className="reports-content">
          <section className="reports-card">
            <div className="reports-card-header">
              <div className="reports-card-icon">
                <FileText size={22} />
              </div>

              <div>
                <h2>Centre de rapports</h2>
                <p>
                  Sélectionnez les données et le format du rapport à générer.
                </p>
              </div>
            </div>

            <div className="reports-filters">
              <div className="reports-filters-header">
                <div className="reports-filters-title">
                  <Filter size={18} />

                  <div>
                    <h3>Filtres du rapport</h3>

                    <p>
                      {filteredOperations.length} opération(s) sélectionnée(s) sur{" "}
                      {operations.length}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="reports-reset-button"
                  onClick={resetFilters}
                >
                  <RotateCcw size={15} />
                  Réinitialiser
                </button>
              </div>

              <div className="reports-filters-grid">
                <div className="report-filter-field">
                  <label>Type d'opération</label>

                  <select
                    value={type_operation}
                    onChange={(e) => setType_operation(e.target.value)}
                  >
                    <option value="">Tous les types</option>
                    <option value="IMPORT">Importations</option>
                    <option value="EXPORT">Exportations</option>
                  </select>
                </div>

                <div className="report-filter-field">
                  <label>Statut</label>

                  <select
                    value={status_o}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="PLANIFIEE">Planifiée</option>
                    <option value="EN_TRANSIT">En transit</option>
                    <option value="LIVREE">Livrée</option>
                    <option value="ANNULEE">Annulée</option>
                  </select>
                </div>

                <div className="report-filter-field">
                  <label>
                    <CalendarRange size={15} />
                    Date de début
                  </label>

                  <input
                    type="date"
                    value={date_d}
                    max={date_f || undefined}
                    onChange={(e) => setDate_d(e.target.value)}
                  />
                </div>

                <div className="report-filter-field">
                  <label>
                    <CalendarRange size={15} />
                    Date de fin
                  </label>

                  <input
                    type="date"
                    value={date_f}
                    min={date_d || undefined}
                    onChange={(e) => setDate_f(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="report-format-section">
              <div className="report-format-header">
                <h3>Format du rapport</h3>
                <p>Sélectionnez le format dans lequel vous souhaitez générer le rapport.</p>
              </div>

              <div className="report-format-options">
                <button
                  type="button"
                  className={`report-format-option ${
                    reportFormat === "CSV" ? "selected" : ""
                  }`}
                  onClick={() => setReportFormat("CSV")}
                >
                  <div className="report-format-icon">
                    <FileSpreadsheet size={24} />
                  </div>

                  <div>
                    <strong>CSV</strong>
                    <span>Exporter les données pour Excel ou l'analyse.</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`report-format-option ${
                    reportFormat === "PDF" ? "selected" : ""
                  }`}
                  onClick={() => setReportFormat("PDF")}
                >
                  <div className="report-format-icon">
                    <FileText size={24} />
                  </div>

                  <div>
                    <strong>PDF</strong>
                    <span>Générer un document professionnel prêt à partager.</span>
                  </div>
                </button>
              </div>
               <div className="report-generate-actions">
                  <button
                    type="button"
                    className="report-generate-button"
                    onClick={handleGenerateReport}
                    disabled={
                      !reportFormat ||
                      filteredOperations.length === 0
                    }
                  >
                    Générer le rapport
                  </button>
                </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Reports;