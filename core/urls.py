from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicoViewSet, AgendamentoViewSet

router = DefaultRouter()
router.register(r'servicos', ServicoViewSet)
router.register(r'agendamentos', AgendamentoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
