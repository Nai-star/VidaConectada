from django.urls import path
from .views import *
from rest_framework_simplejwt.views import ( TokenObtainPairView,TokenRefreshView,)


urlpatterns = [
    # Usuarios
    path('usuarios/', CustomUserListCreateView.as_view(), name="crear y listar usuarios"),
    path('usuarios/<int:pk>', CustomUserDetailView.as_view(), name="actualizar y eliminar usuarios"),

    # Publicaciones
    path('publicaciones', PublicacionesListCreateView.as_view(), name="crear y listar publicaciones"),
    path('publicaciones/<int:pk>', PublicacionesDetailView.as_view(), name="actualizar y eliminar publicaciones"),

    # Imágenes de publicaciones
    

    # Sangre
    path('sangre/', SangreListCreateView.as_view(), name="crear y listar tipos de sangre"),
    path('sangre/<int:pk>', SangreDetailView.as_view(), name="actualizar y eliminar tipo de sangre"),

    # Suscritos
    path('suscritos/', SuscritosListCreateView.as_view(), name="crear y listar suscritos"),
    path('suscritos/<int:pk>', SuscritosDetailView.as_view(), name="actualizar y eliminar suscritos"),

    # Lugar de campaña
    path('lugares-campana', LugarCampanaListCreateView.as_view(), name="crear y listar lugares de campaña"),
    path('lugares-campana/<int:pk>', LugarCampanaDetailView.as_view(), name="actualizar y eliminar lugar de campaña"),

    # Campañas
    path('campanas', CampanaListCreateView.as_view(), name="crear y listar campañas"),
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
    path('respuestas/', RespuestaListCreateView.as_view(), name="crear y listar respuestas"),
    path('respuesta/<int:pk>', RespuestaDetailView.as_view(), name="actualizar y eliminar respuestas"),
    
    path('urgente_tip_sang/', Urgente_Tip_SangListCreateView.as_view(), name="crear y listar urgentes"),
    path('urgente_tip_sang/<int:pk>/', Urgente_Tip_SangRetrieveUpdateDestroyAPIView.as_view(), name="detalle urgente"),


    path('carusel/', CaruselListCreateView.as_view(), name="crear y listar urgentes"),
    path('carusel/<int:pk>/', CaruselRetrieveUpdateDestroyAPIView.as_view(), name="detalle urgente"),


    path('Campanainfo/', CampanasinfoListCreateView.as_view(), name="crear y listar urgentes"),
    path('campanainfo/<int:pk>/',CampanasinfoRetrieveUpdateDestroyAPIView.as_view(), name="detalle urgente"),

    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
]




    




