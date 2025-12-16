from.models import *
from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.db import transaction
import time
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.models import Group as AuthGroup
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
#from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group


#Usuarios
from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


User = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "first_name", "last_name", "email",
            "password", "is_staff", "is_active", "date_joined",
            "Telefono", "Edad",
        ]
        read_only_fields = ["id", "date_joined"]

    def validate_email(self, value):
        # si estás actualizando un usuario, permitir el mismo email del usuario actual
        user = self.instance
        if User.objects.filter(email__iexact=value).exclude(pk=getattr(user, "pk", None)).exists():
            raise serializers.ValidationError("El correo ya está registrado.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()

        # Asignar al grupo 'admin' (por nombre preferiblemente)
        try:
            group = Group.objects.get(name__iexact="admin")
        except Group.DoesNotExist:
            # fallback por id=1 (si realmente necesitas) o crear el grupo
            try:
                group = Group.objects.get(pk=1)
            except Group.DoesNotExist:
                group = Group.objects.create(name="admin")

        user.groups.add(group)
        user.is_staff = True
        user.save(update_fields=["is_staff"])
        return user

User = get_user_model()

class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    user_email = serializers.EmailField(read_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Se requieren email y password.")

        # 1️⃣ Buscar usuario por email
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Credenciales inválidas.")

        # 2️⃣ Verificar contraseña
        if not user.check_password(password):
            raise serializers.ValidationError("Credenciales inválidas.")

        # 3️⃣ Verificar activo
        if not user.is_active:
            raise serializers.ValidationError("Cuenta desactivada.")

        # 4️⃣ VALIDACIÓN REAL DE ADMIN (TU TABLA)
        is_admin = UsuarioRol.objects.filter(
            customuser=user,
            group_id=1
        ).exists()

        if not is_admin:
            raise serializers.ValidationError(
                "No autorizado: solo administradores."
            )

        # 5️⃣ Generar tokens
        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user_id": user.id,
            "user_email": user.email or "",
        }
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extiende TokenObtainPairSerializer para permitir login por email o username.
    Útil si quieres usar /api/login/ con SimpleJWT pero con email.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Puedes agregar claims personalizados aquí si necesitas
        return token

    def validate(self, attrs):
        # attrs contiene 'username' y 'password' por defecto en TokenObtainPairSerializer
        username = attrs.get("username")
        password = attrs.get("password")

        # si client envía 'username' como email, intentar resolver a username real
        user = authenticate(username=username, password=password)
        if not user:
            try:
                candidate = User.objects.get(email__iexact=username)
                user = authenticate(username=candidate.username, password=password)
            except User.DoesNotExist:
                user = None

        if not user:
            raise serializers.ValidationError("Credenciales inválidas.")

        # Llamar al flujo normal para generar tokens
        data = super().validate({"username": user.username, "password": password})
        return data
    

#Publicaciones
class ImagenesPubliSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imagenes_publi
        fields = '__all__'


class PublicacionesSerializer(serializers.ModelSerializer):
    Imagenes_publi = ImagenesPubliSerializer(many=True, read_only=True)

    class Meta:
        model = Publicaciones
        fields = {'Texto','imagen','Estado'}


#Suscritos
class SangreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sangre
        fields = '__all__'



class SuscritosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suscritos
        fields = "__all__"
        extra_kwargs = {
            "Telefono": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate(self, data):
        # ... (Validaciones existentes para cedula y correo)

        cedula = data.get("Numero_cedula")
        correo = data.get("correo") # Asegúrate de que este nombre coincida con tu modelo: 'correo' o 'Correo'
        
        # --- NUEVA VALIDACIÓN PARA TELÉFONO ---
        telefono = data.get("Telefono") 
        suscrito_id = self.instance.id if self.instance else None

        if telefono:
            if Suscritos.objects.filter(Telefono=telefono).exclude(id=suscrito_id).exists():
                raise serializers.ValidationError({
                    "Telefono": "Este número de teléfono ya está registrado."
                })
        
        # --- Validaciones existentes para CÉDULA ---
        if cedula:
            if Suscritos.objects.filter(Numero_cedula=cedula).exclude(id=suscrito_id).exists():
                raise serializers.ValidationError({
                    "Numero_cedula": "Esta cédula ya pertenece a un suscrito."
                })

        # --- Validaciones existentes para CORREO ---
        if correo:
            # Asumiendo que el campo en el modelo es 'correo' (minúscula)
            if Suscritos.objects.filter(correo__iexact=correo).exclude(id=suscrito_id).exists():
                 raise serializers.ValidationError({
                     "correo": "Este correo ya está registrado."
                 })

        return data



#Campaña

class RequisitosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requisitos
        fields = ["requisitos","Estado"]


class ProvinciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provincia
        fields = '__all__'

class CantonesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cantones
        fields = '__all__'


# ---------------- Campana ----------------
class ImagenCampanaSerializer(serializers.ModelSerializer):
    imagen_url = serializers.SerializerMethodField()
    imagen_public_id = serializers.SerializerMethodField()

    class Meta:
        model = Imagen_campana
        fields = ["id", "imagen_url", "imagen_public_id"]

    def get_imagen_url(self, obj):
        try:
            return obj.imagen.url  # Cloudinary devuelve URL completa
        except Exception:
            return None

    def get_imagen_public_id(self, obj):
        try:
            return obj.imagen.public_id
        except Exception:
            return None




class RequisitosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requisitos
        fields = ["id", "requisitos", "Estado"]


class DetalleRequisitosSerializer(serializers.ModelSerializer):
    Requisitos = RequisitosSerializer(read_only=True)  # deja "Requisitos" tal cual
    CustomUser_info = serializers.StringRelatedField(source='CustomUser', read_only=True)

    class Meta:
        model = DetalleRequisitos
        fields = ['id', 'Campana', 'Requisitos', 'CustomUser', 'CustomUser_info', 'Estado']
        read_only_fields = ['id', 'Requisitos', 'CustomUser_info']


# ----- Provincias / Cantones -----
class ProvinciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provincia
        fields = ['id', 'nombre_p']
        read_only_fields = ['id']


class CantonesSerializer(serializers.ModelSerializer):
    Provincia = ProvinciaSerializer(read_only=True)

    class Meta:
        model = Cantones
        fields = ['id', 'nombre_canton', 'Provincia']
        read_only_fields = ['id', 'Provincia']



class CampanaCreateSerializer(serializers.ModelSerializer):
    Canton_nombre = serializers.CharField(source="Cantones.nombre_canton", read_only=True)
    detalles_requisitos = DetalleRequisitosSerializer(
        source="detallerequisitos_set", many=True, read_only=True
    )

    imagen = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True
    )

    class Meta:
        model = Campana
        fields = [
            "Titulo",
            "Descripcion",
            "Fecha_inicio",
            "Fecha_fin",
            "Contacto",
            "CustomUser",
            "Cantones",
            "Canton_nombre",
            "direccion_exacta",
            "imagen",
            "detalles_requisitos",
            #"requisitos",
        ]

    def create(self, validated_data):
        imagenes = validated_data.pop("imagen")

        request = self.context["request"]        # ← Aquí está el usuario autenticado

        campana = Campana.objects.create(
            CustomUser=request.user,             # ← usuario automático
            **validated_data
        )

        for img in imagenes:
            Imagen_campana.objects.create(
                Campana=campana,
                imagen=img
            )

        return campana


      


class MapaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mapa
        fields = '__all__'

#Preguntas y rspuestas

class BuzonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Buzon
        fields = ['id', 'Nombre_persona', 'correo', 'pregunta', 'estado', 'fecha']

class RespuestaSerializer(serializers.ModelSerializer):
    """ Buzon_id = serializers.PrimaryKeyRelatedField(
        queryset=Buzon.objects.all(),
        source='Buzon',
        write_only=True
    ) """

    class Meta:
        model = Respuesta
        fields = '__all__'



#sangre urgente
class Urgente_Tip_SangSerializer(serializers.ModelSerializer):
    class Meta:
        model = Urgente_Tip_Sang
        fields = '__all__'

class GaleriaSerializer(serializers.ModelSerializer):
    # Campo calculado que devuelve la URL de Cloudinary
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Galeria
        # Incluye 'image_url' explícitamente
        fields = ['id', 'image_url', 'descripcion', 'video_url', 'fecha_publicacion', 'activo', 'CustomUser']

    def get_image_url(self, obj):
        try:
            return obj.imagen_g.url if obj.imagen_g else None
        except Exception:
            return None

class Red_bancosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Red_bancos
        fields = ['id', 'nombre_hospi', 'horarios', 'hora', 'Contacto', 'Notas']




# ---------------- Carusel ----------------
# serializers.py (o donde tengas CaruselSerializer)


class CaruselSerializer(serializers.ModelSerializer):
    texto = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = carusel
        fields = [
            'id', 'imagen', 'texto', 'estado',
            'filtro_oscuro', 'mostrar_texto'
        ]

    def validate(self, data):
        nuevo_estado = data.get('estado', True)
        if 'texto' not in data:
            data['texto'] = ""
        if nuevo_estado:
            activos = carusel.objects.filter(estado=True)
            if self.instance:
                activos = activos.exclude(pk=self.instance.pk)
            if activos.count() >= 5:
                raise serializers.ValidationError("Solo se permiten 5 imágenes activas en el carrusel.")
        return data


# ---------------- JWT Custom Serializer ----------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
			def validate(self, attrs):
				data = super().validate(attrs)

				# Obtener el grupo del usuario (rol)
				groups = self.user.groups.values_list('name', flat=True)
				user = self.user.groups.values_list('name', flat=True)

				# Agrega el primer grupo como 'role'
				data['role'] = groups[0] if groups else None
				data['id'] = self.user.id 

				return data
            

from rest_framework import serializers
from .models import Campana, Imagen_campana, DetalleRequisitos, Cantones


class DetalleRequisitosSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleRequisitos
        fields = ["id", "requisito"]


class CampanaCreateSerializer(serializers.ModelSerializer):
    Fecha_inicio = serializers.DateField(
        format="%d-%m-%Y",
        input_formats=["%d-%m-%Y", "%Y-%m-%d"]
    )
    Fecha_fin = serializers.DateField(
        format="%d-%m-%Y",
        input_formats=["%d-%m-%Y", "%Y-%m-%d"]
    )

    CustomUser = serializers.PrimaryKeyRelatedField(read_only=True)

    Cantones = serializers.PrimaryKeyRelatedField(
        queryset=Cantones.objects.all(),
        required=False,
        allow_null=True
    )

    Canton_nombre = serializers.CharField(
        source="Cantones.nombre_canton",
        read_only=True
    )

    detalles_requisitos = DetalleRequisitosSerializer(
        source="detallerequisitos_set",
        many=True,
        read_only=True
    )

    # 🔴 SOLO PARA ESCRIBIR
    imagen = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    # 🟢 SOLO PARA LEER
    Imagenes = ImagenCampanaSerializer(
        source="Imagen_campana",
        many=True,
        read_only=True
    )

    class Meta:
        model = Campana
        fields = [
            "id",
            "Titulo",
            "Descripcion",
            "Fecha_inicio",
            "Fecha_fin",
            "Hora_inicio",
            "Hora_fin",
            "Activo",
            "Contacto",
            "direccion_exacta",
            "CustomUser",
            "Cantones",
            "Canton_nombre",
            "imagen",
            "Imagenes",   # 🔥 CLAVE
            "detalles_requisitos",
        ]
        read_only_fields = ["id", "CustomUser"]

    def create(self, validated_data):
        imagenes = validated_data.pop("imagen", [])
        validated_data.pop("CustomUser", None)

        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Usuario no autenticado")

        campana = Campana.objects.create(
            CustomUser=request.user,
            **validated_data
        )

        for img in imagenes:
            Imagen_campana.objects.create(
                Campana=campana,
                imagen=img
            )

        return campana


class CampanaPublicaSerializer(serializers.ModelSerializer):
    Canton_nombre = serializers.CharField(
        source="Cantones.nombre_canton",
        read_only=True
    )

    detalles_requisitos = DetalleRequisitosSerializer(
        source="detallerequisitos_set",
        many=True,
        read_only=True
    )

    Imagenes = ImagenCampanaSerializer(
        source="Imagen_campana",
        many=True,
        read_only=True
    )

    class Meta:
        model = Campana
        fields = [
            "id",
            "Titulo",
            "Descripcion",
            "Fecha_inicio",
            "Fecha_fin",
            "Hora_inicio",
            "Hora_fin",
            "Contacto",
            "direccion_exacta",
            "Canton_nombre",
            "Imagenes",
            "detalles_requisitos",
        ]


from rest_framework import serializers
from .models import Testimonio, Testimonio_texto
from django.contrib.auth import get_user_model

User = get_user_model()

class TestimonioTextoSerializer(serializers.ModelSerializer):
    # Construimos la URL completa de la foto
    Foto_P = serializers.SerializerMethodField()

    class Meta:
        model = Testimonio_texto
        fields = ["Nombre", "Frase", "Foto_P"]

    def get_Foto_P(self, obj):
        if obj.Foto_P:
            request = self.context.get("request")
            if request is not None:
                return request.build_absolute_uri(obj.Foto_P.url)
            return obj.Foto_P.url
        return None

class TestimonioSerializer(serializers.ModelSerializer):
    # Para creación
    Nombre = serializers.CharField(write_only=True, required=False)
    Frase = serializers.CharField(write_only=True, required=False)
    Foto_P = serializers.ImageField(write_only=True, required=False)
    CustomUser = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    # Para lectura: todos los textos asociados
    Testimonio_texto = TestimonioTextoSerializer(many=True, read_only=True)

    class Meta:
        model = Testimonio
        fields = ["CustomUser", "Estado", "Nombre", "Frase", "Foto_P", "Testimonio_texto", "fecha_publicacion"]

    def create(self, validated_data):
        nombre = validated_data.pop("Nombre", None)
        frase = validated_data.pop("Frase", None)
        foto = validated_data.pop("Foto_P", None)

        # Crear Testimonio principal
        testimonio = Testimonio.objects.create(**validated_data)

        # Crear Testimonio_texto solo si hay datos
        if nombre or frase or foto:
            Testimonio_texto.objects.create(
                Testimonio=testimonio,
                Nombre=nombre or "",
                Frase=frase or "",
                Foto_P=foto
            )

        return testimonio



from rest_framework import serializers
from .models import Testimonio, Testimonio_video

class TestimonioVideoSerializer(serializers.ModelSerializer):
    # Campos para crear el video
    Descripcion = serializers.CharField(write_only=True)
    Video = serializers.FileField(write_only=True)  # Aquí aceptamos el archivo de video

    # Para lectura
    Testimonio_video = serializers.SerializerMethodField()

    class Meta:
        model = Testimonio
        fields = ["CustomUser", "Estado", "Descripcion", "Video", "Testimonio_video","fecha_publicacion"]

    def create(self, validated_data):
        descripcion = validated_data.pop("Descripcion")
        video = validated_data.pop("Video")
        user = validated_data.pop("CustomUser")

        # Crear Testimonio
        testimonio = Testimonio.objects.create(CustomUser=user, **validated_data)

        # Crear Testimonio_video con archivo subido
        Testimonio_video.objects.create(
            Testimonio=testimonio,
            Descripcion=descripcion,
            Video=video
        )

        return testimonio

    def get_Testimonio_video(self, obj):
        videos = obj.Testimonio_video.all()
        return [{"Descripcion": v.Descripcion, "Video": v.Video.url if v.Video else None} for v in videos]

    

class ParticipacionSerializer(serializers.ModelSerializer):
    Numero_cedula = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    nombre = serializers.CharField(write_only=True, required=False, allow_blank=True)
    createSubscription = serializers.BooleanField(write_only=True, required=False, default=False)

    suscrito = serializers.PrimaryKeyRelatedField(source="suscritos", read_only=True)
    campana = serializers.PrimaryKeyRelatedField(queryset=Campana.objects.all())

    class Meta:
        model = Participacion
        fields = [
            "id",
            "suscrito",
            "Numero_cedula",
            "email",
            "nombre",
            "campana",
            "fecha_participacion",
            "createSubscription",
        ]
        read_only_fields = ["id", "suscrito", "fecha_participacion"]

    def validate(self, attrs):
        numero = (attrs.get("Numero_cedula") or "").strip()
        if not numero:
            raise serializers.ValidationError({"Numero_cedula": "Se requiere Numero_cedula."})
        return attrs
    
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from django.db import transaction
import traceback

@transaction.atomic
def create(self, validated_data):
        # Extraer y normalizar datos que NO son campos directos del modelo Participacion
        numero = (validated_data.pop("Numero_cedula", "") or "").strip()
        email = (validated_data.pop("email", "") or "").strip() or None
        nombre_payload = (validated_data.pop("nombre", "") or "").strip() or None
        create_sub = validated_data.pop("createSubscription", False)

        # campana ya estará en validated_data como objeto (PrimaryKeyRelatedField)
        campana_obj = validated_data.get("campana", None)

        # Eliminar claves que podrían colarse y provocar TypeError
        validated_data.pop("sangre", None)
        validated_data.pop("Sangre", None)
        validated_data.pop("Numero_cedula", None)

        # Debug corto
        print("Participacion.create() — numero:", numero, "campana:", campana_obj)
        print("Participacion.create() — validated_data (rest):", list(validated_data.keys()))

        # Buscar suscrito con lock
        suscrito = Suscritos.objects.filter(Numero_cedula=numero).select_for_update().first()
        print("Participacion.create() — suscrito encontrado:", bool(suscrito))

        # ----------------- Caso: suscrito ya existe -----------------
        if suscrito:
            # Si ya existe participacion para esta campaña → error controlado
            if Participacion.objects.filter(suscritos=suscrito, campana=campana_obj).exists():
                raise ValidationError({"detail": "El suscrito ya está inscrito en esta campaña."})

            # Construir kwargs explícitos (solo campos válidos del modelo Participacion)
            create_kwargs = {
                "suscritos": suscrito,
                "campana": campana_obj,
            }

            # Asignar sangre desde el suscrito si aplica
            try:
                sangre_val = getattr(suscrito, "Sangre", None)
                if sangre_val is not None:
                    create_kwargs["sangre"] = sangre_val
            except Exception:
                pass

            try:
                created = Participacion.objects.create(**create_kwargs)
                return created
            except Exception as e:
                print("Error creando Participacion (suscrito existente):", str(e))
                print(traceback.format_exc())
                raise ValidationError({"detail": "Error creando participación: " + str(e)})

        # ----------------- Caso: suscrito NO existe -----------------
        if not create_sub:
            raise ValidationError({"detail": "No existe un suscrito con esa cédula. Envíe createSubscription=true para crearlo."})

        # Crear nuevo suscrito
        suscrito_data = {
            "Fecha": timezone.now(),
            "Numero_cedula": numero,
            "correo": email,
            "nombre": nombre_payload,
        }

        # Mapear sangre si vino en payload inicial
        sangre_payload = self.initial_data.get("sangre") or self.initial_data.get("Sangre")
        if sangre_payload:
            try:
                suscrito_data["Sangre_id"] = int(sangre_payload)
            except Exception:
                suscrito_data["Sangre_id"] = sangre_payload

        print("Creando Suscrito con:", suscrito_data)
        suscrito = Suscritos.objects.create(**{k: v for k, v in suscrito_data.items() if v is not None})

        # Preparar kwargs para la participacion ligada al suscrito creado
        create_kwargs = {"suscritos": suscrito, "campana": campana_obj}
        try:
            sangre_val = getattr(suscrito, "Sangre", None)
            if sangre_val is not None:
                create_kwargs["sangre"] = sangre_val
        except Exception:
            pass

        try:
            created = Participacion.objects.create(**create_kwargs)
            return created
        except Exception as e:
            print("Error creando Participacion tras crear Suscrito:", str(e))
            print(traceback.format_exc())
            raise ValidationError({"detail": "Error creando la participación: " + str(e)})





class FaqPublicSerializer(serializers.ModelSerializer):
    pregunta = serializers.CharField(source="Buzon.pregunta", read_only=True)

    class Meta:
        model = Respuesta
        fields = [
            "id",
            "pregunta",
            "Respuesta_P",
            "Fecha",
            "estado",
            

        ]