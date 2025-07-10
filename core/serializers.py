from rest_framework import serializers
from .models import Servico
from .models import Agendamento
from .models import HorarioDisponivel
from .models import Agendamento

class ServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servico
        fields = '__all__'
        
class AgendamentoSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    servico_nome = serializers.CharField(source='servico.nome', read_only=True)

    class Meta:
        model = Agendamento
        fields = '__all__'  # inclui tudo, inclusive os novos campos
        read_only_fields = ['usuario']

class HorarioDisponivelSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioDisponivel
        fields = '__all__'
        
