from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicoViewSet, AgendamentoViewSet, HorarioDisponivelViewSet
from .views import minha_barbearia, salvar_varios_horarios, horarios_disponiveis_para_data, resumo_agendamentos

router = DefaultRouter()
router.register(r'servicos', ServicoViewSet)
router.register(r'agendamentos', AgendamentoViewSet)
router.register(r'horarios-disponiveis', HorarioDisponivelViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('salvar-horarios/', salvar_varios_horarios),  # ← Note o "/" final
    path('minha-barbearia/', minha_barbearia),
    path('horarios-disponiveis-por-data/', horarios_disponiveis_para_data),
    path('resumo-agendamentos/', resumo_agendamentos),
]
