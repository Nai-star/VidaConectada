from.models import *
from django.contrib.auth.models import User, Group
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import CustomUser

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
    


class PublicacionesSerializers(serializers.ModelSerializer):
    class Meta:
        model = Publicaciones
        fields = '__all__'
    
   

class ImagenesPubliSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imagenes_publi
        fields = '__all__'


class PublicacionesSerializer(serializers.ModelSerializer):
    Imagenes_publi = ImagenesPubliSerializer(many=True, read_only=True)

    class Meta:
        model = Publicaciones
        fields = '__all__'
    
class SangreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sangre
        fields = '__all__'


class LugarPubliSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lugar_publi
        fields = '__all__'


class SuscritosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suscritos
        fields = '__all__'


class ImagenCampanaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imagen_campana
        fields = '__all__'


class LugarCampanaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lugar_campana
        fields = '__all__'


class CampanaSerializer(serializers.ModelSerializer):
    Imagen_campana = ImagenCampanaSerializer(many=True, read_only=True)
    Lugar_campana = serializers.PrimaryKeyRelatedField(
        queryset=Lugar_campana.objects.all()
    )

    class Meta:
        model = Campana
        fields = '__all__'


class MapaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mapa
        fields = '__all__'


class BuzonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Buzon
        fields = '__all__'


class RespuestaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Respuesta
        fields = '__all__'
    

from rest_framework import serializers
from .models import Imagenes_publi

class Imagenes_publiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imagenes_publi
        fields = '__all__'
