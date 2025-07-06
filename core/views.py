from rest_framework import viewsets, permissions
from .models import Servico, Agendamento, HorarioDisponivel
from .serializers import ServicoSerializer, AgendamentoSerializer, HorarioDisponivelSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.exceptions import ValidationError

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
        data = serializer.validated_data.get("data")
        horario = serializer.validated_data.get("horario")

        # Verifica se o horário já está agendado
        conflito = Agendamento.objects.filter(data=data, horario=horario).exists()
        if conflito:
            raise ValidationError("Horário indisponível. Escolha outro horário.")

        serializer.save(usuario=self.request.user)
        
class HorarioDisponivelViewSet(viewsets.ModelViewSet):
    queryset = HorarioDisponivel.objects.all()
    serializer_class = HorarioDisponivelSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def get_queryset(self):
        return HorarioDisponivel.objects.filter(usuario=self.request.user)


