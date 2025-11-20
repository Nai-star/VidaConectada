from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group
from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import ValidationError


from .models import *
from .serializers import *


# ✅ CustomUser
class CustomUserListCreateView(ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    filterset_fields = ['correo']  # Esto permite ?correo=...
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
class CantonesListCreateView(ListCreateAPIView):
    queryset = Cantones.objects.all().order_by('id')
    serializer_class = CantonesSerializer


# ✅ Campañas
class CampanaListCreateView(ListCreateAPIView):
    queryset = Campana.objects.all()
    serializer_class = CampanaSerializer
    permission_classes = [AllowAny]


class CampanaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Campana.objects.all()
    serializer_class = CampanaCreateSerializer
    permission_classes = [AllowAny]


# ✅ Imágenes de campaña
class ImagenCampanaListCreateView(ListCreateAPIView):
    queryset = Imagen_campana.objects.all()
    serializer_class =ImagenCampanaSerializer
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



#Tiopo de sangre necesitada
class Urgente_Tip_SangListCreateView(ListCreateAPIView):
    queryset = Urgente_Tip_Sang.objects.all()
    serializer_class = Urgente_Tip_SangSerializer
    permission_classes = [AllowAny]


class Urgente_Tip_SangRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Urgente_Tip_Sang.objects.all()
    serializer_class = Urgente_Tip_SangSerializer
    permission_classes = [AllowAny]

#Requisitos
class RequisitosListCreateView(ListCreateAPIView):
    queryset =  Requisitos.objects.all()
    serializer_class =  RequisitosSerializer
    permission_classes = [AllowAny] #[IsAuthenticatedOrReadOnly] cambiar despues


class  RequisitosRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset =  Requisitos.objects.all()
    serializer_class =  RequisitosSerializer
    permission_classes = [IsAuthenticated]

#Carrusel
class CaruselListCreateView(ListCreateAPIView):
    queryset = carusel.objects.all().order_by("id")
    serializer_class = CaruselSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        print("FILES:", request.FILES)
        return super().create(request, *args, **kwargs)


class CaruselRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = carusel.objects.all()
    serializer_class =  CaruselSerializer
    permission_classes = [IsAuthenticated]

#galeria

class GaleriaListCreateView(ListCreateAPIView):
    queryset =  Galeria.objects.all()
    serializer_class =  GaleriaSerializer
    permission_classes = [AllowAny]


class  GaleriaRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset =  Galeria.objects.all()
    serializer_class =  GaleriaSerializer
    permission_classes = [AllowAny]

#Provincia
class ProvinciaListCreateView(ListCreateAPIView):
    queryset = Provincia.objects.all()
    serializer_class =  ProvinciaSerializer
    permission_classes = [AllowAny]


class  ProvinciaRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset =  Provincia.objects.all()
    serializer_class =  ProvinciaSerializer
    permission_classes = [AllowAny]

#Cantones
class CantonesListCreateView(ListCreateAPIView):
    queryset = Cantones.objects.all()
    serializer_class =  CantonesSerializer
    permission_classes = [AllowAny]


class CantonesRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Cantones.objects.all()
    serializer_class = CantonesSerializer
    permission_classes = [AllowAny]

class Red_bancosListCreateView(ListCreateAPIView):
    queryset = Red_bancos.objects.all()
    serializer_class = Red_bancosSerializer
    permission_classes = [AllowAny]


class Red_bancosRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset =Red_bancos.objects.all()
    serializer_class = Red_bancosSerializer
    permission_classes = [AllowAny]



class Testimonio_textoListCreateView(ListCreateAPIView):
    queryset = Testimonio.objects.all()
    serializer_class = TestimonioFullSerializer
    permission_classes = [AllowAny]


class Testimonio_textoRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Testimonio.objects.all()
    serializer_class = TestimonioFullSerializer
    permission_classes = [AllowAny]

class Testimonio_videoListCreateView(ListCreateAPIView):
    queryset = Testimonio.objects.all()
    serializer_class = TestimonioVideoSerializer
    permission_classes = [AllowAny]


class Testimonio_videoRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Testimonio.objects.all()
    serializer_class = TestimonioVideoSerializer
    permission_classes = [AllowAny]


from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
			serializer_class = CustomTokenObtainPairSerializer


#✅ Participacion
class ParticipacionListCreateView(ListCreateAPIView):
    queryset = Participacion.objects.all()
    serializer_class = ParticipacionSerializer

    def create(self, request, *args, **kwargs):
        print("=== NUEVA PETICION /api/participacion/ ===")
        print("request.data:", request.data)  # muestra exactamente lo que llega

        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            print("Participación creada:", serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError as ve:
            # Imprime errores legibles en consola de Django
            print("ValidationError:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Otros errores
            print("Error inesperado al crear participacion:", str(e))
            return Response({"detail": "Error interno"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ParticipacionDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Participacion.objects.all()
    serializer_class = ParticipacionSerializer
    permission_classes = [AllowAny]
