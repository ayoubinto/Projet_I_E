import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  FileSearch,
  Hash,
  ArrowLeftRight,
  Box,
  Layers,
  Coins,
  Wallet,
  Activity,
  MapPin,
  Navigation,
  CalendarDays,
  CalendarCheck2,
  ArrowLeft,
  PencilLine,
  Loader2,
  AlertCircle,
} from "lucide-react";
import "./OperationDetails.css";

// Libellés lisibles + classe CSS associée pour chaque statut
const STATUT_CONFIG = {
  PLANIFIEE: { label: "Planifiée", className: "badge-planifiee" },
  EN_TRANSIT: { label: "En transit", className: "badge-transit" },
  LIVREE: { label: "Livrée", className: "badge-livree" },
  ANNULEE: { label: "Annulée", className: "badge-annulee" },
};

export default function OperationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [operation, setOperation] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [generalError, setGeneralError] = useState("");

  // Chargement de l'opération depuis l'API Django
  useEffect(() => {
    let isMounted = true;

    const fetchOperation = async () => {
      setPageLoading(true);
      setGeneralError("");

      try {
        const response = await api.get(`/operations/${id}/`);

        if (!isMounted) return;

        // Conversion des noms de champs Django vers les propriétés utilisées à l'affichage
        setOperation({
          reference: response.data.reference || "",
          type: response.data.type_operation || "",
          produit: response.data.produit || "",
          quantite: response.data.quantite ?? "",
          prixUnitaire: response.data.prix_unitaire ?? "",
          devise: response.data.devise || "",
          statut: response.data.status || "",
          paysOrigine: response.data.pays_origine || "",
          paysDestination: response.data.pays_destination || "",
          dateOperation: response.data.date_operation || "",
          dateLivraison: response.data.date_livraison || "",
        });
      } catch (error) {
        console.error(error.response?.data || error);
        if (isMounted) {
          setGeneralError("Impossible de charger cette opération.");
        }
      } finally {
        if (isMounted) setPageLoading(false);
      }
    };

    fetchOperation();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Formate une date ISO (YYYY-MM-DD) en format lisible fr-FR
  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Formate un montant avec la devise associée
  const formatMontant = (value, devise) => {
    if (value === "" || value === null || value === undefined) return "—";
    const nombre = Number(value).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${nombre} ${devise || ""}`.trim();
  };

  const statutInfo = operation ? STATUT_CONFIG[operation.statut] : null;
  const total =
    operation && operation.quantite !== "" && operation.prixUnitaire !== ""
      ? Number(operation.quantite) * Number(operation.prixUnitaire)
      : null;

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar
          title="Détails de l'opération"
          subtitle="Consultez les informations complètes de l'opération sélectionnée."
        />

        <main className="operation-details-content">
          <div className="details-card">
            {/* En-tête de la carte */}
            <div className="card-header">
              <div className="card-header-icon">
                <FileSearch size={22} />
              </div>
              <div className="card-header-text">
                <h2>
                  Informations de l'opération
                  {!pageLoading && operation?.reference && (
                    <span className="ref-tag">{operation.reference}</span>
                  )}
                </h2>
                <p>Vue d'ensemble en lecture seule de l'opération.</p>
              </div>
              {!pageLoading && statutInfo && (
                <span className={`status-badge ${statutInfo.className}`}>
                  {statutInfo.label}
                </span>
              )}
            </div>

            {/* Message d'erreur */}
            {generalError && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{generalError}</span>
              </div>
            )}

            {pageLoading ? (
              <div className="page-loading">
                <Loader2 size={28} className="spin" />
                <span>Chargement de l'opération...</span>
              </div>
            ) : (
              operation && (
                <>
                  {/* ---------- Section 1 : Identification ---------- */}
                  <section className="details-section">
                    <div className="section-marker">
                      <div className="marker-badge">
                        <Hash size={16} />
                      </div>
                      <div className="marker-line" />
                    </div>
                    <div className="section-body">
                      <div className="section-heading">
                        <h3>Identification</h3>
                        <p>Les repères qui identifient l'opération.</p>
                      </div>

                      <div className="details-grid">
                        <DetailItem
                          label="Référence de l'opération"
                          icon={<Hash size={16} />}
                          value={operation.reference}
                        />
                        <DetailItem
                          label="Type d'opération"
                          icon={<ArrowLeftRight size={16} />}
                          value={
                            operation.type ? (
                              <span
                                className={`type-badge ${
                                  operation.type === "IMPORT" ? "type-import" : "type-export"
                                }`}
                              >
                                {operation.type}
                              </span>
                            ) : (
                              "—"
                            )
                          }
                        />
                        <DetailItem
                          label="Produit"
                          icon={<Box size={16} />}
                          value={operation.produit}
                          fullWidth
                        />
                      </div>
                    </div>
                  </section>

                  {/* ---------- Section 2 : Informations commerciales ---------- */}
                  <section className="details-section">
                    <div className="section-marker">
                      <div className="marker-badge">
                        <Coins size={16} />
                      </div>
                      <div className="marker-line" />
                    </div>
                    <div className="section-body">
                      <div className="section-heading">
                        <h3>Informations commerciales</h3>
                        <p>Quantité, prix et suivi de l'opération.</p>
                      </div>

                      <div className="details-grid">
                        <DetailItem
                          label="Quantité"
                          icon={<Layers size={16} />}
                          value={operation.quantite !== "" ? operation.quantite : "—"}
                        />
                        <DetailItem
                          label="Prix unitaire"
                          icon={<Coins size={16} />}
                          value={formatMontant(operation.prixUnitaire, operation.devise)}
                        />
                        <DetailItem
                          label="Devise"
                          icon={<Wallet size={16} />}
                          value={operation.devise || "—"}
                        />
                        <DetailItem
                          label="Statut"
                          icon={<Activity size={16} />}
                          value={statutInfo ? statutInfo.label : "—"}
                        />
                        <DetailItem
                          label="Montant total"
                          icon={<Coins size={16} />}
                          value={total !== null ? formatMontant(total, operation.devise) : "—"}
                          fullWidth
                          highlight
                        />
                      </div>
                    </div>
                  </section>

                  {/* ---------- Section 3 : Transport et destination ---------- */}
                  <section className="details-section details-section--last">
                    <div className="section-marker">
                      <div className="marker-badge">
                        <Navigation size={16} />
                      </div>
                    </div>
                    <div className="section-body">
                      <div className="section-heading">
                        <h3>Transport et destination</h3>
                        <p>Le trajet et le calendrier de livraison.</p>
                      </div>

                      <div className="details-grid">
                        <DetailItem
                          label="Pays d'origine"
                          icon={<MapPin size={16} />}
                          value={operation.paysOrigine || "—"}
                        />
                        <DetailItem
                          label="Pays de destination"
                          icon={<Navigation size={16} />}
                          value={operation.paysDestination || "—"}
                        />
                        <DetailItem
                          label="Date de l'opération"
                          icon={<CalendarDays size={16} />}
                          value={formatDate(operation.dateOperation)}
                        />
                        <DetailItem
                          label="Date de livraison"
                          icon={<CalendarCheck2 size={16} />}
                          value={formatDate(operation.dateLivraison)}
                        />
                      </div>
                    </div>
                  </section>

                  {/* ---------- Actions ---------- */}
                  <div className="details-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate("/operations")}
                    >
                      <ArrowLeft size={16} />
                      Retour
                    </button>

                    <Link to={`/operations/${id}/edit`} className="btn btn-primary">
                      <PencilLine size={16} />
                      Modifier l'opération
                    </Link>
                  </div>
                </>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Petit composant utilitaire pour afficher un champ en lecture seule
function DetailItem({ label, icon, value, fullWidth, highlight }) {
  return (
    <div
      className={`detail-item ${fullWidth ? "detail-item--full" : ""} ${
        highlight ? "detail-item--highlight" : ""
      }`}
    >
      <span className="detail-label">
        <span className="detail-icon">{icon}</span>
        {label}
      </span>
      <span className="detail-value">{value}</span>
    </div>
  );
}
