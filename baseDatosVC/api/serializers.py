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


class LugarCampanaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lugar_campana
        fields = ["id", "Nombre_lugar", "Canton", "Direcion"]


class ImagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imagen_campana
        fields = ["id", "imagen"]


class CampanaCreateSerializer(serializers.Serializer):
    Titulo = serializers.CharField()
    Descripcion = serializers.CharField()
    Fecha_inicio = serializers.DateTimeField()
    Fecha_fin = serializers.DateTimeField()
    Contacto = serializers.CharField()

    CustomUser = serializers.JSONField()  # porque envías un objeto

    # Datos del lugar
    Nombre_lugar = serializers.CharField()
    Canton = serializers.CharField()
    Direccion = serializers.CharField()

    # Imágenes
    imagenes = serializers.ListField(
        child=serializers.ImageField(),
        required=True
    )

    # Requisitos (IDs)
    requisitos = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )

    def create(self, validated_data):
        custom_user_id = validated_data["CustomUser"]["id"]

        lugar = Lugar_campana.objects.create(
            Nombre_lugar=validated_data["Nombre_lugar"],
            Canton=validated_data["Canton"],
            Direcion=validated_data["Direccion"],
        )

        campana = Campana.objects.create(
            Titulo=validated_data["Titulo"],
            Descripcion=validated_data["Descripcion"],
            Fecha_inicio=validated_data["Fecha_inicio"],
            Fecha_fin=validated_data["Fecha_fin"],
            Contacto=validated_data["Contacto"],
            CustomUser_id=custom_user_id,
            Lugar_campana=lugar
        )

        for img in validated_data["imagenes"]:
            Imagen_campana.objects.create(
                imagen=img,
                Campana=campana
            )

        for req_id in validated_data["requisitos"]:
            DetalleRequisitos.objects.create(
                Campana=campana,
                Requisitos_id=req_id
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

    class Meta:
        model = carusel
        fields = [
            "id", "imagen", "texto", "estado",
            "filtro_oscuro", "mostrar_texto",
        ]
        #fields = "__all__"

    def validate(self, data):
        # Si el estado viene como True (activo)
        nuevo_estado = data.get("estado", True)

        if nuevo_estado:
            # Contar registros activos
            activos = carusel.objects.filter(estado=True)

            # Si es actualización, excluir el mismo registro
            if self.instance:
                activos = activos.exclude(pk=self.instance.pk)

            if activos.count() >= 5:
                raise serializers.ValidationError(
                    "Solo se permiten 5 imágenes activas en el carrusel."
                )
        return data




    # Para mostrar requisitos correctamente
    def to_representation(self, instance):
        rep = super().to_representation(instance)

        rep["requisitos"] = [
            {
                "id": d.Requisitos.id,
                "requisitos": d.Requisitos.requisitos,
                "Estado": d.Requisitos.Estado
            }
            for d in instance.DetalleRequisito.all()
        ]

        # Mostrar imágenes
        rep["Imagen_campana"] = [
            img.imagen.url for img in instance.Imagen_campana.all()
        ]

        return rep







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
