import random
import csv
from pathlib import Path
from datetime import datetime, timedelta

random.seed(42)
N_ROWS = 20000
START_DATE = datetime(2022, 1, 1)
END_DATE = datetime(2025, 12, 31)
COUNTRIES = [
    "Maroc",
    "France",
    "Espagne",
    "Allemagne",
    "Italie",
    "Belgique",
    "Pays-Bas",
    "Portugal",
    "Royaume-Uni",
    "Chine",
    "Japon",
    "Corée du Sud",
    "Turquie",
    "États-Unis",
    "Canada",
    "Émirats arabes unis",
]
PRODUCT_PROFILES = {
    "ELECTRONIQUE": {
        "quantite_min": 10,
        "quantite_max": 1000,
        "prix_min": 100,
        "prix_max": 9000,
        "poids_unitaire_min": 0.1,
        "poids_unitaire_max": 8,
    },

    "TEXTILE": {
        "quantite_min": 100,
        "quantite_max": 5000,
        "prix_min": 20,
        "prix_max": 500,
        "poids_unitaire_min": 0.1,
        "poids_unitaire_max": 3,
    },

    "ALIMENTAIRE": {
        "quantite_min": 500,
        "quantite_max": 10000,
        "prix_min": 5,
        "prix_max": 150,
        "poids_unitaire_min": 0.2,
        "poids_unitaire_max": 10,
    },

    "AUTOMOBILE": {
        "quantite_min": 10,
        "quantite_max": 1000,
        "prix_min": 100,
        "prix_max": 5000,
        "poids_unitaire_min": 1,
        "poids_unitaire_max": 100,
    },

    "PHARMACEUTIQUE": {
        "quantite_min": 50,
        "quantite_max": 5000,
        "prix_min": 20,
        "prix_max": 1000,
        "poids_unitaire_min": 0.05,
        "poids_unitaire_max": 2,
    },

    "MACHINES": {
        "quantite_min": 1,
        "quantite_max": 100,
        "prix_min": 5000,
        "prix_max": 100000,
        "poids_unitaire_min": 50,
        "poids_unitaire_max": 2000,
    },

    "COSMETIQUE": {
        "quantite_min": 100,
        "quantite_max": 5000,
        "prix_min": 10,
        "prix_max": 500,
        "poids_unitaire_min": 0.05,
        "poids_unitaire_max": 2,
    },

    "AGRICOLE": {
        "quantite_min": 500,
        "quantite_max": 10000,
        "prix_min": 5,
        "prix_max": 300,
        "poids_unitaire_min": 0.2,
        "poids_unitaire_max": 20,
    },

    "MATERIAUX_CONSTRUCTION": {
        "quantite_min": 50,
        "quantite_max": 2000,
        "prix_min": 20,
        "prix_max": 2000,
        "poids_unitaire_min": 5,
        "poids_unitaire_max": 100,
    },

    "EQUIPEMENT_MEDICAL": {
        "quantite_min": 5,
        "quantite_max": 500,
        "prix_min": 500,
        "prix_max": 30000,
        "poids_unitaire_min": 0.5,
        "poids_unitaire_max": 150,
    },
}
TRANSPORT_MODES = [
    "MARITIME",
    "AERIEN",
    "ROUTIER",
]

CUSTOMS_LEVELS = [
    "FAIBLE",
    "MOYEN",
    "ELEVE",
]

PRIORITIES = [
    "NORMALE",
    "URGENTE",
]

CURRENCIES = [
    "MAD",
    "EUR",
    "USD",
]

OPERATION_TYPES = [
    "IMPORT",
    "EXPORT",
]


def generate_random_date():
    total_days = (END_DATE - START_DATE).days
    random_days = random.randint(0,total_days)
    return START_DATE + timedelta(days=random_days)

def get_season(date):
    month = date.month
    if month in [12,1,2]:
        return "HIVER"
    elif month in [3,4,5]:
        return "PRINTEMPS"
    elif month in [6,7,8]:
        return "ETE"
    else:
        return "AUTOMNE"

def generate_operation_route():
    operation_type = random.choice(OPERATION_TYPES)

    foreign_countries = [
        country for country in COUNTRIES
        if country != "Maroc"
    ]

    if operation_type == "IMPORT":
        pays_origine = random.choice(foreign_countries)
        pays_destine = "Maroc"
    else:
        pays_origine = "Maroc"
        pays_destine = random.choice(foreign_countries)

    return operation_type, pays_origine, pays_destine

