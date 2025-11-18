from.models import *
from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import CustomUser
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


class LugarCampanaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lugar_campana
        fields = [
            "id",
            "Nombre_lugar",
            "Canton",
            "Direcion",
        ]


class Imagen_campanaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imagen_campana
        fields = ["id", "imagen"]   # ← CORREGIDO




class RequisitosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requisitos
        fields = ["id", "requisitos", "Estado"]



""" class ImagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imagen_campana
        fields = ["id", "imagen"]
 """

class CampanaCreateSerializer(serializers.ModelSerializer):

    # Lugar y requisitos vienen del request
    Nombre_lugar = serializers.CharField(write_only=True)
    Canton = serializers.CharField(write_only=True)
    Direcion = serializers.CharField(write_only=True)

    requisitos = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
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
            "Nombre_lugar",
            "Canton",
            "Direcion",
            "imagen",
            "requisitos",
        ]

    def create(self, validated_data):

        nombre_lugar = validated_data.pop("Nombre_lugar")
        canton = validated_data.pop("Canton")
        direccion = validated_data.pop("Direcion")

        imagenes = validated_data.pop("imagen")
        requisitos = validated_data.pop("requisitos")

        # Crear campaña
        campana = Campana.objects.create(**validated_data)

        # Crear lugar
        Lugar_campana.objects.create(
            Campana=campana,
            Nombre_lugar=nombre_lugar,
            Canton=canton,
            Direcion=direccion
        )

        # Crear imágenes
        for img in imagenes:
            Imagen_campana.objects.create(
                Campana=campana,
                imagen=img
            )

        # Crear requisitos
        for req in requisitos:
            DetalleRequisitos.objects.create(
                Campana=campana,
                Requisitos_id=req
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
    Buzon = BuzonSerializer(read_only=True)  # ⚡ Aquí se anida el buzón

    class Meta:
        model = Respuesta
        fields = ['id', 'Respuesta_P', 'estado', 'Fecha', 'CustomUser', 'Buzon']






#sangre urgente
class Urgente_Tip_SangSerializer(serializers.ModelSerializer):
    class Meta:
        model = Urgente_Tip_Sang
        fields = '__all__'



class CaruselSerializer(serializers.ModelSerializer):
    requisitos = serializers.SerializerMethodField()
    imagenes = serializers.SerializerMethodField()

    class Meta:
        model = carusel
        fields = [
            "id", "imagen", "texto", "estado",
            "filtro_oscuro", "mostrar_texto",
            "requisitos", "imagenes",
        ]

    def validate(self, data):
        nuevo_estado = data.get("estado", True)

        if nuevo_estado:
            activos = carusel.objects.filter(estado=True)

            if self.instance:
                activos = activos.exclude(pk=self.instance.pk)

            if activos.count() >= 5:
                raise serializers.ValidationError(
                    "Solo se permiten 5 imágenes activas en el carrusel."
                )
        return data

    def get_requisitos(self, instance):
        """
        Intenta localizar el related manager que contiene detalles de requisitos.
        Soporta varios nombres comunes y devuelve lista segura.
        """
        # posibles nombres que podrías tener como related_name o atributo
        candidates = [
            "DetalleRequisito",
            "detalle_requisito",
            "detalle_requisitos",
            "detalle_requisito_set",
            "detalle",
            "requisitos_detalle",
        ]

        rel = None
        for name in candidates:
            if hasattr(instance, name):
                rel = getattr(instance, name)
                break

        if rel is None:
            # no hay relation con esos nombres -> devolver vacío
            return []

        # si es un manager/queryset, iterar; si es un iterable simple también sirve
        items = []
        try:
            iterable = rel.all() if hasattr(rel, "all") else rel
            for d in iterable:
                # el objeto 'd' puede apuntar a otra relación (por ejemplo d.Requisitos)
                req_obj = getattr(d, "Requisitos", None) or getattr(d, "requisito", None) or getattr(d, "requisitos", None) or d

                items.append({
                    "id": getattr(req_obj, "id", None),
                    "requisitos": getattr(req_obj, "requisitos", getattr(req_obj, "texto", None)) or "",
                    "estado": getattr(req_obj, "Estado", getattr(req_obj, "estado", None)),
                })
        except Exception:
            # si algo sale mal, devolvemos lista vacía en vez de romper (evita 500)
            return []

        return items

    def get_imagenes(self, instance):
        """
        Busca colecciones de imágenes asociadas y devuelve sus URLs (o cadenas).
        """
        candidates = [
            "Imagen_campana",
            "imagen_campana",
            "imagenes",
            "imagen_set",
            "imagen_carrusel",
            "imagenes_carrusel",
        ]

        rel = None
        for name in candidates:
            if hasattr(instance, name):
                rel = getattr(instance, name)
                break

        if rel is None:
            return []

        urls = []
        try:
            iterable = rel.all() if hasattr(rel, "all") else rel
            for img in iterable:
                # intenta obtener .imagen.url, .url o str(obj)
                url = None
                # si img.imagen es CloudinaryField u otro campo con .url
                if hasattr(img, "imagen"):
                    imagen_attr = getattr(img, "imagen")
                    url = getattr(imagen_attr, "url", None) or str(imagen_attr) if imagen_attr is not None else None
                # si directamente el objeto tiene 'url' o 'secure_url'
                if not url:
                    url = getattr(img, "url", None) or getattr(img, "secure_url", None)
                if url:
                    urls.append(url)
        except Exception:
            return []

        return urls

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
