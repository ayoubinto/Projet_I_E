import { useState , useEffect} from "react";
import { predictRetard, getPredictionHistory } from "../services/predictionService";
import "./Predictions.css";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

function Predictions() {
    const [formData, setFormData] = useState({
        type_operation: "IMPORT",
        categorie_produit: "ELECTRONIQUE",
        quantite: "",
        prix_unitaire: "",
        devise: "EUR",
        pays_origine: "",
        pays_destination: "Maroc",
        mode_transport: "MARITIME",
        distance_km: "",
        poids_kg: "",
        niveau_douane: "MOYEN",
        priorite: "NORMALE",
        saison: "ETE",
        duree_prevue_jours: ""
    });
    const DISTANCES_MAROC = {
        Espagne: 1000,
        Portugal: 900,
        France: 2000,
        Italie: 2200,
        "Royaume-Uni": 2300,
        Belgique: 2500,
        "Pays-Bas": 2600,
        Allemagne: 2800,
        Turquie: 4500,
        Canada: 6000,
        "Émirats arabes unis": 6000,
        "États-Unis": 6500,
        Chine: 10000,
        "Corée du Sud": 11000,
        Japon: 11500
    };

    const calculateDistance = (origine, destination) => {
        if( origine === "Maroc"){
            return DISTANCES_MAROC[destination] || "";
        }

        if (destination === "Maroc"){
            return DISTANCES_MAROC[origine] || "";
        }

        return "";
    }
    const [resultat, setResultat] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [history, setHistory] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: value
            };

            if(name === "type_operation"){
                if(value === "IMPORT"){
                    updated.pays_destination = "Maroc";
                    updated.pays_origine = "";
                }
                if(value === "EXPORT"){
                    updated.pays_origine = "Maroc";
                    updated.pays_destination = "";
                }
                updated.distance_km = "";
            }

            if(
                name === "pays_origine" ||
                name === "pays_destination"
            ){
                updated.distance_km = calculateDistance(
                    updated.pays_origine,
                    updated.pays_destination,
                );
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setResultat(null);

        try {
            const dataToSend = {
                ...formData,
                quantite: Number(formData.quantite),
                prix_unitaire: Number(formData.prix_unitaire),
                distance_km: Number(formData.distance_km),
                poids_kg: Number(formData.poids_kg),
                duree_prevue_jours: Number(formData.duree_prevue_jours)
            };

            const data = await predictRetard(dataToSend);

            setResultat(data);
            await loadHistory();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.error ||
                "Une erreur est survenue lors de la prédiction."
            );
        } finally {
            setLoading(false);
        }
    };

    const getRiskClass = (niveau) => {
        if (niveau === "FAIBLE") {
            return "risk-low";
        }

        if (niveau === "MOYEN") {
            return "risk-medium";
        }

        if (niveau === "ELEVE") {
            return "risk-high";
        }

        return "";
    };
    const loadHistory = async () => {
        try {
            const data = await getPredictionHistory();
            setHistory(data);
        } catch (err) {
            console.error(
                "Erreur lors du chargement de l'historique :",
                err
            );
        }
    };
    useEffect(() => {
        loadHistory();
    }, []);
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-main">
                <Topbar
                title="Prédiction IA"
                subtitle="Analysez le risque de retard d'une opération
                                import-export grâce au modèle XGBoost."
                />
                <div className="predictions-page">

                    <div className="prediction-card">

                        <h2>Informations de l'opération</h2>

                        <form onSubmit={handleSubmit}>

                            <div className="prediction-form-grid">

                                <div className="form-group">
                                    <label>Type d'opération</label>

                                    <select
                                        name="type_operation"
                                        value={formData.type_operation}
                                        onChange={handleChange}
                                    >
                                        <option value="IMPORT">Import</option>
                                        <option value="EXPORT">Export</option>
                                    </select>
                                </div>


                                <div className="form-group">
                                    <label>Catégorie du produit</label>

                                    <select
                                        name="categorie_produit"
                                        value={formData.categorie_produit}
                                        onChange={handleChange}
                                    >
                                        <option value="ELECTRONIQUE">
                                            Électronique
                                        </option>

                                        <option value="TEXTILE">
                                            Textile
                                        </option>

                                        <option value="ALIMENTAIRE">
                                            Alimentaire
                                        </option>

                                        <option value="AUTOMOBILE">
                                            Automobile
                                        </option>

                                        <option value="PHARMACEUTIQUE">
                                            Pharmaceutique
                                        </option>

                                        <option value="MACHINES">
                                            Machines
                                        </option>

                                        <option value="COSMETIQUE">
                                            Cosmétique
                                        </option>

                                        <option value="AGRICOLE">
                                            Agricole
                                        </option>

                                        <option value="MATERIAUX_CONSTRUCTION">
                                            Matériaux de construction
                                        </option>

                                        <option value="EQUIPEMENT_MEDICAL">
                                            Équipement médical
                                        </option>
                                    </select>
                                </div>


                                <div className="form-group">
                                    <label>Quantité</label>

                                    <input
                                        type="number"
                                        name="quantite"
                                        value={formData.quantite}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Prix unitaire</label>

                                    <input
                                        type="number"
                                        name="prix_unitaire"
                                        value={formData.prix_unitaire}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Devise</label>

                                    <select
                                        name="devise"
                                        value={formData.devise}
                                        onChange={handleChange}
                                    >
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                        <option value="MAD">MAD</option>
                                    </select>
                                </div>


                                <div className="form-group">
                                    <label>Pays d'origine</label>

                                    <select
                                        name="pays_origine"
                                        value={formData.pays_origine}
                                        onChange={handleChange}
                                        disabled={formData.type_operation === "EXPORT"}
                                        required
                                    >
                                        <option value="">
                                            Sélectionner
                                        </option>

                                        <option value="Maroc">Maroc</option>
                                        <option value="France">France</option>
                                        <option value="Espagne">Espagne</option>
                                        <option value="Allemagne">Allemagne</option>
                                        <option value="Italie">Italie</option>
                                        <option value="Belgique">Belgique</option>
                                        <option value="Pays-Bas">Pays-Bas</option>
                                        <option value="Portugal">Portugal</option>
                                        <option value="Royaume-Uni">Royaume-Uni</option>
                                        <option value="Chine">Chine</option>
                                        <option value="Japon">Japon</option>
                                        <option value="Corée du Sud">Corée du Sud</option>
                                        <option value="Turquie">Turquie</option>
                                        <option value="États-Unis">États-Unis</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Émirats arabes unis">
                                            Émirats arabes unis
                                        </option>
                                    </select>
                                </div>


                                <div className="form-group">
                                    <label>Pays de destination</label>

                                    <select
                                        name="pays_destination"
                                        value={formData.pays_destination}
                                        onChange={handleChange}
                                        disabled={formData.type_operation === "IMPORT"}
                                        required
                                    >
                                        <option value="">
                                            Sélectionner
                                        </option>

                                        <option value="Maroc">Maroc</option>
                                        <option value="France">France</option>
                                        <option value="Espagne">Espagne</option>
                                        <option value="Allemagne">Allemagne</option>
                                        <option value="Italie">Italie</option>
                                        <option value="Belgique">Belgique</option>
                                        <option value="Pays-Bas">Pays-Bas</option>
                                        <option value="Portugal">Portugal</option>
                                        <option value="Royaume-Uni">Royaume-Uni</option>
                                        <option value="Chine">Chine</option>
                                        <option value="Japon">Japon</option>
                                        <option value="Corée du Sud">Corée du Sud</option>
                                        <option value="Turquie">Turquie</option>
                                        <option value="États-Unis">États-Unis</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Émirats arabes unis">
                                            Émirats arabes unis
                                        </option>
                                    </select>
                                </div>


                                <div className="form-group">
                                    <label>Mode de transport</label>

                                    <select
                                        name="mode_transport"
                                        value={formData.mode_transport}
                                        onChange={handleChange}
                                    >
                                        <option value="MARITIME">
                                            Maritime
                                        </option>

                                        <option value="ROUTIER">
                                            Routier
                                        </option>

                                        <option value="AERIEN">
                                            Aérien
                                        </option>
                                    </select>
                                </div>


                                <div className="form-group">
                                    <label>Distance (km)</label>

                                    <input
                                        type="number"
                                        name="distance_km"
                                        value={formData.distance_km}
                                        readOnly
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Poids (kg)</label>

                                    <input
                                        type="number"
                                        name="poids_kg"
                                        value={formData.poids_kg}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>


                                <div className="form-group">
                                    <label>Niveau de douane</label>

                                    <select
                                        name="niveau_douane"
                                        value={formData.niveau_douane}
                                        onChange={handleChange}
                                    >
                                        <option value="FAIBLE">
                                            Faible
                                        </option>

                                        <option value="MOYEN">
                                            Moyen
                                        </option>

                                        <option value="ELEVE">
                                            Élevé
                                        </option>
                                    </select>
                                </div>


                                <div className="form-group">
                                    <label>Priorité</label>

                                    <select
                                        name="priorite"
                                        value={formData.priorite}
                                        onChange={handleChange}
                                    >
                                        <option value="NORMALE">
                                            Normale
                                        </option>

                                        <option value="URGENTE">
                                            Urgente
                                        </option>
                                    </select>
                                </div>


                                <div className="form-group">
                                    <label>Saison</label>

                                    <select
                                        name="saison"
                                        value={formData.saison}
                                        onChange={handleChange}
                                    >
                                        <option value="HIVER">
                                            Hiver
                                        </option>

                                        <option value="PRINTEMPS">
                                            Printemps
                                        </option>

                                        <option value="ETE">
                                            Été
                                        </option>

                                        <option value="AUTOMNE">
                                            Automne
                                        </option>
                                    </select>
                                </div>


                                <div className="form-group">
                                    <label>Durée prévue (jours)</label>

                                    <input
                                        type="number"
                                        name="duree_prevue_jours"
                                        value={formData.duree_prevue_jours}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                    />
                                </div>

                            </div>


                            <button
                                type="submit"
                                disabled={loading}
                                className="prediction-button"
                            >
                                {loading
                                    ? "Analyse en cours..."
                                    : "Analyser le risque"}
                            </button>

                        </form>


                        {error && (
                            <div className="prediction-error">
                                {error}
                            </div>
                        )}


                        {resultat && (
                            <div className="prediction-result">

                                <div className="result-header">
                                    <h2>Résultat de l'analyse</h2>

                                    <span
                                        className={`risk-badge ${getRiskClass(
                                            resultat.niveau_risque
                                        )}`}
                                    >
                                        {resultat.niveau_risque}
                                    </span>
                                </div>


                                <div className="result-grid">

                                    <div className="result-box">
                                        <span className="result-label">
                                            Prédiction
                                        </span>

                                        <strong>
                                            {resultat.prediction === 1
                                                ? "Retard probable"
                                                : "À temps"}
                                        </strong>
                                    </div>


                                    <div className="result-box">
                                        <span className="result-label">
                                            Probabilité de retard
                                        </span>

                                        <strong className="probability-value">
                                            {resultat.probabilite_retard} %
                                        </strong>
                                    </div>


                                    <div className="result-box">
                                        <span className="result-label">
                                            Niveau de risque
                                        </span>

                                        <strong>
                                            {resultat.niveau_risque}
                                        </strong>
                                    </div>

                                </div>


                                <div className="risk-progress">
                                    <div
                                        className="risk-progress-bar"
                                        style={{
                                            width: `${Math.min(
                                                resultat.probabilite_retard,
                                                100
                                            )}%`
                                        }}
                                    />
                                </div>

                            </div>
                        )}

                        <div className="prediction-history">
                            <div className="history-header">
                                <div>
                                    <h2>Historique des prédictions</h2>
                                    <p>Dernières analyses de risque enregistrées.</p>
                                </div>
                            </div>

                            {history.length === 0 ? (
                                <p className="history-empty">
                                    Aucune prédiction enregistrée.
                                </p>
                            ) : (
                                <div className="history-table-wrapper">
                                    <table className="history-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Trajet</th>
                                                <th>Transport</th>
                                                <th>Probabilité</th>
                                                <th>Risque</th>
                                                <th>Prédiction</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {history.map((item) => (
                                                <tr key={item.id}>
                                                    <td>
                                                        {new Date(
                                                            item.created_at
                                                        ).toLocaleString("fr-FR")}
                                                    </td>

                                                    <td>
                                                        {item.input_data.type_operation}
                                                    </td>

                                                    <td>
                                                        {item.input_data.pays_origine}
                                                        {" → "}
                                                        {item.input_data.pays_destination}
                                                    </td>

                                                    <td>
                                                        {item.input_data.mode_transport}
                                                    </td>

                                                    <td className="history-probability">
                                                        {item.probabilite_retard} %
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`risk-badge ${getRiskClass(
                                                                item.niveau_risque
                                                            )}`}
                                                        >
                                                            {item.niveau_risque}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {item.prediction === 1
                                                            ? "Retard probable"
                                                            : "À temps"}
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="history-details-btn"
                                                            onClick={() => setSelectedHistory(item)}
                                                        >
                                                            Voir détails
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {selectedHistory && (
                                <div className="history-modal-overlay">
                                    <div className="history-modal">

                                        <div className="history-modal-header">
                                            <div>
                                                <h2>Détails de la prédiction</h2>

                                                <p>
                                                    {new Date(
                                                        selectedHistory.created_at
                                                    ).toLocaleString("fr-FR")}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                className="history-modal-close"
                                                onClick={() => setSelectedHistory(null)}
                                            >
                                                ×
                                            </button>
                                        </div>


                                        <div className="history-modal-result">

                                            <div>
                                                <span>Prédiction</span>
                                                <strong>
                                                    {selectedHistory.prediction === 1
                                                        ? "Retard probable"
                                                        : "À temps"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Probabilité</span>
                                                <strong>
                                                    {selectedHistory.probabilite_retard} %
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Niveau de risque</span>

                                                <strong
                                                    className={`risk-badge ${getRiskClass(
                                                        selectedHistory.niveau_risque
                                                    )}`}
                                                >
                                                    {selectedHistory.niveau_risque}
                                                </strong>
                                            </div>

                                        </div>


                                        <div className="history-modal-grid">

                                            <div>
                                                <span>Type d'opération</span>
                                                <strong>
                                                    {selectedHistory.input_data.type_operation}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Catégorie</span>
                                                <strong>
                                                    {selectedHistory.input_data.categorie_produit}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Quantité</span>
                                                <strong>
                                                    {selectedHistory.input_data.quantite}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Prix unitaire</span>
                                                <strong>
                                                    {selectedHistory.input_data.prix_unitaire}
                                                    {" "}
                                                    {selectedHistory.input_data.devise}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Pays d'origine</span>
                                                <strong>
                                                    {selectedHistory.input_data.pays_origine}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Pays de destination</span>
                                                <strong>
                                                    {selectedHistory.input_data.pays_destination}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Mode de transport</span>
                                                <strong>
                                                    {selectedHistory.input_data.mode_transport}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Distance</span>
                                                <strong>
                                                    {selectedHistory.input_data.distance_km} km
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Poids</span>
                                                <strong>
                                                    {selectedHistory.input_data.poids_kg} kg
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Niveau de douane</span>
                                                <strong>
                                                    {selectedHistory.input_data.niveau_douane}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Priorité</span>
                                                <strong>
                                                    {selectedHistory.input_data.priorite}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Saison</span>
                                                <strong>
                                                    {selectedHistory.input_data.saison}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Durée prévue</span>
                                                <strong>
                                                    {selectedHistory.input_data.duree_prevue_jours} jours
                                                </strong>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>

    );
}

export default Predictions;