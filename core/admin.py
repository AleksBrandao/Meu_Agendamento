from django.contrib import admin
from .models import Servico
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_superuser', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active')

# Re-registra o User com a nova configuração
admin.site.register(Servico)
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
