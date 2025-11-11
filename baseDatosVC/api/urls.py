from django.urls import path
from .views import *
from .views import Imagenes_publiListCreateView

urlpatterns = [
    # Usuarios
    path('usuarios', CustomUserListCreateView.as_view(), name="crear y listar usuarios"),
    path('usuarios/<int:pk>', CustomUserDetailView.as_view(), name="actualizar y eliminar usuarios"),

    # Publicaciones
    path('publicaciones', PublicacionesListCreateView.as_view(), name="crear y listar publicaciones"),
    path('publicaciones/<int:pk>', PublicacionesDetailView.as_view(), name="actualizar y eliminar publicaciones"),

    # Imágenes de publicaciones
    path('imagenes-publicaciones', ImagenesPubliListCreateView.as_view(), name="crear y listar imágenes de publicaciones"),
    path('imagenes-publicaciones/<int:pk>', ImagenesPubliDetailView.as_view(), name="actualizar y eliminar imágenes de publicaciones"),

    # Sangre
    path('sangre', SangreListCreateView.as_view(), name="crear y listar tipos de sangre"),
    path('sangre/<int:pk>', SangreDetailView.as_view(), name="actualizar y eliminar tipo de sangre"),

    # Suscritos
    path('suscritos', SuscritosListCreateView.as_view(), name="crear y listar suscritos"),
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
    path('buzon', BuzonListCreateView.as_view(), name="crear y listar mensajes de buzón"),
    path('buzon/<int:pk>', BuzonDetailView.as_view(), name="actualizar y eliminar mensaje de buzón"),

    # Respuestas
    path('respuestas', RespuestaListCreateView.as_view(), name="crear y listar respuestas"),
    path('respuestas/<int:pk>', RespuestaDetailView.as_view(), name="actualizar y eliminar respuestas"),

    
    path('imagenes_publi/', Imagenes_publiListCreateView.as_view(), name="crear y listar imágenes"),
]



