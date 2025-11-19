from.models import *
from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import Campana, Cantones, Imagen_campana, DetalleRequisitos, Requisitos, CustomUser, Galeria
""" from .models import CustomUser """
from .models import Buzon

#Usuarios
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class CustomUserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)  # Muestra los grupos a los que pertenece
    group_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Group.objects.all(), source='groups'
    )

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'password', 'email',
            'first_name', 'last_name', 'Telefono', 'Edad', 'groups', 'group_ids'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        groups = validated_data.pop('groups', [])
        validated_data['password'] = make_password(validated_data['password'])
        user = super().create(validated_data)
        user.groups.set(groups)
        return user
    

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



from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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