import "./OperationsTable.css";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Pagination from "./Pagination";

const ELEMENTS_PAR_PAGE = 10;

function OperationsTable({ operations, onDelete }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const nombrePage = Math.ceil(operations.length / ELEMENTS_PAR_PAGE);

  // Si la liste change (suppression, filtre...) et que la page courante
  // n'existe plus, on revient sur la dernière page valide.
  useEffect(() => {
    if (currentPage > nombrePage) {
      setCurrentPage(Math.max(nombrePage, 1));
    }
  }, [nombrePage, currentPage]);

  if (operations.length === 0) {
    return (
      <div className="operations-empty">
        Aucune opération enregistrée.
      </div>
    );
  }

  const operationsPage = operations.slice(
    (currentPage - 1) * ELEMENTS_PAR_PAGE,
    currentPage * ELEMENTS_PAR_PAGE
  );

  return (
    <div className="all-operations-table-wrapper">
      <table className="all-operations-table">
        <thead>
          <tr>
            <th>Référence</th>
            <th>Type</th>
            <th>Produit</th>
            <th>Quantité</th>
            <th>Origine</th>
            <th>Destination</th>
            <th>Prix unitaire</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {operationsPage.map((operation) => (
            <tr key={operation.id}>
              <td className="operation-reference">
                {operation.reference}
              </td>

              <td>
                <span
                  className={`operation-table-badge type-${operation.type_operation.toLowerCase()}`}
                >
                  {operation.type_operation === "IMPORT"
                    ? "Importation"
                    : "Exportation"}
                </span>
              </td>

              <td>{operation.produit}</td>
              <td>{operation.quantite}</td>
              <td>{operation.pays_origine}</td>
              <td>{operation.pays_destination}</td>

              <td>
                {operation.prix_unitaire} {operation.devise}
              </td>

              <td>{operation.date_operation}</td>

              <td>
                <span
                  className={`operation-table-badge status-${operation.status.toLowerCase()}`}
                >
                  {operation.status.replaceAll("_", " ")}
                </span>
              </td>
              <td>
                <div className="operation-actions">
                  <button
                    type="button"
                    className="action-button action-view"
                    aria-label={`Consulter ${operation.reference}`}
                    onClick={() => navigate(`/operations/${operation.id}`)}
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    type="button"
                    className="action-button action-edit"
                    aria-label={`Modifier ${operation.reference}`}
                    onClick={() => navigate(`/operations/${operation.id}/edit`)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    className="action-button action-delete"
                    aria-label={`Supprimer ${operation.reference}`}
                    onClick={() => onDelete(operation.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="operations-pagination-wrapper">
        <Pagination
          nombrePage={nombrePage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default OperationsTable;
