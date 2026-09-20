"""services.py
→ charger le fichier .joblib
→ récupérer preprocessor
→ récupérer XGBoost
→ préparer une opération
→ faire la prédiction
"""

from pathlib import Path

import joblib
import pandas as pd
from django.conf import settings

MODEL_PATH = (
    Path(settings.BASE_DIR).parent
    / "ml"
    / "models"
    / "retard_xgboost.joblib"
)

bundle = joblib.load(MODEL_PATH)

model = bundle["model"]
preprocessor = bundle["preprocessor"]
features = bundle["features"]

def predict_retard(operation_data):
    operation_data= operation_data.copy()
    type_operation = operation_data["type_operation"]
    pays_origine = operation_data["pays_origine"]
    pays_destination = operation_data["pays_destination"]
    if type_operation == "IMPORT" and pays_destination != "Maroc":
        raise ValueError(
            "Pour une opération IMPORT, le pays de destination doit être le Maroc."
        )
    if type_operation == "EXPORT" and pays_origine != "Maroc":
        raise ValueError(
            "Pour une opération EXPORT, le pays d'origine doit être le Maroc."
        )
    distance = calculate_distance(
        operation_data["pays_origine"],
        operation_data["pays_destination"],
    )
    if distance is not None:
        operation_data["distance_km"] = distance

    df = pd.DataFrame([operation_data])
    df = df[features]
    data_processed = preprocessor.transform(df)
    prediction = model.predict(data_processed)[0]
    probabilite = model.predict_proba(data_processed)[0][1] * 100

    if probabilite < 30:
        niveau_risque = "FAIBLE"
    elif probabilite < 60:
        niveau_risque = "MOYEN"
    else:
        niveau_risque = "ELEVE"

    return {
        "prediction": int(prediction),
        "probabilite_retard" : round(float(probabilite), 2),
        "niveau_risque" : niveau_risque,
        "distance_km": distance
    }

DISTANCES_MAROC = {
    "France": 2000,
    "Espagne": 1000,
    "Allemagne": 2800,
    "Italie": 2200,
    "Belgique": 2500,
    "Pays-Bas": 2600,
    "Portugal": 900,
    "Royaume-Uni": 2300,
    "Chine": 10000,
    "Japon": 11500,
    "Corée du Sud": 11000,
    "Turquie": 4500,
    "États-Unis": 6500,
    "Canada": 6000,
    "Émirats arabes unis": 6000,
}

def calculate_distance(pays_origine, pays_destination):
    if pays_origine == "Maroc":
        return DISTANCES_MAROC.get(pays_destination)

    if pays_destination == "Maroc":
        return DISTANCES_MAROC.get(pays_origine)

    return None