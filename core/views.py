from rest_framework import viewsets, permissions
from .models import Servico, Agendamento, HorarioDisponivel, Barbearia
from .serializers import ServicoSerializer, AgendamentoSerializer, HorarioDisponivelSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from datetime import datetime
from django.db.models import Count
from collections import defaultdict
from decimal import Decimal


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def minha_barbearia(request):
    try:
        barbearia = Barbearia.objects.get(proprietario=request.user)
        return Response({'id': barbearia.id, 'nome': barbearia.nome})
    except Barbearia.DoesNotExist:
        return Response({'erro': 'Barbearia não encontrada.'}, status=404)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def salvar_varios_horarios(request):
    barbearia = request.user.barbearia_set.first()
    if not barbearia:
        return Response({"erro": "Usuário não possui barbearia vinculada."}, status=400)

    dados = request.data
    if not isinstance(dados, list):
        return Response({"erro": "Formato inválido. Esperado uma lista."}, status=400)

    novos = []
    for item in dados:
        try:
            hora = datetime.strptime(item['hora'], "%H:%M").time()
            novos.append(HorarioDisponivel(
                barbearia=barbearia,
                dia_semana=item['diaSemana'],
                hora=hora,
                duracao=item.get('duracao', 60)
            ))
        except Exception as e:
            return Response({"erro": str(e)}, status=400)

    # Limpa os antigos
    HorarioDisponivel.objects.filter(barbearia=barbearia).delete()

    # Cria em lote
    HorarioDisponivel.objects.bulk_create(novos)
    return Response({"mensagem": "Horários salvos com sucesso!"})
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def horarios_disponiveis_para_data(request):
    data_str = request.GET.get('data')
    if not data_str:
        return Response({"erro": "Data não informada"}, status=400)

    try:
        data = datetime.strptime(data_str, '%Y-%m-%d').date()
        dia_semana = data.weekday()  # 0 = segunda

        barbearia = request.user.barbearia_set.first()
        if not barbearia:
            return Response({"erro": "Usuário não possui barbearia vinculada."}, status=400)

        horarios = HorarioDisponivel.objects.filter(
            barbearia=barbearia,
            dia_semana=dia_semana
        ).values_list('hora', flat=True)

        agendados = Agendamento.objects.filter(
            data=data
        ).values_list('hora', flat=True)

        disponiveis = sorted(set(horarios) - set(agendados))

        return Response([h.strftime('%H:%M:%S') for h in disponiveis])
    except Exception as e:
        return Response({"erro": str(e)}, status=500)


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
        user = self.request.user
        qs = Agendamento.objects.all()

        # Se não for admin, mostra apenas os agendamentos do usuário
        if not user.is_staff:
            qs = qs.filter(usuario=user)

        # Filtra por data se fornecida na querystring
        data = self.request.query_params.get('data')
        if data:
            qs = qs.filter(data=data)

        return qs


    def perform_create(self, serializer):
        data = serializer.validated_data.get("data")
        hora = serializer.validated_data.get("hora")  # ← nome correto

        # Verifica se o horário já está agendado
        conflito = Agendamento.objects.filter(data=data, hora=hora).exists()
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
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resumo_agendamentos(request):
    queryset = Agendamento.objects.select_related('usuario', 'servico')

    if not request.user.is_staff:
        queryset = queryset.filter(usuario=request.user)

    dados = {}

    for ag in queryset:
        data_str = ag.data.strftime("%Y-%m-%d")
        if data_str not in dados:
            dados[data_str] = {
                "data": data_str,
                "total": 0,
                "usuarios": set(),
                "servicos": defaultdict(int),
                "faturamento": Decimal("0.00")
            }

        dados[data_str]["total"] += 1
        dados[data_str]["usuarios"].add(ag.usuario.username)
        nome_servico = ag.servico.nome
        dados[data_str]["servicos"][nome_servico] += 1
        dados[data_str]["faturamento"] += ag.servico.preco  # 💰

    resultado = []
    for d in sorted(dados.keys()):
        resumo = dados[d]
        resultado.append({
            "data": resumo["data"],
            "total": resumo["total"],
            "usuarios": len(resumo["usuarios"]),
            "servicos": resumo["servicos"],
            "faturamento": float(resumo["faturamento"])
        })

    return Response(resultado)


