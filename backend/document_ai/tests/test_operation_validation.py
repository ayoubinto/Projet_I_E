import pytest
from pydantic import ValidationError
from document_ai.extract_operation import Operation

def test_operation_valide():
    operation = Operation(
        reference_operation="IMP-MA-2026-443",
        type_operation="IMPORT",
        produit="Composants électroniques",
        quantite=500,
        prix_unitaire=120.50,
        devise="MAD",
        statut="PLANIFIÉE",
        pays_origine="France",
        pays_destination="Maroc",
        date_operation="07/09/2026",
        date_livraison="21/09/2026",
    )

    assert operation.type_operation == "IMPORT"
    assert operation.statut == "PLANIFIEE"
    assert operation.quantite == 500
    assert operation.prix_unitaire == 120.50


@pytest.mark.parametrize(
    "input_value, expected",
    [
        ("PLANIFIÉE", "PLANIFIEE"),
        ("EN_TRANSIT", "EN_TRANSIT"),
        ("EN TRANSIT", "EN_TRANSIT"),
        ("LIVRÉE", "LIVREE"),
        ("ANNULÉE", "ANNULEE"),
    ],
)
def test_statuts_valides(input_value, expected):
    operation = Operation(statut=input_value)

    assert operation.statut == expected


def test_statut_invalide():
    with pytest.raises(ValidationError):
        Operation(statut="TERMINEE")

def test_quantite_negative():
    with pytest.raises(ValidationError):
        Operation(quantite=-10)


def test_quantite_zero():
    with pytest.raises(ValidationError):
        Operation(quantite=0)

def test_prix_negatif():
    with pytest.raises(ValidationError):
        Operation(prix_unitaire=-120.50)

@pytest.mark.parametrize(
    "type_operation",
    ["IMPORT", "EXPORT"],
)
def test_types_operation_valides(type_operation):
    operation = Operation(
        type_operation=type_operation
    )

    assert operation.type_operation == type_operation


def test_type_operation_invalide():
    with pytest.raises(ValidationError):
        Operation(type_operation="IMPORTATION")