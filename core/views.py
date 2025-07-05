from rest_framework import viewsets, permissions
from .models import Servico
from .serializers import ServicoSerializer
from .models import Agendamento
from .serializers import AgendamentoSerializer
from rest_framework.permissions import IsAuthenticated

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Somente leitura para usuários anônimos ou autenticados
        if request.method in permissions.SAFE_METHODS:
            return True
        # Somente admins podem criar, editar ou deletar
        return request.user and request.user.is_staff


class ServicoViewSet(viewsets.ModelViewSet):  # <- permite CRUD completo
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    permission_classes = [IsAdminOrReadOnly]


class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Agendamento.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


