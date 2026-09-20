from django.conf import settings
from django.db import models


class PredictionHistory(models.Model):
    input_data = models.JSONField()

    prediction = models.IntegerField()

    probabilite_retard = models.FloatField()

    niveau_risque = models.CharField(
        max_length=20
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return(
            f"Prédiction {self.id} - "
            f"{self.niveau_risque} - "
            f"{self.probabilite_retard}%"
        )