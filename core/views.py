from rest_framework import viewsets, permissions
from .models import Servico, Agendamento, HorarioDisponivel, Barbearia
from .serializers import ServicoSerializer, AgendamentoSerializer, HorarioDisponivelSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def minha_barbearia(request):
    try:
        barbearia = Barbearia.objects.get(proprietario=request.user)
        return Response({'id': barbearia.id, 'nome': barbearia.nome})
    except Barbearia.DoesNotExist:
        return Response({'erro': 'Barbearia não encontrada.'}, status=404)
    

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
        try:
            barbearia = self.request.user.barbearia_set.first()
            if not barbearia:
                raise ValidationError("Usuário não possui barbearia cadastrada.")
            serializer.save(barbearia=barbearia)
        except Barbearia.DoesNotExist:
            raise ValidationError("Usuário não possui barbearia vinculada.")


    def get_queryset(self):
        return HorarioDisponivel.objects.filter(barbearia__proprietario=self.request.user)



