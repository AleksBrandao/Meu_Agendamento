from rest_framework import viewsets
from .models import Servico
from .serializers import ServicoSerializer
from .models import Agendamento
from .serializers import AgendamentoSerializer
from rest_framework.permissions import IsAuthenticated

class ServicoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer

class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Agendamento.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)