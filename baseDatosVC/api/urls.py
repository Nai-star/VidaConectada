from django.urls import path
from .views import *
from rest_framework_simplejwt.views import ( TokenObtainPairView,TokenRefreshView,)


urlpatterns = [
        # Usuarios
    

    path('usuarios/', CustomUserListCreateView.as_view(), name="crear_listar_usuarios"),
    path('usuarios/<int:pk>/', CustomUserDetailView.as_view(), name="detalle_usuario"),
    #path('user/', UsuarioActualView.as_view(), name="user-actual"),

    # Login admin (endpoint específico)
    path('login/admin/', AdminLoginView.as_view(), name='login_admin'),

    # Login estándar (opcional) - permite email o username
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
     #tokens
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    


    # Publicaciones
    path('publicaciones', PublicacionesListCreateView.as_view(), name="crear y listar publicaciones"),
    path('publicaciones/<int:pk>', PublicacionesDetailView.as_view(), name="actualizar y eliminar publicaciones"),
    

    # Sangre
    path('sangre/', SangreListCreateView.as_view(), name="crear y listar tipos de sangre"),
    path('sangre/<int:pk>', SangreDetailView.as_view(), name="actualizar y eliminar tipo de sangre"),

    # Suscritos
    path('suscritos/', SuscritosListCreateView.as_view(), name="crear y listar suscritos"),
    path('suscritos/<int:pk>/', SuscritosDetailView.as_view(), name="actualizar y eliminar suscritos"),
    
    # Lugar de campaña


    # Campañas
    path('campanas/', CampanaListCreateView.as_view(), name="crear y listar campañas"),
    path('campanas/<int:pk>', CampanaDetailView.as_view(), name="actualizar y eliminar campañas"),

    # Imágenes de campaña
    path('imagenes-campana', ImagenCampanaListCreateView.as_view(), name="crear y listar imágenes de campaña"),
    path('imagenes-campana/<int:pk>', ImagenCampanaDetailView.as_view(), name="actualizar y eliminar imágenes de campaña"),

    # Mapas
    path('mapas', MapaListCreateView.as_view(), name="crear y listar mapas"),
    path('mapas/<int:pk>', MapaDetailView.as_view(), name="actualizar y eliminar mapa"),

    # Buzón
    path('buzon/', BuzonListCreateView.as_view(), name="crear y listar mensajes de buzón"),
    path('buzon/<int:pk>', BuzonDetailView.as_view(), name="actualizar y eliminar mensaje de buzón"),

    # Respuestas
    path('respuestas/', RespuestaListCreateView.as_view(), name="respuestas-list-create"),
    path('respuesta/<int:pk>/', RespuestaDetailView.as_view(), name="respuesta-detail"),
    
    #Sangre urgente
    path('urgente_tip_sang/', Urgente_Tip_SangListCreateView.as_view(), name="crear y listar urgentes"),
    path('urgente_tip_sang/<int:pk>/', Urgente_Tip_SangRetrieveUpdateDestroyAPIView.as_view(), name="detalle urgente"),

    #carrusel
    path('carusel/', CaruselListCreateView.as_view(), name="crear y listar urgentes"),
     path('carusel/<int:pk>/', CaruselRetrieveUpdateDestroyAPIView.as_view(), name="actualizar y eliminar respuestas"),

    path('Cantones/', CantonesListCreateView.as_view(), name="crear y listar cantones"),
  
    #requistos
    path("requisitos/", RequisitosListCreateView.as_view(), name="requisitos-list-create"),
    path("requisitos/<int:pk>/", RequisitosRetrieveUpdateDestroyAPIView.as_view(), name="requisitos-detail"),


    #Galeria
    path('galeria/', GaleriaListCreateView.as_view(), name='crear y listar '),
    path('galeria2/', GaleriaRetrieveUpdateDestroyAPIView.as_view(), name='"actualizar y eliminar respuestas"'),
    #provincia
    path('provincia/', ProvinciaListCreateView.as_view(), name='token_obtain_pair'),
    path('provincia/<int:pk>/', ProvinciaRetrieveUpdateDestroyAPIView.as_view(), name='token_refresh'),
    #banco
    path('banco/', Red_bancosListCreateView.as_view(), name='token_obtain_pair'),
    path('banco/<int:pk>/', Red_bancosRetrieveUpdateDestroyAPIView.as_view(), name='token_refresh'),

    path('Testimonio_texto/', Testimonio_textoListCreateView.as_view(), name='crear y listar'),
    path('Testimonio_texto/<int:pk>/', Testimonio_textoRetrieveUpdateDestroyAPIView.as_view(), name='actualizar y eliminar'),

    path('Testimonio_video/', Testimonio_videoListCreateView.as_view(), name='crear y listar'),
    path('Testimonio_video/<int:pk>/', Testimonio_videoRetrieveUpdateDestroyAPIView.as_view(), name='actualizar y eliminar'),
   
    path('participacion/', ParticipacionListCreateView.as_view(), name="crear y listar participaciones"),
    path('participacion/<int:pk>', ParticipacionDetailView.as_view(), name="actualizar y eliminar participacion"),
    path("suscritos/buscar/", buscar_suscrito_por_cedula),

]