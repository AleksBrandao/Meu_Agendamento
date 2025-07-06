from django.db import models
from django.contrib.auth.models import User

class Servico(models.Model):
    nome = models.CharField(max_length=100)
    preco = models.DecimalField(max_digits=6, decimal_places=2)
    duracao_minutos = models.PositiveIntegerField()

    def __str__(self):
        return self.nome

class Agendamento(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    servico = models.ForeignKey(Servico, on_delete=models.CASCADE)
    data = models.DateField()
    hora = models.TimeField()

    def __str__(self):
        return f'{self.usuario.username} - {self.servico.nome} em {self.data} às {self.hora}'
    
class Barbearia(models.Model):
    nome = models.CharField(max_length=100)
    endereco = models.CharField(max_length=200)
    proprietario = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.nome

class HorarioDisponivel(models.Model):
    DIA_SEMANA_CHOICES = [
        (0, 'Segunda-feira'),
        (1, 'Terça-feira'),
        (2, 'Quarta-feira'),
        (3, 'Quinta-feira'),
        (4, 'Sexta-feira'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]

    barbearia = models.ForeignKey(Barbearia, on_delete=models.CASCADE, related_name='horarios_disponiveis')
    dia_semana = models.IntegerField(choices=DIA_SEMANA_CHOICES)
    hora = models.TimeField()

    class Meta:
        unique_together = ['barbearia', 'dia_semana', 'hora']
        ordering = ['dia_semana', 'hora']

    def __str__(self):
        return f"{self.barbearia.nome} - {self.get_dia_semana_display()} às {self.hora.strftime('%H:%M')}"
