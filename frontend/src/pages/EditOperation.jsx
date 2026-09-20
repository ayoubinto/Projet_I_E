import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  PencilLine,
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
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import "./EditOperation.css";

// Valeurs par défaut du formulaire
const INITIAL_FORM = {
  reference: "",
  type: "",
  produit: "",
  quantite: "",
  prixUnitaire: "",
  devise: "",
  statut: "",
  paysOrigine: "",
  paysDestination: "",
  dateOperation: "",
  dateLivraison: "",
};

export default function EditOperation() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Chargement de l'opération existante depuis l'API Django
  useEffect(() => {
    let isMounted = true;

    const fetchOperation = async () => {
      setPageLoading(true);
      setGeneralError("");

      try {
        const response = await api.get(`/operations/${id}/`);

        if (!isMounted) return;

        // Conversion des noms de champs Django vers les propriétés du formulaire React
        setForm({
          reference: response.data.reference || "",
          type: response.data.type_operation || "",
          produit: response.data.produit || "",
          quantite: response.data.quantite || "",
          prixUnitaire: response.data.prix_unitaire || "",
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

  // Met à jour un champ et efface son erreur ainsi que les messages généraux
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (generalError) setGeneralError("");
    if (successMessage) setSuccessMessage("");
  };

  // Règles de validation visuelle, identiques à AddOperation
  const validate = () => {
    const next = {};

    if (!form.reference.trim()) next.reference = "La référence est obligatoire.";
    if (!form.type) next.type = "Sélectionnez un type d'opération.";
    if (!form.produit.trim()) next.produit = "Le produit est obligatoire.";

    if (!form.quantite) next.quantite = "La quantité est obligatoire.";
    else if (Number(form.quantite) <= 0) next.quantite = "La quantité doit être supérieure à 0.";

    if (!form.prixUnitaire) next.prixUnitaire = "Le prix unitaire est obligatoire.";
    else if (Number(form.prixUnitaire) <= 0) next.prixUnitaire = "Le prix doit être supérieur à 0.";

    if (!form.devise) next.devise = "Sélectionnez une devise.";
    if (!form.statut) next.statut = "Sélectionnez un statut.";

    if (!form.paysOrigine.trim()) next.paysOrigine = "Le pays d'origine est obligatoire.";
    if (!form.paysDestination.trim()) next.paysDestination = "Le pays de destination est obligatoire.";

    if (!form.dateOperation) next.dateOperation = "La date de l'opération est obligatoire.";
    if (!form.dateLivraison) {
      next.dateLivraison = "La date de livraison est obligatoire.";
    } else if (form.dateOperation && form.dateLivraison < form.dateOperation) {
      next.dateLivraison = "La livraison ne peut pas précéder l'opération.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validate()) {
      setGeneralError("Merci de corriger les champs signalés avant d'enregistrer.");
      return;
    }

    setGeneralError("");
    setSaving(true);

    // Conversion des propriétés React vers les noms de champs attendus par Django
    const operationData = {
      reference: form.reference.trim(),
      type_operation: form.type,
      produit: form.produit.trim(),
      quantite: Number(form.quantite),
      prix_unitaire: Number(form.prixUnitaire),
      devise: form.devise,
      status: form.statut,
      pays_origine: form.paysOrigine.trim(),
      pays_destination: form.paysDestination.trim(),
      date_operation: form.dateOperation,
      date_livraison: form.dateLivraison,
    };

    try {
      await api.patch(`/operations/${id}/`, operationData);
      setSaving(false);
      setSuccessMessage("Opération modifiée avec succès.");

      setTimeout(() => {
        navigate("/operations");
      }, 800);
    } catch (error) {
      console.error(error.response?.data || error);
      setGeneralError("Impossible de modifier l'opération. Vérifiez les informations saisies.");
    }finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar
          title="Modifier l'opération"
          subtitle="Mettez à jour les informations de l'opération sélectionnée."
        />

        <main className="add-operation-content">
          <div className="operation-card">
            {/* En-tête de la carte */}
            <div className="card-header">
              <div className="card-header-icon">
                <PencilLine size={22} />
              </div>
              <div>
                <h2>
                  Modification de l'opération
                  {!pageLoading && form.reference && (
                    <span className="optional-tag">{form.reference}</span>
                  )}
                </h2>
                <p>Modifiez les informations nécessaires puis enregistrez les changements.</p>
              </div>
            </div>

            {/* Bandeau de messages généraux (erreur / succès) */}
            {generalError && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{generalError}</span>
              </div>
            )}
            {successMessage && (
              <div className="alert alert-success">
                <CheckCircle2 size={18} />
                <span>{successMessage}</span>
              </div>
            )}

            {pageLoading ? (
              <div className="page-loading">
                <Loader2 size={28} className="spin" />
                <span>Chargement de l'opération...</span>
              </div>
            ) : generalError && !form.reference ? (
                <div className="page-loading">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/operations")}
                  >
                    <ArrowLeft size={16} />
                    Retour aux opérations
                  </button>
                </div>
            ) : (
              <form className="operation-form" onSubmit={handleSubmit} noValidate>
                {/* ---------- Section 1 : Identification ---------- */}
                <section className="form-section">
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

                    <div className="fields-grid">
                      <Field
                        label="Référence de l'opération"
                        required
                        icon={<Hash size={16} />}
                        error={errors.reference}
                      >
                        <input
                          type="text"
                          placeholder="Ex : OP-2026-00145"
                          value={form.reference}
                          onChange={handleChange("reference")}
                          className={errors.reference ? "invalid" : ""}
                        />
                      </Field>

                      <Field
                        label="Type d'opération"
                        required
                        icon={<ArrowLeftRight size={16} />}
                        error={errors.type}
                      >
                        <select
                          value={form.type}
                          onChange={handleChange("type")}
                          className={errors.type ? "invalid" : ""}
                        >
                          <option value="">Sélectionner un type</option>
                          <option value="IMPORT">IMPORT</option>
                          <option value="EXPORT">EXPORT</option>
                        </select>
                      </Field>

                      <Field
                        label="Produit"
                        required
                        icon={<Box size={16} />}
                        error={errors.produit}
                        fullWidth
                      >
                        <input
                          type="text"
                          placeholder="Ex : Composants électroniques"
                          value={form.produit}
                          onChange={handleChange("produit")}
                          className={errors.produit ? "invalid" : ""}
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                {/* ---------- Section 2 : Informations commerciales ---------- */}
                <section className="form-section">
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

                    <div className="fields-grid">
                      <Field
                        label="Quantité"
                        required
                        icon={<Layers size={16} />}
                        error={errors.quantite}
                      >
                        <input
                          type="number"
                          min="1"
                          placeholder="Ex : 500"
                          value={form.quantite}
                          onChange={handleChange("quantite")}
                          className={errors.quantite ? "invalid" : ""}
                        />
                      </Field>

                      <Field
                        label="Prix unitaire"
                        required
                        icon={<Coins size={16} />}
                        error={errors.prixUnitaire}
                      >
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Ex : 120.50"
                          value={form.prixUnitaire}
                          onChange={handleChange("prixUnitaire")}
                          className={errors.prixUnitaire ? "invalid" : ""}
                        />
                      </Field>

                      <Field
                        label="Devise"
                        required
                        icon={<Wallet size={16} />}
                        error={errors.devise}
                      >
                        <select
                          value={form.devise}
                          onChange={handleChange("devise")}
                          className={errors.devise ? "invalid" : ""}
                        >
                          <option value="">Sélectionner une devise</option>
                          <option value="MAD">MAD</option>
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                        </select>
                      </Field>

                      <Field
                        label="Statut"
                        required
                        icon={<Activity size={16} />}
                        error={errors.statut}
                      >
                        <select
                          value={form.statut}
                          onChange={handleChange("statut")}
                          className={errors.statut ? "invalid" : ""}
                        >
                          <option value="">Sélectionner un statut</option>
                          <option value="PLANIFIEE">PLANIFIEE</option>
                          <option value="EN_TRANSIT">EN_TRANSIT</option>
                          <option value="LIVREE">LIVREE</option>
                          <option value="ANNULEE">ANNULEE</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                </section>

                {/* ---------- Section 3 : Transport et destination ---------- */}
                <section className="form-section form-section--last">
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

                    <div className="fields-grid">
                      <Field
                        label="Pays d'origine"
                        required
                        icon={<MapPin size={16} />}
                        error={errors.paysOrigine}
                      >
                        <input
                          type="text"
                          placeholder="Ex : Maroc"
                          value={form.paysOrigine}
                          onChange={handleChange("paysOrigine")}
                          className={errors.paysOrigine ? "invalid" : ""}
                        />
                      </Field>

                      <Field
                        label="Pays de destination"
                        required
                        icon={<Navigation size={16} />}
                        error={errors.paysDestination}
                      >
                        <input
                          type="text"
                          placeholder="Ex : Espagne"
                          value={form.paysDestination}
                          onChange={handleChange("paysDestination")}
                          className={errors.paysDestination ? "invalid" : ""}
                        />
                      </Field>

                      <Field
                        label="Date de l'opération"
                        required
                        icon={<CalendarDays size={16} />}
                        error={errors.dateOperation}
                      >
                        <input
                          type="date"
                          value={form.dateOperation}
                          onChange={handleChange("dateOperation")}
                          className={errors.dateOperation ? "invalid" : ""}
                        />
                      </Field>

                      <Field
                        label="Date de livraison"
                        required
                        icon={<CalendarCheck2 size={16} />}
                        error={errors.dateLivraison}
                      >
                        <input
                          type="date"
                          value={form.dateLivraison}
                          onChange={handleChange("dateLivraison")}
                          className={errors.dateLivraison ? "invalid" : ""}
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                {/* ---------- Actions ---------- */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/operations")}
                    disabled={saving}
                  >
                    <ArrowLeft size={16} />
                    Annuler
                  </button>

                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        Modification...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Enregistrer les modifications
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Petit composant utilitaire pour uniformiser label + icône + erreur
function Field({ label, required, icon, error, fullWidth, children }) {
  return (
    <div className={`field ${fullWidth ? "field--full" : ""}`}>
      <label>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className={`field-input ${error ? "field-input--error" : ""}`}>
        <span className="field-icon">{icon}</span>
        {children}
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
