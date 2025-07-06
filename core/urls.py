from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicoViewSet, AgendamentoViewSet, HorarioDisponivelViewSet

router = DefaultRouter()
router.register(r'servicos', ServicoViewSet)
router.register(r'agendamentos', AgendamentoViewSet)
router.register(r'horarios-disponiveis', HorarioDisponivelViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('', include(router.urls)),
]



