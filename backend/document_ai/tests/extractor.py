import re
import unicodedata
from collections import Counter

from rapidfuzz import fuzz

TYPE_OPERATIONS = {
    "IMPORT",
    "EXPORT",
}

DEVISES = {
    "MAD",
    "EUR",
    "USD",
    "GBP",
    "CHF",
    "CAD",
}

STATUTS = {
    "PLANIFIEE",
    "PLANIFIE",
    "LIVREE",
    "LIVRE",
    "EN_COURS",
    "ANNULEE",
    "ANNULE",
}


def normalize_text(text):
    text = text.lower().strip()

    # Uniformiser les apostrophes
    text = text.replace("’", "'")
    text = text.replace("‘", "'")
    text = text.replace("`", "'")

    # Supprimer les accents
    text = unicodedata.normalize("NFD", text)
    text = "".join(
        char for char in text
        if unicodedata.category(char) != "Mn"
    )

    # Ponctuation inutile
    text = text.replace(":", "")
    text = text.replace(";", "")

    # Gérer les formes françaises :
    # l'opération -> operation
    # d'opération -> operation
    # d'origine   -> origine
    text = re.sub(
        r"\b[ld]'",
        "",
        text
    )

    return text

def merge_boxes(boxes):
    """
    Fusionne plusieurs bounding boxes.

    Exemple :
    Date + de + livraison
    devient une seule grande zone.
    """
    x_min = min(box[0] for box in boxes)
    y_min = min(box[1] for box in boxes)
    x_max = max(box[2] for box in boxes)
    y_max = max(box[3] for box in boxes)

    return [x_min, y_min, x_max, y_max]


def same_line(box1, box2, tolerance=2):
    """
    Vérifie si deux bounding boxes appartiennent
    réellement à la même ligne.
    """

    y1_min = box1[1]
    y1_max = box1[3]

    y2_min = box2[1]
    y2_max = box2[3]

    return (
        y2_min <= y1_max + tolerance
        and
        y2_max >= y1_min - tolerance
    )

import re


def is_noise(word):
    """Ignore certains caractères parasites de l'OCR."""
    return word.strip() in {
        ":", ">", "|", "—", "-", ";"
    }

def is_date(value):
    return bool(
        re.fullmatch(
            r"\d{2}/\d{2}/\d{4}",
            value
        )
    )

def validate_value(value, value_type):
    value_clean = value.strip()

    if value_type == "date":
        return bool(
            re.fullmatch(
                r"\d{2}/\d{2}/\d{4}",
                value_clean
            )
        )

    if value_type == "integer":
        return bool(
            re.fullmatch(r"\d+", value_clean)
        )

    if value_type == "decimal":
        return bool(
            re.fullmatch(
                r"\d+(?:[.,]\d+)?",
                value_clean
            )
        )

    if value_type == "reference":
        return bool(
            re.fullmatch(
                r"[A-Z0-9]+(?:-[A-Z0-9]+){2,}",
                value_clean.upper()
            )
        )

    if value_type == "type_operation":
        return value_clean.upper() in TYPE_OPERATIONS

    if value_type == "devise":
        return value_clean.upper() in DEVISES

    if value_type == "statut":
        normalized = (
            value_clean
            .upper()
            .replace("É", "E")
            .replace(" ", "_")
        )

        return normalized in STATUTS

    if value_type == "country":
        return bool(
            re.fullmatch(
                r"[A-Za-zÀ-ÿ -]+",
                value_clean
            )
        )

    if value_type == "text":
        return bool(
            re.search(
                r"[A-Za-zÀ-ÿ]",
                value_clean
            )
        )

    return False

FIELD_CONFIG = {

    "reference_operation": {
        "labels": [
            "Référence opération",
            "Référence de l'opération",
            "Réf opération",
            "Réf Op",
        ],
        "value_type": "reference",
        "max_value_words": 1,
        "directions": ("right", "below"),
    },

    "type_operation": {
        "labels": [
            "Type opération",
            "Type d'opération",
            "Type Op",
        ],
        "value_type": "type_operation",
        "max_value_words": 1,
    },

    "produit": {
        "labels": [
            "Produit",
            "Nom produit",
            "Article",
        ],
        "value_type": "text",
        "max_value_words": 3,
    },

    "quantite": {
        "labels": [
            "Quantité",
            "Quantite",
            "Qté",
            "Qte",
        ],
        "value_type": "integer",
        "max_value_words": 1,
    },

    "prix_unitaire": {
        "labels": [
            "Prix unitaire",
            "Prix unit",
            "PU",
        ],
        "value_type": "decimal",
        "max_value_words": 1,
    },

    "devise": {
        "labels": [
            "Devise",
            "Monnaie",
            "Currency",
        ],
        "value_type": "devise",
        "max_value_words": 1,
    },

    "statut": {
        "labels": [
            "Statut",
            "État",
            "Etat",
        ],
        "value_type": "statut",
        "max_value_words": 1,
    },

    "pays_origine": {
        "labels": [
            "Pays d'origine",
            "Pays origine",
            "Origine",
        ],
        "value_type": "country",
        "max_value_words": 1,
    },

    "pays_destination": {
        "labels": [
            "Pays de destination",
            "Pays destination",
            "Destination",
        ],
        "value_type": "country",
        "max_value_words": 1,
    },

    "date_operation": {
        "labels": [
            "Date opération",
            "Date de l'opération",
            "Date d'opération",
            "Date Op",
        ],
        "value_type": "date",
        "max_value_words": 1,
    },

    "date_livraison": {
        "labels": [
            "Date de livraison",
            "Date livraison",
            "Date Liv",
            "Livraison prévue",
        ],
        "value_type": "date",
        "max_value_words": 1,
    },
}

