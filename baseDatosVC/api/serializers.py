from.models import *
from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import CustomUser

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


class SuscritosSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='CustomUser.first_name', read_only=True)
    apellido = serializers.CharField(source='CustomUser.last_name', read_only=True)
    correo = serializers.EmailField(source='CustomUser.email', read_only=True)
    tipo_sangre = serializers.CharField(source='Sangre.tipo_sangre', read_only=True)

    class Meta:
        model = Suscritos
        fields = ['id', 'nombre', 'apellido', 'correo', 'tipo_sangre']


#Campaña

class LugarCampanaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lugar_campana
        fields = '__all__'

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
        fields = '__all__'


class RespuestaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Respuesta
        fields = '__all__'
    

#Requisitos
class RequisitosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requisitos
        fields = '__all__'
