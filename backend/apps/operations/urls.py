from django.urls import path

from .views import ExtractOperationView, OperationDetailView, OperationListCreateView

urlpatterns = [
    path(
        "",
        OperationListCreateView.as_view(),
        name='operation-list-create'
    ),
    path(
        "<int:pk>/",
        OperationDetailView.as_view(),
        name='operation-detail'
    ), # <int:pk> => récupère l’identifiant numérique placé dans l’URL

    path(
        "extract-document/",
        ExtractOperationView.as_view(),
        name='extract-document'
    ),
]