def extract_currency_fallback(words, confidences):

    currencies = {
        "MAD",
        "EUR",
        "USD",
        "GBP",
        "CHF",
        "CAD",
    }

    found = []

    for word, confidence in zip(
        words,
        confidences
    ):
        if confidence < 30:
            continue

        cleaned = re.sub(
            r"[^A-Za-z]",
            "",
            word
        ).upper()

        if cleaned in currencies:
            found.append(cleaned)

    if not found:
        return None

    # Devise la plus fréquente dans le document
    return Counter(found).most_common(1)[0][0]

def below_label(label_box, value_box, max_vertical_distance=60):
    """
    Vérifie si une valeur se trouve juste en dessous
    du label et est horizontalement alignée avec lui.
    """

    label_center_x = (label_box[0] + label_box[2]) / 2
    value_center_x = (value_box[0] + value_box[2]) / 2

    # La valeur doit être sous le label
    if value_box[1] < label_box[3]:
        return False

    vertical_distance = value_box[1] - label_box[3]

    if vertical_distance > max_vertical_distance:
        return False

    # Les deux zones doivent être suffisamment alignées
    horizontal_distance = abs(
        value_center_x - label_center_x
    )

    return horizontal_distance <= 100

def extract_smart_field(
        words,
        boxes,
        confidences,
        labels,
        value_type,
        max_value_words=1,
        min_score=75,
        directions=("right",)
):
    normalized_words = [
        normalize_text(word)
        for word in words
    ]

    possible_results = []

    # Chaque alias
    for label in labels:

        normalized_label = normalize_text(label)

        # Nombre approximatif de mots du label
        label_size = len(
            normalized_label.split()
        )

        # Autoriser légèrement plus ou moins de mots
        sizes = {
            max(1, label_size - 1),
            label_size,
            label_size + 1
        }

        for i in range(len(words)):

            for size in sizes:

                if i + size > len(words):
                    continue

                candidate_words = normalized_words[
                    i:i + size
                ]

                candidate_label = " ".join(
                    candidate_words
                )

                # IMPORTANT :
                # ratio uniquement
                # pas partial_ratio
                score = fuzz.ratio(
                    candidate_label,
                    normalized_label
                )

                if score < min_score:
                    continue

                label_box = merge_boxes(
                    boxes[i:i + size]
                )

                value_candidates = []

                # Chercher une valeur sur la même ligne
                for j in range(len(words)):

                    if j >= i and j < i + size:
                        continue

                    # Confiance de la VALEUR
                    if confidences[j] < 30:
                        continue

                    is_right = (
                            "right" in directions
                            and same_line(label_box, boxes[j])
                            and boxes[j][0] >= label_box[2]
                    )

                    is_below = (
                            "below" in directions
                            and below_label(label_box, boxes[j])
                    )

                    if not is_right and not is_below:
                        continue

                    if is_right:
                        distance = boxes[j][0] - label_box[2]
                    else:
                        distance = boxes[j][1] - label_box[3]

                    word = words[j].strip()

                    if word in {
                        ":",
                        ">",
                        "|",
                        "—",
                        "-",
                        ";",
                    }:
                        continue



                    value_candidates.append(
                        (
                            distance,
                            boxes[j][0],
                            j,
                            word
                        )
                    )

                value_candidates.sort(
                    key=lambda item: (
                        item[0],
                        item[1]
                    )
                )

                if not value_candidates:
                    continue

                # -----------------------------
                # Valeurs structurées
                # -----------------------------

                if value_type != "text":

                    for (
                        distance,
                        x,
                        index,
                        value
                    ) in value_candidates:

                        if validate_value(
                            value,
                            value_type
                        ):

                            possible_results.append(
                                {
                                    "label_score": score,
                                    "distance": distance,
                                    "value": value
                                }
                            )

                            break

                # -----------------------------
                # Texte : produit...
                # -----------------------------

                else:

                    selected_words = []

                    for item in value_candidates[
                        :max_value_words
                    ]:

                        word = item[3]

                        if validate_value(
                            word,
                            "text"
                        ):
                            selected_words.append(
                                word
                            )

                    if selected_words:

                        value = " ".join(
                            selected_words
                        )

                        possible_results.append(
                            {
                                "label_score": score,
                                "distance": value_candidates[0][0],
                                "value": value
                            }
                        )

    if not possible_results:
        return None

    # Meilleur label d'abord,
    # puis valeur la plus proche
    possible_results.sort(
        key=lambda result: (
            -result["label_score"],
            result["distance"]
        )
    )

    return possible_results[0]["value"]

def extract_operation_data(words, boxes, confidences):

    result = {}

    for field_name, config in FIELD_CONFIG.items():

        result[field_name] = extract_smart_field(
            words,
            boxes,
            confidences,
            labels=config["labels"],
            value_type=config["value_type"],
            max_value_words=config["max_value_words"],
            min_score=75,
            directions=config.get(
                "directions",
                ("right",)
            )
        )
    if result["devise"] is None:
        result["devise"] = extract_currency_fallback(
            words,
            confidences
        )

    return result