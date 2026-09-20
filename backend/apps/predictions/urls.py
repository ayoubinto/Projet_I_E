from django.urls import path

from .views import PredictionHistoryView, PredictonRetardView

urlpatterns = [
    path("retard/",PredictonRetardView.as_view(),name="prediction-retard"),
    path("history/", PredictionHistoryView.as_view(), name="prediction-history"),
]