def generate_product_data():
    category = random.choice(list(PRODUCT_PROFILES.keys()))
    profile = PRODUCT_PROFILES[category]
    quantity = random.randint(
        profile["quantite_min"],
        profile["quantite_max"]
    )
    unit_price = round(
        random.uniform(profile["prix_min"], profile["prix_max"]),2
    )
    unit_weight = random.uniform(
        profile["poids_unitaire_min"],
        profile["poids_unitaire_max"],
    )

    total_weight = round(quantity * unit_weight, 2)
    goods_value = round(quantity * unit_price, 2)

    return(
        category,
        quantity,
        unit_price,
        goods_value,
        total_weight
    )

DISTANCES_FROM_MOROCCO = {
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

def generate_transport_data(pays_origin, pays_destine):
    if pays_origin == "Maroc":
        partner_country = pays_destine
    else:
        partner_country = pays_origin

    distance = DISTANCES_FROM_MOROCCO[partner_country]

    variation = random.uniform(0.95,1.05)

    distance_km = round(distance * variation)

    if distance_km <= 3000:
        mode_transport = random.choices(
            ["ROUTIER", "MARITIME", "AERIEN"],
            weights=[60,35,1],
            k=1
        )[0]
    elif distance_km <= 6000:
        mode_transport = random.choices(
            ["MARITIME", "AERIEN", "ROUTIER"],
            weights=[60, 35, 1],
            k=1
        )[0]
    else:
        mode_transport = random.choices(
            ["MARITIME", "AERIEN"],
            weights=[75,25],
            k=1
        )[0]

    return distance_km, mode_transport

def generate_customs_level():
    return random.choices(
        CUSTOMS_LEVELS,
        weights=[25,55,20],
        k=1
    )[0]

def generate_priority():
    return random.choices(
        PRIORITIES,
        weights=[80,20],
        k=1
    )[0]

def generate_currency(pays_origine, pays_destination):
    partner_country = (
        pays_destination
        if pays_origine == "Maroc"
        else pays_origine
    )

    euro_countries = [
        "France",
        "Espagne",
        "Allemagne",
        "Italie",
        "Belgique",
        "Pays-Bas",
        "Portugal",
    ]

    usd_countries = [
        "Chine",
        "Japon",
        "Corée du Sud",
        "États-Unis",
        "Canada",
        "Émirats arabes unis",
    ]

    if partner_country in euro_countries:
        return random.choices(
            ["EUR", "MAD"],
            weights=[85, 15],
            k=1
        )[0]

    if partner_country in usd_countries:
        return random.choices(
            ["USD", "MAD"],
            weights=[85, 15],
            k=1
        )[0]

    return random.choice(["MAD", "EUR", "USD"])

def calculate_expected_duration(distance_km, mode_transport):
    if mode_transport == "AERIEN":
        base_days = 2 + (distance_km / 3000)

    elif mode_transport == "ROUTIER":
        base_days = 2 + (distance_km / 700)

    else:  # MARITIME
        base_days = 7 + (distance_km / 500)

    # Petite variation pour rendre les données moins parfaites
    variation = random.uniform(0.9, 1.1)

    duration = round(base_days * variation)

    # Toujours au moins 1 jour
    return max(duration, 1)

def calculate_expected_delivery_date(date_operation, expected_duration):
    return date_operation + timedelta(days=expected_duration)

def calculate_delay_probability(
    mode_transport,
    distance_km,
    niveau_douane,
    priorite,
    poids_kg,
    saison
):
    # Risque de départ : 10 %
    probability = 0.10

    # Mode de transport
    if mode_transport == "MARITIME":
        probability += 0.10

    elif mode_transport == "ROUTIER":
        probability += 0.04

    elif mode_transport == "AERIEN":
        probability -= 0.03

    # Distance
    if distance_km > 8000:
        probability += 0.08

    elif distance_km > 4000:
        probability += 0.04

    # Niveau douanier
    if niveau_douane == "MOYEN":
        probability += 0.07

    elif niveau_douane == "ELEVE":
        probability += 0.18

    # Poids de la marchandise
    if poids_kg > 20000:
        probability += 0.07

    elif poids_kg > 5000:
        probability += 0.03

    # Priorité urgente
    if priorite == "URGENTE":
        probability -= 0.05

    # Saison
    if saison == "HIVER":
        probability += 0.05

    # Limiter la probabilité entre 5 % et 85 %
    probability = max(0.05, min(probability, 0.85))

    return probability

def generate_delay(probability):
    return 1 if random.random() < probability else 0

def calculate_actual_duration(expected_duration, retard):
    if retard == 1:
        max_extra_days = max(
            2,
            round(expected_duration * 0.50)
        )

        extra_days = random.randint(1, max_extra_days)

        return expected_duration + extra_days

    else:
        # Livraison à temps ou légèrement en avance
        max_early_days = min(
            2,
            expected_duration - 1
        )

        if max_early_days <= 0:
            return expected_duration

        early_days = random.randint(0, max_early_days)

        return expected_duration - early_days

def calculate_actual_delivery_date(
    date_operation,
    actual_duration
):
    return date_operation + timedelta(days=actual_duration)


def generate_operation(index):
    # 1. Date et saison
    date_operation = generate_random_date()
    saison = get_season(date_operation)

    # 2. Type et trajet
    type_operation, origine, destination = generate_operation_route()

    # 3. Produit
    (
        categorie,
        quantite,
        prix_unitaire,
        valeur_marchandise,
        poids_kg
    ) = generate_product_data()

    # 4. Transport et distance
    distance_km, mode_transport = generate_transport_data(
        origine,
        destination
    )

    # 5. Informations supplémentaires
    niveau_douane = generate_customs_level()
    priorite = generate_priority()
    devise = generate_currency(
        origine,
        destination
    )

    # 6. Livraison prévue
    duree_prevue_jours = calculate_expected_duration(
        distance_km,
        mode_transport
    )

    date_livraison_prevue = calculate_expected_delivery_date(
        date_operation,
        duree_prevue_jours
    )

    # 7. Risque de retard
    probabilite_retard = calculate_delay_probability(
        mode_transport,
        distance_km,
        niveau_douane,
        priorite,
        poids_kg,
        saison
    )

    retard = generate_delay(probabilite_retard)

    # 8. Livraison réelle
    duree_reelle_jours = calculate_actual_duration(
        duree_prevue_jours,
        retard
    )

    date_livraison_reelle = calculate_actual_delivery_date(
        date_operation,
        duree_reelle_jours
    )

    # 9. Référence
    prefix = "IMP" if type_operation == "IMPORT" else "EXP"
    reference = f"{prefix}-{index:05d}"

    # 10. Retourner l'opération complète
    return {
        "reference": reference,
        "type_operation": type_operation,
        "categorie_produit": categorie,
        "quantite": quantite,
        "prix_unitaire": prix_unitaire,
        "valeur_marchandise": valeur_marchandise,
        "devise": devise,
        "pays_origine": origine,
        "pays_destination": destination,
        "mode_transport": mode_transport,
        "distance_km": distance_km,
        "poids_kg": poids_kg,
        "niveau_douane": niveau_douane,
        "priorite": priorite,
        "date_operation": date_operation.date().isoformat(),
        "saison": saison,
        "duree_prevue_jours": duree_prevue_jours,
        "date_livraison_prevue": date_livraison_prevue.date().isoformat(),
        "duree_reelle_jours": duree_reelle_jours,
        "date_livraison_reelle": date_livraison_reelle.date().isoformat(),
        "retard": retard,
    }

operations = [
    generate_operation(i)
    for i in range(1, N_ROWS + 1)
]

base_dir = Path(__file__).resolve().parent

output_path = (
    base_dir
    / "raw"
    / "import_export_synthetic.csv"
)

output_path.parent.mkdir(
    parents=True,
    exist_ok=True
)

with open(
    output_path,
    "w",
    newline="",
    encoding="utf-8-sig"
) as file:

    writer = csv.DictWriter(
        file,
        fieldnames=operations[0].keys(),
        delimiter=";"
    )

    writer.writeheader()
    writer.writerows(operations)

print(
    f"{len(operations)} opérations générées avec succès."
)

print(
    f"Dataset enregistré dans : {output_path}"
)