from pathlib import Path
from tempfile import NamedTemporaryFile

from rest_framework import generics, response, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from document_ai.extract_operation import extract_operation

from .models import Operation
from .serializers import OperationSerializer


class OperationListCreateView(generics.ListCreateAPIView):
    queryset = Operation.objects.all().order_by('-create_at')
    serializer_class = OperationSerializer


class OperationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Operation.objects.all()
    serializer_class = OperationSerializer


class ExtractOperationView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get("file")

        if uploaded_file is None:
            return Response(
                {
                    "success": False,
                    "error": "Aucun fichier reçu",
                }
                ,status=status.HTTP_400_BAD_REQUEST
            )
        extension = Path(uploaded_file.name).suffix.lower()

        allowed_extensions = {
            ".png",
            ".jpg",
            ".jpeg",
            ".webp",
            ".pdf",
            ".xlsx",
            ".csv",
        }
        if extension not in allowed_extensions:
            return Response(
                {
                    "success": False,
                    "error" : "Format non supporté."
                },
                status = status.HTTP_400_BAD_REQUEST
            )

        temp_path = None

        try:
            with NamedTemporaryFile(delete=False, suffix=extension) as temp_file:
                for chunk in uploaded_file.chunks():
                    temp_file.write(chunk)

                temp_path = temp_file.name

            data = extract_operation(temp_path)

            return Response(
                {
                    "success": True,
                    "data": data
                },
                status = status.HTTP_200_OK
            )
        except Exception as e:
            print("Erreur extraction : ",e)

            return Response(
                {
                    'success': False,
                    'error': "Impossible d'analyser le document"
                },
                status = status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        finally:
            if temp_path:
                Path(temp_path).unlink(missing_ok=True)