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

class LugarCampanaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lugar_campana
        fields = ["id",
            "Nombre_lugar",
            "Canton",
            "Direcion",]

class Imagen_campanaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imagen_campana
        fields = '__all__'

class  DetalleRequisitosSerializer(serializers.ModelSerializer):
    Imagen_campana = Imagen_campanaSerializer(many=True, read_only=True)
    Lugar_campana = serializers.PrimaryKeyRelatedField(
        queryset=Lugar_campana.objects.all()
    )

    class Meta:
        model =  DetalleRequisitos
        fields =  ['Titulo', 'Descripicion', 'Fecha_incio', 'Fecha_fin', 'requistos','Lugar','Direcion','Canton','Contacto']


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


#Requisitos
class RequisitosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requisitos
        fields = ["requisitos","Estado"]



#Requisitos
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

class CampanaInfoSerializer(serializers.ModelSerializer):
    # Mostrar imágenes asociadas
    Imagen_campana = Imagen_campanaSerializer(many=True, read_only=True)

    # Mostrar datos del lugar
    lugar_campana = LugarCampanaSerializer(read_only=True)

    # Para la creación
    lugar_campana_id = serializers.IntegerField(write_only=True)
    requisitos_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True)

    # Para mostrar requisitos en GET
    requisitos = serializers.SerializerMethodField()

    class Meta:
        model = Campana
        fields = [
            "id",
            "Titulo",
            "Descripcion",
            "Fecha_inicio",
            "Fecha_fin",
            "Activo",
            "Contacto",
            "CustomUser",
            "lugar_campana",
            "lugar_campana_id",
            "Imagen_campana",
            "requisitos_ids",
            "requisitos",
        ]

    def get_requisitos(self, obj):
        detalles = obj.DetalleRequisito.all()
        return [{"id": d.Requisitos.id, "nombre": d.Requisitos.requisitos} for d in detalles]

    def create(self, validated_data):
        lugar_id = validated_data.pop("lugar_campana_id")
        requisitos_ids = validated_data.pop("requisitos_ids", [])

        lugar = Lugar_campana.objects.get(id=lugar_id)
        validated_data["Lugar_campana"] = lugar

        campana = Campana.objects.create(**validated_data)

        # Crear DetalleRequisitos
        for req_id in requisitos_ids:
            DetalleRequisitos.objects.create(Campana=campana, Requisitos_id=req_id)

        return campana






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
