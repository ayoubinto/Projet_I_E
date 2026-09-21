import { useNavigate } from "react-router-dom";
import {
  PackagePlus,
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
  UploadCloud,
  FileText,
  X,
  ScanLine,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./AddOperation.css";
import {useState} from "react";
import api from "../services/api";
import axios from "axios";

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

export default function AddOperation() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // Import de fichier pour extraction automatique
  const [importedFile, setImportedFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [extractSuccess, setExtractSuccess] = useState("");
  const [extractProgress, setExtractProgress] = useState(0);
  const [extractStep, setExtractStep] = useState("");
  const ACCEPTED_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  const MAX_SIZE_MB = 10;
  const convertDate = (date) => {
    if (!date) return "";

    const parts = date.split("/");

    if (parts.length !== 3) return date;

    const [day, month, year] = parts;

    return `${year}-${month}-${day}`;
  };
  // Met à jour un champ et efface son erreur dès que l'utilisateur retape
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (generalError) setGeneralError("");
    if (successMessage) setSuccessMessage("");
  };
  // Validation + enregistrement du fichier choisi (drop ou input)
  const applyFile = (file) => {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setExtractError("Format non supporté. Utilisez PDF, image, CSV ou Excel.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setExtractError(`Le fichier dépasse la taille maximale de ${MAX_SIZE_MB} Mo.`);
      return;
    }

    setExtractError("");
    setImportedFile(file);
  };

  const handleFileInputChange = (e) => {
    applyFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    applyFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const removeImportedFile = () => {
    setImportedFile(null);
    setExtractError("");
    setExtractSuccess("");
  };

  // Déclenche l'extraction. Le branchement à l'API se fait ici plus tard :
  // remplacer le setTimeout par l'appel réel, puis pré-remplir "form" avec setForm({...})
  const handleExtract = async () => {
    if (!importedFile){
      setExtractError("Veuillez sélectionner un fichier.")
      return;
    }
    let progressInterval;
    try{
      setIsExtracting(true);
      setExtractError("");
      setExtractSuccess("");
      setExtractProgress(5);
      setExtractStep("Préparation du document...");

      const formData = new FormData();
      formData.append("file",importedFile);

      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      progressInterval = setInterval(() => {
        setExtractProgress((prev) => {
          if (prev >= 90) {
            return prev;
          }

          if (prev >= 60) {
            setExtractStep("Extraction intelligente des informations...");
          } else if (prev >= 30) {
            setExtractStep("Analyse du document...");
          }

          return prev + 2;
        });
      }, 400)
      console.log("Token :", token);
      const response = await api.post(
          "/operations/extract-document/",
          formData,
          {
            /*headers: {
              Authorization: `Bearer ${token}`,
            },*/
            onUploadProgress: (progressEvent) => {
              if (!progressEvent.total) return;

              const uploadPercentage =
                Math.round(
                  (progressEvent.loaded * 100) /
                  progressEvent.total
                );

              // L'upload représente les premiers 20 %
              const displayedProgress =
                Math.round(uploadPercentage * 0.2);

              setExtractProgress((prev) =>
                Math.max(prev, displayedProgress)
              );

              setExtractStep("Envoi du document...");
            },
          }
      );
      clearInterval(progressInterval);
      setExtractProgress(95);
      setExtractStep("Préparation du formulaire...");
      console.log("Résultat extraction : ",response.data);
      if(response.data.success){
        const data = response.data.data;
        setForm((prev) => ({
          ...prev,
              reference: data.reference_operation ?? "",
              type: data.type_operation ?? "",
              produit: data.produit ?? "",
              quantite: data.quantite ?? "",
              prixUnitaire: data.prix_unitaire ?? "",
              devise: data.devise ?? "",
              statut: data.statut ?? "",
              paysOrigine: data.pays_origine ?? "",
              paysDestination: data.pays_destination ?? "",
              dateOperation: convertDate(data.date_operation),
              dateLivraison: convertDate(data.date_livraison),
            }));
        setExtractProgress(100);
        setExtractStep("Extraction terminée.");
        setExtractSuccess("Informations extraites avec succès.");
        await new Promise((resolve) =>
          setTimeout(resolve, 600)
        );
      }
    }
    catch(error){
      clearInterval(progressInterval);
      console.error("Erreur extraction :", error);
      console.log("Réponse Django :", error.response?.data);
      console.log("Status :", error.response?.status);

      setExtractError(
        "Impossible d'extraire les informations du document."
      );
    }finally {
      setIsExtracting(false);
      setExtractProgress(0);
      setExtractStep("");
    }
  };
  // Règles de validation visuelle (pas d'appel API à ce stade)
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
    setGeneralError("");

    if (!validate()) {
      setGeneralError("Merci de corriger les champs signalés avant d'enregistrer.");
      return;
    }
    setLoading(true);
    const operationData = {
      reference: form.reference,
      type_operation: form.type,
      produit: form.produit,
      quantite: Number(form.quantite),
      prix_unitaire: Number(form.prixUnitaire),
      devise: form.devise,
      status: form.statut,
      pays_origine: form.paysOrigine,
      pays_destination: form.paysDestination,
      date_operation: form.dateOperation,
      date_livraison: form.dateLivraison,
    };
    try{
      await api.post("/operations/",operationData);
      setSuccessMessage("Opération enregistrée avec succés");
      setForm(INITIAL_FORM);
      setTimeout(()=> {
        navigate("/operations");
      },800);
    }catch(error){
      console.error("Erreur lors de la création : ",
          error.response?.data || error
      );
      setGeneralError( "Impossible d'enregistrer l'opération. Vérifiez les informations saisies.");
    }finally {
      setLoading(false)
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar
          title="Nouvelle opération"
          subtitle="Enregistrez une nouvelle opération d'importation ou d'exportation."
        />

        <main className="add-operation-content">
          <div className="operation-card">
            {/* En-tête de la carte */}
            <div className="card-header">
              <div className="card-header-icon">
                <PackagePlus size={22} />
              </div>
              <div>
                <h2>Informations de l'opération</h2>
                <p>Renseignez les informations nécessaires avant l'enregistrement.</p>
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
            {/* ---------- Import automatique ---------- */}
            <div className="import-zone-wrapper">
              <div className="section-heading">
                <h3>Import automatique <span className="optional-tag">Optionnel</span></h3>
                <p>Vous pouvez importer un document pour pré-remplir automatiquement le formulaire,
                    ou passer cette étape et saisir les informations manuellement.</p>
              </div>

              {!importedFile ? (
                <label
                  className={`import-dropzone ${isDragActive ? "import-dropzone--active" : ""}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <UploadCloud size={26} />
                  <span className="import-dropzone-title">
                    Glissez-déposez un fichier ici, ou cliquez pour parcourir
                  </span>
                  <span className="import-dropzone-hint">Facultatif — PDF, PNG, JPG, CSV, XLSX — 10 Mo max</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.csv"
                    onChange={handleFileInputChange}
                    hidden
                  />
                </label>
              ) : (
                <div className="import-file-chip">
                  <FileText size={18} />
                  <span className="import-file-name">{importedFile.name}</span>
                  <button
                    type="button"
                    className="import-file-remove"
                    onClick={removeImportedFile}
                    aria-label="Retirer le fichier"
                  >
                    <X size={16} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-extract"
                    onClick={handleExtract}
                    disabled={isExtracting}
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        Extraction...
                      </>
                    ) : (
                      <>
                        <ScanLine size={16} />
                        Extraire les informations
                      </>
                    )}
                  </button>
                </div>
              )}

              {extractError && (
                <div className="alert alert-error import-alert">
                  <AlertCircle size={18} />
                  <span>{extractError}</span>
                </div>
              )}
              {extractSuccess && (
                  <div className="alert alert-success import-alert">
                    <span>{extractSuccess}</span>
                  </div>
              )}
            </div>
            {/* Popup de progression */}
            {isExtracting && (
              <div className="extract-modal-overlay">
                <div className="extract-modal">

                  <Loader2
                    size={36}
                    className="spin extract-modal-icon"
                  />

                  <h3>Analyse du document</h3>

                  <p>{extractStep}</p>

                  <div className="extract-progress">
                    <div
                      className="extract-progress-bar"
                      style={{
                        width: `${extractProgress}%`,
                      }}
                    />
                  </div>

                  <div className="extract-progress-value">
                    {extractProgress} %
                  </div>

                  <span className="extract-modal-hint">
                    Veuillez patienter pendant l'extraction des informations.
                  </span>

                </div>
              </div>
            )}
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
                  disabled={loading}
                >
                  <ArrowLeft size={16} />
                  Annuler
                </button>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Enregistrer l'opération
                    </>
                  )}
                </button>
              </div>
            </form>
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
