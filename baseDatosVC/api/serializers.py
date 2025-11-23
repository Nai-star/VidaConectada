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
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group


#Usuarios
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

        # Buscar usuario por email (case-insensitive)
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Credenciales inválidas.")

        # Verificar contraseña
        if not user.check_password(password):
            raise serializers.ValidationError("Credenciales inválidas.")

        # Verificar que esté activo
        if not user.is_active:
            raise serializers.ValidationError("Cuenta desactivada.")

        # Verificar rol admin: permitimos is_superuser o is_staff o grupo 'admin' o id=1
        is_admin = user.is_superuser or user.is_staff \
                   or user.groups.filter(id=1).exists() \
                   or user.groups.filter(name__iexact="admin").exists()

        if not is_admin:
            raise serializers.ValidationError("No autorizado: solo administradores.")

        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return {
            "refresh": str(refresh),
            "access": str(access),
            "user_id": user.id,
            "user_email": user.email or ""
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


# serializers.py
class SuscritosSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(write_only=True)
    apellido = serializers.CharField(write_only=True)
    correo = serializers.EmailField(write_only=True)
    tipo_sangre = serializers.CharField(write_only=True)

    class Meta:
        model = Suscritos
        fields = ['id', 'nombre', 'apellido', 'correo', 'tipo_sangre', 'Fecha']

    def create(self, validated_data):
        # Crear o buscar usuario
        user, _ = CustomUser.objects.get_or_create(
            email=validated_data['correo'],
            defaults={
                'first_name': validated_data['nombre'],
                'last_name': validated_data['apellido']
            }
        )
        # Buscar tipo de sangre
        sangre = Sangre.objects.get(tipo_sangre=validated_data['tipo_sangre'])

        # Crear suscrito
        suscrito = Suscritos.objects.create(CustomUser=user, Sangre=sangre)
        return suscrito



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
        fields = ['id', 'imagen', 'imagen_url', 'imagen_public_id']

    def get_imagen_url(self, obj):
        try:
            return obj.imagen.url
        except Exception:
            return None

    def get_imagen_public_id(self, obj):
        try:
            return str(obj.imagen)
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
            "Canton",
            "Canton_nombre",
            "direccion_exacta",
            "imagen",
            "detalles_requisitos",
            #"requisitos",
        ]

    def create(self, validated_data):

        imagenes = validated_data.pop("imagen")
        #   requisitos = validated_data.pop("requisitos")

        # Crear campaña
        campana = Campana.objects.create(**validated_data)

        # Crear imágenes
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
    Buzon = BuzonSerializer(read_only=True) 
    class Meta:
        model = Respuesta
        fields = ['id', 'Respuesta_P', 'estado', 'Fecha', 'CustomUser', 'Buzon']




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
        fields = '__all__'


class CaruselSerializer(serializers.ModelSerializer):
 
    imagenes = serializers.SerializerMethodField()


# ---------------- Carusel ----------------
class CaruselSerializer(serializers.ModelSerializer):

    class Meta:
        model = carusel
        fields = [
            'id', 'imagen', 'texto', 'estado',
            'filtro_oscuro', 'mostrar_texto'
        ]

    def validate(self, data):
        nuevo_estado = data.get('estado', True)
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
            
