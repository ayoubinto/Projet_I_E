from django.db import models


class Operation(models.Model):

    class TypeOperation(models.TextChoices):
        IMPORT = "IMPORT", "Importation"
        EXPORT = "EXPORT", "Exportation"


    class Status(models.TextChoices):
        PLANIFIEE = "PLANIFIEE", "Planifiée"
        EN_TRANSIT = "EN_TRANSIT", "En transit"
        LIVREE = "LIVREE", "Livrée"
        ANNULEE = "ANNULEE", "Annulée"

    """Ce champs contient la référence de l'opération par exemple : IMP-2026-001"""
    reference = models.CharField(max_length=50,unique=True)

    """L’utilisateur pourra uniquement choisir : Importation ou Exportation"""
    type_operation = models.CharField(
        max_length=10,
        choices= TypeOperation.choices
    )

    produit = models.CharField(max_length=150)
    quantite = models.PositiveIntegerField()
    prix_unitaire = models.DecimalField(max_digits=12, decimal_places=2)
    devise = models.CharField(max_length=3,default="MAD") #Par exemple : MAD / EUR / USD
    pays_origine = models.CharField(max_length=100)
    pays_destination = models.CharField(max_length=100)
    date_operation = models.DateField()
    date_livraison = models.DateField(
        null=True, #La base de données accepte l’absence de valeur.
        blank=True, #Le champ peut rester vide dans un formulaire Django ou dans l’administration.
    )

    """Ce champ contient l’état actuel de l’opération."""
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLANIFIEE,
    )
    create_at = models.DateTimeField(auto_now_add=True) #Ce champs enregistre automatiquement la date et l'heure de création de l'opération
    update_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.reference} - {self.get_type_operation_display()}" #get_type_operation_display() => Récupère le texte lisible du choix. par exemple : La base contient => IMPORT mais django affiche => Importation