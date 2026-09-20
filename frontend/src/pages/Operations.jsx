import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import OperationsTable from "../components/OperationsTable";
import { Search } from "lucide-react";
import "../pages/Operations.css"
import {useEffect, useState} from "react";
import api from "../services/api.js";
function Operations(){
    const [operations, setOperations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    useEffect(() => {
        const fetchOperation = async () => {
            try{
                const response = await api.get("/operations/");
                setOperations(response.data)
            }catch(error){
                console.error(error)
                setError("Impossible de charger les opérations")
            }finally {
                setLoading(false)
            }
        }
        fetchOperation();
    }, []);
    const handleDelete = async (operationId) => {
        const confirmed = window.confirm(
            "Voulez-vous vraiment supprimer cette opération ?"
        );
        if(!confirmed){
            return;
        }
        try{
            await api.delete(`/operations/${operationId}/`);
            setOperations((currentOperations) =>
            currentOperations.filter(
                (operation) => operation.id !== operationId
            ));
        }catch(error){
            console.error(error);
            setError("Impossible de supprimer cette opération");
        }
    };
    const filteredOperations = operations.filter((operation) => {
        const searchValue = searchTerm.toLowerCase().trim();
        const matchSearch =
            operation.reference?.toLowerCase().includes(searchValue) ||
            operation.produit?.toLowerCase().includes(searchValue) ||
            operation.pays_origine?.toLowerCase().includes(searchValue) ||
            operation.pays_destination?.toLowerCase().includes(searchValue) ||
            operation.type_operation?.toLowerCase().includes(searchValue) ||
            operation.status?.toLowerCase().includes(searchValue);
        const matchesType =
            typeFilter === "" || operation.type_operation === typeFilter;
        const matchesStatus =
            statusFilter === "" || operation.status === statusFilter;

        return matchesStatus && matchSearch && matchesType;
    });
    return(
        <div className="operations-layout">
      <Sidebar />

      <main className="operations-main">
        <Topbar
          title="Opérations"
          subtitle="Consultez et gérez vos opérations import-export."
        />

       <section className="operations-content">
          <h2>Liste des opérations</h2>

          {loading && <p>Chargement des opérations...</p>}

          {error && <p className="operations-error">{error}</p>}
           <div className="operations-toolbar">
              <div className="operations-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Rechercher une opération..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

               <div className="operations-filters">
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                  >
                    <option value="">Tous les types</option>
                    <option value="IMPORT">Importations</option>
                    <option value="EXPORT">Exportations</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="PLANIFIEE">Planifiée</option>
                    <option value="EN_TRANSIT">En transit</option>
                    <option value="LIVREE">Livrée</option>
                    <option value="ANNULEE">Annulée</option>
                  </select>
                </div>

              <span className="operations-count">
                {filteredOperations.length} opération(s)
              </span>
            </div>
          {!loading && !error && (
            <OperationsTable
                operations={filteredOperations}
                onDelete={handleDelete}
            />
          )}
        </section>
      </main>
    </div>
    );
}

export default Operations;