# Campana serializer: devolvemos los related names EXACTOS que usa tu frontend:
# - "Imagen_campana" (lista)
# - "DetalleRequisito" (lista)
class CampanaSerializer(serializers.ModelSerializer):
    Fecha_inicio = serializers.DateField(format="%d-%m-%Y", input_formats=["%d-%m-%Y", "%Y-%m-%d"])
    Fecha_fin = serializers.DateField(format="%d-%m-%Y", input_formats=["%d-%m-%Y", "%Y-%m-%d"])

    Imagen_campana = ImagenCampanaSerializer(many=True, read_only=True)
    DetalleRequisito = DetalleRequisitosSerializer(many=True, read_only=True)

    Cantones = serializers.PrimaryKeyRelatedField(queryset=Cantones.objects.all(), required=False, allow_null=True)
    imagen = serializers.ListField(child=serializers.ImageField(), write_only=True, required=False)
    requisitos = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)

    class Meta:
        model = Campana
        fields = [
            'id', 'Titulo', 'Descripcion', 'Fecha_inicio', 'Fecha_fin',
            'Hora_inicio', 'Hora_fin', 'Activo', 'Contacto', 'direccion_exacta',
            'CustomUser', 'Cantones', 'Imagen_campana', 'DetalleRequisito',
            'imagen', 'requisitos'
        ]
        read_only_fields = ['id', 'Imagen_campana', 'DetalleRequisito']

    def create(self, validated_data):
        imagenes = validated_data.pop('imagen', [])
        requisitos_ids = validated_data.pop('requisitos', [])
        cantones = validated_data.pop('Cantones', None)

        # Asignar usuario desde request si existe
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['CustomUser'] = request.user

        if cantones:
            validated_data['Cantones'] = cantones

        campana = Campana.objects.create(**validated_data)

        # Crear imágenes
        for img in imagenes:
            Imagen_campana.objects.create(Campana=campana, imagen=img)

        # Crear detalle de requisitos
        for rid in requisitos_ids:
            DetalleRequisitos.objects.create(Campana=campana, Requisitos_id=rid, CustomUser=campana.CustomUser)

        return campana
    


# ✅ Participacion
class ParticipacionSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    nombre = serializers.CharField(write_only=True, required=False, allow_blank=True)
    apellido = serializers.CharField(write_only=True, required=False, allow_blank=True)
    createSubscription = serializers.BooleanField(write_only=True, required=False, default=False)

    user = serializers.PrimaryKeyRelatedField(read_only=True)
    sangre = serializers.PrimaryKeyRelatedField(queryset=Sangre.objects.all(), required=False, allow_null=True)
    campana = serializers.PrimaryKeyRelatedField(queryset=Campana.objects.all())

    class Meta:
        model = Participacion
        fields = [
            "id",
            "user",
            "email",
            "nombre",
            "apellido",
            "sangre",
            "campana",
            "fecha_participacion",
            "createSubscription",
        ]
        read_only_fields = ["id", "user", "fecha_participacion"]

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        if not email:
            raise serializers.ValidationError({"email": "Se requiere el correo para verificar/identificar al usuario."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        email = (validated_data.pop("email", "") or "").strip().lower()
        nombre_payload = validated_data.pop("nombre", "").strip()
        apellido_payload = validated_data.pop("apellido", "").strip()
        create_sub = validated_data.pop("createSubscription", False)
        sangre_obj = validated_data.get("sangre", None)
        campana_obj = validated_data.get("campana")

        user = CustomUser.objects.filter(email__iexact=email).first()

        if user:
            if Participacion.objects.filter(user=user, campana=campana_obj).exists():
                raise serializers.ValidationError("El usuario ya está inscrito en esta campaña.")
            validated_data["user"] = user
            if not sangre_obj:
                sus = Suscritos.objects.filter(CustomUser=user).select_related("Sangre").first()
                if sus:
                    validated_data["sangre"] = sus.Sangre
            participacion = Participacion.objects.create(**validated_data)
            return participacion

        if not user and not create_sub:
            raise serializers.ValidationError(
                "No existe un usuario con ese correo. Envía createSubscription=true para crear el usuario automáticamente."
            )

        local_part = email.split("@")[0] if "@" in email else email
        suggested_username = f"{local_part}_{int(time.time())}"
        user = CustomUser.objects.create_user(username=suggested_username, email=email)
        if nombre_payload:
            user.first_name = nombre_payload
        if apellido_payload:
            user.last_name = apellido_payload
        user.save()

        if sangre_obj:
            if not Suscritos.objects.filter(CustomUser=user, Sangre=sangre_obj).exists():
                Suscritos.objects.create(CustomUser=user, Sangre=sangre_obj)

        validated_data["user"] = user
        participacion = Participacion.objects.create(**validated_data)
        return participacion