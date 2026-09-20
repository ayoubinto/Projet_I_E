from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PredictionHistory
from .services import predict_retard


class PredictonRetardView(APIView):

    def post(self, request):

        try:
            resultat = predict_retard(request.data)
            PredictionHistory.objects.create(
                input_data = request.data,
                prediction = resultat["prediction"],
                probabilite_retard = resultat["probabilite_retard"],
                niveau_risque=resultat["niveau_risque"],
                created_by=request.user if request.user.is_authenticated else None,
            )
            return Response(
                resultat,
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error":str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class PredictionHistoryView(APIView):
    def get(self,request):
        predictions = PredictionHistory.objects.order_by("-created_at")

        data = [
            {
                "id": prediction.id,
                "input_data": prediction.input_data,
                "prediction": prediction.prediction,
                "probabilite_retard": prediction.probabilite_retard,
                "niveau_risque": prediction.niveau_risque,
                "created_at": prediction.created_at,
            }
            for prediction in predictions
        ]
        return Response(data)