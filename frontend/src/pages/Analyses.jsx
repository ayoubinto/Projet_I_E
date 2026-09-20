import { useEffect, useState } from "react";
import {
  BarChart3,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
    Filter,
    CalendarRange,
    RotateCcw,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import TypeDistributionChart from "../components/TypeDistributionChart";
import MonthlyOperationsChart from "../components/MonthlyOperationsChart";
import DestinationCountriesChart from "../components/DestinationCountriesChart";
import OriginCountriesChart from "../components/OriginCountriesChart";

import "./Analyses.css";
import StatusChart from "../components/StatusChart";
function Analyses() {
    const [operations, setOperations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    useEffect(() => {
      const fetchOperations = async () => {
        try {
          const response = await api.get("/operations/");
          setOperations(response.data);
        } catch (error) {
          console.error(error);
          setError("Impossible de charger les données d’analyse.");
        } finally {
          setLoading(false);
        }
      };

      fetchOperations();
    }, []);
    const filteredOperations = operations.filter((operation) => {
      const operationDate = operation.date_operation;

      const matchesType =
        typeFilter === "" ||
        operation.type_operation === typeFilter;

      const matchesStatus =
        statusFilter === "" ||
        operation.status === statusFilter;

      const matchesStartDate =
        startDate === "" ||
        (operationDate && operationDate >= startDate);

      const matchesEndDate =
        endDate === "" ||
        (operationDate && operationDate <= endDate);

      return (
        matchesType &&
        matchesStatus &&
        matchesStartDate &&
        matchesEndDate
      );
    });
    const resetFilters = () => {
        setTypeFilter("");
        setStatusFilter("");
        setStartDate("");
        setEndDate("");
    };

    const hasActiveFilters =
        typeFilter ||
        statusFilter ||
        startDate ||
        endDate;
    const totalOperations = filteredOperations.length;
    const totalImports = filteredOperations.filter(
      (operation) => operation.type_operation === "IMPORT"
    ).length;

    const totalExports = filteredOperations.filter(
      (operation) => operation.type_operation === "EXPORT"
    ).length;

    const totalDelivered = filteredOperations.filter(
      (operation) => operation.status === "LIVREE"
    ).length;
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar
          title="Analyses"
          subtitle="Analysez les performances de vos opérations import-export."
        />

        <main className="analyses-content">
          <section className="analyses-card">
            <div className="analyses-card-header">
              <div className="analyses-card-icon">
                <BarChart3 size={22} />
              </div>

              <div>
                <h2>Vue analytique</h2>
                <p>
                  Consultez les indicateurs et les statistiques de vos
                  opérations.
                </p>
              </div>
            </div>
              <div className="analytics-filters-bar">
                  <div className="analytics-filters-title">
                    <div className="analytics-filter-icon">
                      <Filter size={18} />
                    </div>

                    <div>
                      <strong>Filtres d’analyse</strong>
                      <span>
                        {filteredOperations.length} sur {operations.length} opération(s)
                      </span>
                    </div>
                  </div>

                  <div className="analytics-filters-controls">
                    <div className="analytics-date-filter">
                      <CalendarRange size={17} />

                      <input
                        type="date"
                        value={startDate}
                        max={endDate || undefined}
                        onChange={(event) => setStartDate(event.target.value)}
                        aria-label="Date de début"
                      />

                      <span>à</span>

                      <input
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(event) => setEndDate(event.target.value)}
                        aria-label="Date de fin"
                      />
                    </div>

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
                      <option value="PLANIFIEE">Planifiées</option>
                      <option value="EN_TRANSIT">En transit</option>
                      <option value="LIVREE">Livrées</option>
                      <option value="ANNULEE">Annulées</option>
                    </select>

                    <button
                      type="button"
                      className="analytics-reset-button"
                      onClick={resetFilters}
                      disabled={!hasActiveFilters}
                    >
                      <RotateCcw size={16} />
                      Réinitialiser
                    </button>
                  </div>
                </div>
            {loading && (
              <div className="analyses-placeholder">
                Chargement des données...
              </div>
            )}

            {error && (
              <div className="analyses-error">
                {error}
              </div>
            )}

           {!loading && !error && (
              <>
                <div className="analytics-stats-grid">
                  <AnalyticsCard
                    title="Total des opérations"
                    value={totalOperations}
                    icon={<Package size={21} />}
                  />

                  <AnalyticsCard
                    title="Importations"
                    value={totalImports}
                    icon={<ArrowDownToLine size={21} />}
                  />

                  <AnalyticsCard
                    title="Exportations"
                    value={totalExports}
                    icon={<ArrowUpFromLine size={21} />}
                  />

                  <AnalyticsCard
                    title="Opérations livrées"
                    value={totalDelivered}
                    icon={<CheckCircle2 size={21} />}
                  />
                </div>

                <div className="analytics-chart-card">
                  <div className="analytics-chart-header">
                    <h3>Répartition par statut</h3>
                    <p>Nombre d’opérations pour chaque statut.</p>
                  </div>

                  <div className="analytics-chart-container">
                    <StatusChart operations={filteredOperations} />
                  </div>
                </div>
                  <div className="analytics-charts-grid">
  <div className="analytics-chart-card">
    <div className="analytics-chart-header">
      <div>
        <h3>Importations et exportations</h3>
        <p>Répartition des opérations selon leur type.</p>
      </div>

      <span className="analytics-period-badge">
        Toutes les données
      </span>
    </div>

    <TypeDistributionChart operations={filteredOperations} />
  </div>

  <div className="analytics-chart-card analytics-chart-card--evolution">
    <div className="analytics-chart-header">
      <div>
        <h3>Évolution des opérations</h3>
        <p>Suivi mensuel des importations et exportations.</p>
      </div>
    </div>

    <div className="analytics-evolution-chart">
  <MonthlyOperationsChart operations={filteredOperations} />
</div>
  </div>
</div>
                  <div className="analytics-countries-grid">
                  <div className="analytics-chart-card">
                    <div className="analytics-chart-header">
                      <div>
                        <h3>Principaux pays d’origine</h3>
                        <p>
                          Les cinq pays à l’origine du plus grand nombre d’opérations.
                        </p>
                      </div>

                      <span className="analytics-period-badge">
                        Top 5
                      </span>
                    </div>

                    <div className="analytics-country-chart">
                      <OriginCountriesChart operations={filteredOperations} />
                    </div>
                  </div>

                  <div className="analytics-chart-card">
                    <div className="analytics-chart-header">
                      <div>
                        <h3>Principales destinations</h3>
                        <p>
                          Les cinq pays recevant le plus grand nombre d’opérations.
                        </p>
                      </div>

                      <span className="analytics-period-badge">
                        Top 5
                      </span>
                    </div>

                    <div className="analytics-country-chart">
                      <DestinationCountriesChart operations={filteredOperations} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>

  );
}
function AnalyticsCard({ title, value, icon }) {
  return (
    <div className="analytics-stat-card">
      <div className="analytics-stat-icon">
        {icon}
      </div>

      <div>
        <p>{title}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default Analyses;