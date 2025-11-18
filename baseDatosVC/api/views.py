from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser






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


# ✅ Sangre
class SangreListCreateView(ListCreateAPIView):
    queryset = Sangre.objects.all()
    serializer_class = SangreSerializer
    permission_classes = [AllowAny]


class SangreDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Sangre.objects.all()
    serializer_class = SangreSerializer
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

""" class LugarCampanaListCreateView(ListCreateAPIView):
    queryset = Lugar_campana.objects.all()
    serializer_class = LugarCampanaSerializer
    permission_classes = [AllowAny]


class LugarCampanaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Lugar_campana.objects.all()
    serializer_class = LugarCampanaSerializer
    permission_classes = [AllowAny]
 """


# ✅ Campañas
class CampanaListCreateView(ListCreateAPIView):
    queryset = Campana.objects.all()
    serializer_class = CampanaCreateSerializer
    permission_classes = [AllowAny]


class CampanaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Campana.objects.all()
    serializer_class = CampanaCreateSerializer
    permission_classes = [AllowAny]


# ✅ Imágenes de campaña
class ImagenCampanaListCreateView(ListCreateAPIView):
    queryset = Imagen_campana.objects.all()
    serializer_class =Imagen_campanaSerializer
    permission_classes = [AllowAny]


class ImagenCampanaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Imagen_campana.objects.all()
    serializer_class = Imagen_campanaSerializer
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
from rest_framework.response import Response

class BuzonListCreateView(ListCreateAPIView):
    queryset = Buzon.objects.all()
    serializer_class = BuzonSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        print("📩 Datos recibidos en la API:", request.data)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("❌ Errores de validación:", serializer.errors)
            return Response(serializer.errors, status=400)
        self.perform_create(serializer)
        print("✅ Datos guardados correctamente:", serializer.data)
        return Response(serializer.data, status=201)



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









class Urgente_Tip_SangListCreateView(ListCreateAPIView):
    queryset = Urgente_Tip_Sang.objects.all()
    serializer_class = Urgente_Tip_SangSerializer
    permission_classes = [AllowAny]


class Urgente_Tip_SangRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Urgente_Tip_Sang.objects.all()
    serializer_class = Urgente_Tip_SangSerializer
    permission_classes = [AllowAny]


class RequisitosListCreateView(ListCreateAPIView):
    queryset =  Requisitos.objects.all()
    serializer_class =  RequisitosSerializer
    permission_classes = [AllowAny] #[IsAuthenticatedOrReadOnly] cambiar despues


class  RequisitosRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset =  Requisitos.objects.all()
    serializer_class =  RequisitosSerializer
    permission_classes = [IsAuthenticated]
    
class CaruselListCreateView(ListCreateAPIView):
    queryset = carusel.objects.all().order_by("id")
    serializer_class = CaruselSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        print("FILES:", request.FILES)
        return super().create(request, *args, **kwargs)

#galeria

class GaleriaListCreateView(ListCreateAPIView):
    queryset =  Galeria.objects.all()
    serializer_class =  GaleriaSerializer
    permission_classes = [AllowAny]


class  GaleriaRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset =  Galeria.objects.all()
    serializer_class =  GaleriaSerializer
    permission_classes = [AllowAny]


from rest_framework_simplejwt.views import TokenObtainPairView
class CustomTokenObtainPairView(TokenObtainPairView):
			serializer_class = CustomTokenObtainPairSerializer

