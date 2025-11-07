from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group
from rest_framework import generics
from .models import Imagenes_publi
from .serializers import Imagenes_publiSerializer




from .models import *
from .serializers import *


# ✅ CustomUser
class CustomUserListCreateView(ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        password = serializer.validated_data.get('password')
        if password:
            serializer.validated_data['password'] = make_password(password)
        serializer.save()


class CustomUserDetailView(RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]


# ✅ Publicaciones
class PublicacionesListCreateView(ListCreateAPIView):
    queryset = Publicaciones.objects.all()
    serializer_class = PublicacionesSerializer
    permission_classes = [AllowAny]


class PublicacionesDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Publicaciones.objects.all()
    serializer_class = PublicacionesSerializer
    permission_classes = [AllowAny]


# ✅ Imágenes de publicaciones
class ImagenesPubliListCreateView(ListCreateAPIView):
    queryset = Imagenes_publi.objects.all()
    serializer_class = ImagenesPubliSerializer
    permission_classes = [AllowAny]


class ImagenesPubliDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Imagenes_publi.objects.all()
    serializer_class = ImagenesPubliSerializer
    permission_classes = [AllowAny]


# ✅ Sangre
class SangreListCreateView(ListCreateAPIView):
    queryset = Sangre.objects.all()
    serializer_class = SangreSerializer
    permission_classes = [AllowAny]


class SangreDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Sangre.objects.all()
    serializer_class = SangreSerializer
    permission_classes = [AllowAny]


# ✅ Lugar publicación
class LugarPubliListCreateView(ListCreateAPIView):
    queryset = Lugar_publi.objects.all()
    serializer_class = LugarPubliSerializer
    permission_classes = [AllowAny]


class LugarPubliDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Lugar_publi.objects.all()
    serializer_class = LugarPubliSerializer
    permission_classes = [AllowAny]


# ✅ Suscritos
class SuscritosListCreateView(ListCreateAPIView):
    queryset = Suscritos.objects.all()
    serializer_class = SuscritosSerializer
    permission_classes = [AllowAny]


class SuscritosDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Suscritos.objects.all()
    serializer_class = SuscritosSerializer
    permission_classes = [AllowAny]


# ✅ Lugar campaña
class LugarCampanaListCreateView(ListCreateAPIView):
    queryset = Lugar_campana.objects.all()
    serializer_class = LugarCampanaSerializer
    permission_classes = [AllowAny]


class LugarCampanaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Lugar_campana.objects.all()
    serializer_class = LugarCampanaSerializer
    permission_classes = [AllowAny]


# ✅ Campañas
class CampanaListCreateView(ListCreateAPIView):
    queryset = Campana.objects.all()
    serializer_class = CampanaSerializer
    permission_classes = [AllowAny]


class CampanaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Campana.objects.all()
    serializer_class = CampanaSerializer
    permission_classes = [AllowAny]


# ✅ Imágenes de campaña
class ImagenCampanaListCreateView(ListCreateAPIView):
    queryset = Imagen_campana.objects.all()
    serializer_class = ImagenCampanaSerializer
    permission_classes = [AllowAny]


class ImagenCampanaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Imagen_campana.objects.all()
    serializer_class = ImagenCampanaSerializer
    permission_classes = [AllowAny]


# ✅ Mapas
class MapaListCreateView(ListCreateAPIView):
    queryset = Mapa.objects.all()
    serializer_class = MapaSerializer
    permission_classes = [AllowAny]


class MapaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Mapa.objects.all()
    serializer_class = MapaSerializer
    permission_classes = [AllowAny]


# ✅ Buzón
class BuzonListCreateView(ListCreateAPIView):
    queryset = Buzon.objects.all()
    serializer_class = BuzonSerializer
    permission_classes = [AllowAny]


class BuzonDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Buzon.objects.all()
    serializer_class = BuzonSerializer
    permission_classes = [AllowAny]


# ✅ Respuestas
class RespuestaListCreateView(ListCreateAPIView):
    queryset = Respuesta.objects.all()
    serializer_class = RespuestaSerializer
    permission_classes = [AllowAny]


class RespuestaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Respuesta.objects.all()
    serializer_class = RespuestaSerializer
    permission_classes = [AllowAny]



class Imagenes_publiListCreateView(generics.ListCreateAPIView):
    queryset = Imagenes_publi.objects.all()
    serializer_class = Imagenes_publiSerializer

