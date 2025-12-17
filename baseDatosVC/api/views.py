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
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.generics import ListAPIView




from .models import *
from .serializers import *


# ✅ CustomUser

User = get_user_model()


# Crear y listar usuarios (igual que tenías)
class CustomUserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]  # ajustar según necesites

    def perform_create(self, serializer):
        user = serializer.save()
        try:
            group = Group.objects.get(name__iexact="admin")
        except Group.DoesNotExist:
            try:
                group = Group.objects.get(pk=1)
            except Group.DoesNotExist:
                group = Group.objects.create(name="admin")

        user.groups.add(group)
        user.is_staff = True
        user.save(update_fields=["is_staff"])


class CustomUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]  


class UsuarioActualView(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # DEBUG: muestra lo que llega (puedes borrar después)
        print("DEBUG /api/login/admin/ request.data:", request.data)

        serializer = AdminLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    

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

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import Group
from .models import Suscritos
from .serializers import SuscritosSerializer

class SuscritosListCreateView(ListCreateAPIView):
    queryset = Suscritos.objects.all()
    serializer_class = SuscritosSerializer
    permission_classes = [AllowAny]

      

class SuscritosDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Suscritos.objects.all()
    serializer_class = SuscritosSerializer
    permission_classes = [AllowAny]

    def perform_destroy(self, instance):
        # Eliminar participaciones relacionadas
        instance.participaciones.all().delete()
        
        # Si tienes otros modelos relacionados:
        # instance.testimonio_texto_set.all().delete()
        # instance.testimonio_video_set.all().delete()

        # Finalmente eliminar el suscrito
        instance.delete()




# ✅ Lugar campaña
class CantonesListCreateView(ListCreateAPIView):
    queryset = Cantones.objects.all().order_by('id')
    serializer_class = CantonesSerializer


# ✅ Campañas
from rest_framework.parsers import MultiPartParser, FormParser

class CampanasAdminView(ListCreateAPIView):
    queryset = Campana.objects.all().order_by("-id")
    serializer_class = CampanaCreateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]


    def get_serializer_context(self):
        """
        Permite acceder a request dentro del serializer
        """
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

class CampanasPublicasView(ListAPIView):
    queryset = Campana.objects.filter(Activo=True)
    serializer_class = CampanaPublicaSerializer
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
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny,IsAdminUser
from .models import Respuesta
from .serializers import RespuestaSerializer

class RespuestaListCreateView(ListCreateAPIView):
    """
    GET: lista todas las respuestas
    POST: crea una nueva respuesta (espera Buzon_id o que perform_create asigne CustomUser)
    """
    queryset = Respuesta.objects.all()
    serializer_class = RespuestaSerializer


    # opcional: asignar usuario autenticado automáticamente si no se envía CustomUser_id
 

class RespuestaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Respuesta.objects.all()
    serializer_class = RespuestaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


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
    permission_classes = [AllowAny]

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
    permission_classes = [AllowAny]

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
    queryset = Testimonio_texto.objects.all()
    serializer_class = TestimonioTextoSerializer
    permission_classes = [AllowAny]


class Testimonio_textoRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Testimonio_texto.objects.all()
    serializer_class = TestimonioTextoSerializer
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


from rest_framework import status
from rest_framework.response import Response
from django.db import IntegrityError, transaction

#✅ Participacion
class ParticipacionListCreateView(ListCreateAPIView):
    queryset = Participacion.objects.all()
    serializer_class = ParticipacionSerializer

    def create(self, request, *args, **kwargs):
        print("=== NUEVA PETICION /api/participacion/ ===")
        print("request.data:", request.data)
        data = request.data or {}

        numero = (data.get("Numero_cedula") or "").strip()
        campana_id = data.get("campana") or data.get("campana_id")
        create_sub = data.get("createSubscription") or data.get("createSubscription", False)

        if not numero or not campana_id:
            return Response({"detail": "Numero_cedula y campana son requeridos."}, status=status.HTTP_400_BAD_REQUEST)

        # obtener instancia de campana
        try:
            camp = Campana.objects.get(pk=campana_id)
        except Campana.DoesNotExist:
            return Response({"detail": "Campana no encontrada."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                suscrito = Suscritos.objects.select_for_update().filter(Numero_cedula=numero).first()

                if suscrito:
                    # evitar duplicados
                    if Participacion.objects.filter(suscritos=suscrito, campana=camp).exists():
                        return Response({"detail": "El suscrito ya está inscrito en esta campaña."}, status=status.HTTP_400_BAD_REQUEST)

                    create_kwargs = {"suscritos": suscrito, "campana": camp}
                    # asignar sangre si existe en suscrito
                    if getattr(suscrito, "Sangre", None) is not None:
                        create_kwargs["sangre"] = suscrito.Sangre

                    p = Participacion.objects.create(**create_kwargs)
                    serializer = self.get_serializer(p)
                    return Response(serializer.data, status=status.HTTP_201_CREATED)

                # si no existe suscrito
                if not create_sub:
                    return Response({"detail": "No existe suscrito con esa cédula. Envíe createSubscription=true para crearlo."}, status=status.HTTP_400_BAD_REQUEST)

                # crear suscrito (tomando campos seguros desde request.data)
                sus_data = {
                    "Fecha": timezone.now(),
                    "Numero_cedula": numero,
                    "nombre": data.get("nombre") or None,
                    "correo": data.get("email") or data.get("correo") or None,
                    "Telefono": data.get("Telefono") or data.get("telefono") or None,
                }
                sangre_payload = data.get("sangre") or data.get("Sangre") or None
                if sangre_payload:
                    try:
                        sus_data["Sangre_id"] = int(sangre_payload)
                    except Exception:
                        sus_data["Sangre_id"] = sangre_payload

                suscrito = Suscritos.objects.create(**{k: v for k, v in sus_data.items() if v is not None})

                create_kwargs = {"suscritos": suscrito, "campana": camp}
                if getattr(suscrito, "Sangre", None) is not None:
                    create_kwargs["sangre"] = suscrito.Sangre

                p = Participacion.objects.create(**create_kwargs)
                serializer = self.get_serializer(p)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except IntegrityError as ie:
            print("IntegrityError creando participacion:", str(ie))
            return Response({"detail": "Error de integridad", "error": str(ie)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            print("Error inesperado al crear participacion:", str(e))
            print(tb)
            return Response({"detail": "Error interno", "error": str(e), "traceback": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

  
class ParticipacionDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Participacion.objects.all()
    serializer_class = ParticipacionSerializer
    permission_classes = [AllowAny]

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Suscritos
from .serializers import SuscritosSerializer

@api_view(['GET'])
def buscar_suscrito_por_cedula(request):
    cedula = request.GET.get('cedula')

    if not cedula:
        return Response({"error": "Debe enviar la cédula"}, status=400)

    try:
        suscrito = Suscritos.objects.get(Numero_cedula=cedula)
    except Suscritos.DoesNotExist:
        return Response({"error": "No encontrado"}, status=404)

    serializer = SuscritosSerializer(suscrito)
    return Response(serializer.data)



from rest_framework.generics import ListAPIView
class FaqPublicView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = FaqPublicSerializer

    def get_queryset(self):
        return (
            Respuesta.objects
            .filter(estado=True)
            .select_related("Buzon")
            .order_by("Fecha")
           

        )