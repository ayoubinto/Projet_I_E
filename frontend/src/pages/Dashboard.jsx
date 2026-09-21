import {useNavigate} from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx"
import Topbar from "../components/Topbar.jsx";
import StatCard from "../components/StatCard";
import RecentOperations from "../components/RecentOperations";
import OperationsChart from "../components/OperationsChart";
import {useEffect, useState} from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Truck,
} from "lucide-react";
import "./Dashboard.css"
import api from "../services/api.js";
function Dashboard(){
    const navigate = useNavigate()
    const [operations, setOperations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        const fetchOperations = async () =>{
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
        fetchOperations();
    }, []);
    const totalOperation = operations.length;
    const totalImportations = operations.filter(
        (operations) => operations.status  === "IMPORT"
    ).length
    const totalExportations = operations.filter(
        (operations) => operations.status  === "EXPORT"
    ).length
    const totalEnTransit = operations.filter(
        (operations) => operations.status  === "EN_TRANSIT"
    ).length
    return(
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Topbar />
                {error && <p className="dashboard-error">{error}</p>}
                <section className="dashboard-content">
                  <div className="stats-grid">
                    <StatCard
                      title="Total des opérations"
                      value={loading ? "..." : totalOperation}
                      icon={<Boxes size={25} />}
                      variant="blue"
                    />

                    <StatCard
                      title="Importations"
                      value={loading ? "..." : totalImportations}
                      icon={<ArrowDownToLine size={25} />}
                      variant="cyan"
                    />

                    <StatCard
                      title="Exportations"
                      value={loading ? "..." : totalExportations}
                      icon={<ArrowUpFromLine size={25} />}
                      variant="green"
                    />

                    <StatCard
                      title="En transit"
                      value={loading ? "..." : totalEnTransit}
                      icon={<Truck size={25} />}
                      variant="orange"
                    />
                  </div>
                  <OperationsChart operations={operations} />
                  <RecentOperations operations={operations} />
                </section>
            </main>
        </div>
    )
}

export default Dashboard;