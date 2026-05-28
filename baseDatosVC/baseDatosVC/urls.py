from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.http import JsonResponse
from django.contrib.auth import get_user_model

def crear_super(request):
    User = get_user_model()
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@admin.com', 'Admin1234!')
        return JsonResponse({'ok': 'Superusuario creado'})
    return JsonResponse({'ok': 'Ya existe'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('crear-super/', crear_super),
    path("", RedirectView.as_view(url="/api/", permanent=False)),
]