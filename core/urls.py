from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicoViewSet, AgendamentoViewSet, HorarioDisponivelViewSet
from .views import minha_barbearia

router = DefaultRouter()
router.register(r'servicos', ServicoViewSet)
router.register(r'agendamentos', AgendamentoViewSet)
router.register(r'horarios-disponiveis', HorarioDisponivelViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('', include(router.urls)),
    path('minha-barbearia/', minha_barbearia),
]



