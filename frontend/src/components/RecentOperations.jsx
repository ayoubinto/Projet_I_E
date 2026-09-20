import "../components/RecentOperations.css"
function RecentOperations({operations}){
    const recentOperations = operations.slice(0,5);
    return(
        <section className="recent-operations">
      <div className="recent-operations-header">
        <div>
          <h2>Opérations récentes</h2>
          <p>Les cinq dernières opérations enregistrées</p>
        </div>

        <button type="button">
          Voir toutes
        </button>
      </div>

      <div className="operations-table-wrapper">
        <table className="operations-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Type</th>
              <th>Produit</th>
              <th>Destination</th>
              <th>Date</th>
              <th>Statut</th>
            </tr>
          </thead>

          <tbody>
            {recentOperations.map((operation) => (
              <tr key={operation.id}>
                <td>{operation.reference}</td>
                <td>
                  <span
                    className={`operation-badge type-${operation.type_operation.toLowerCase()}`}
                  >
                    {operation.type_operation === "IMPORT" ? "Importation" : "Exportation"}
                  </span>
                </td>
                <td>{operation.produit}</td>
                <td>{operation.pays_destination}</td>
                <td>{operation.date_operation}</td>
                <td>
                  <span
                    className={`operation-badge status-${operation.status.toLowerCase()}`}
                  >
                    {operation.status.replaceAll("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {recentOperations.length === 0 && (
          <p className="empty-operations">
            Aucune opération disponible.
          </p>
        )}
      </div>
    </section>
    );
}


export default RecentOperations;