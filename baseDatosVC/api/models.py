from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField

class CustomUser(AbstractUser):
   
    Telefono = models.IntegerField( unique=True  )
    Edad = models.IntegerField()
 
    def __str__(self):
        return f"{self.Telefono}"
    

class Group(models.Model):
    Nombre_rol = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.Nombre_rol}"
    

class Usuario_rol(models.Model):
   CustomUser = models.ForeignKey(CustomUser,on_delete=models.CASCADE, related_name="Usurio_rol")
   Group = models.ForeignKey(Group,on_delete=models.CASCADE, related_name="Usurio_rol")


class Publicaciones(models.Model):
    Titulo_puli = models.CharField(max_length=100)
    Descripicion= models.CharField(max_length=300)
    Fecha_publi = models.DateTimeField (auto_now_add=True) 
    CustomUser = models.ForeignKey(CustomUser,on_delete=models.CASCADE, related_name="Publicaciones")
    def __str__(self):
        return f"{self.Titulo_puli}"

class Imagenes_publi(models.Model):
    imagen = CloudinaryField('imagen_publicacion', folder='publicaciones/')
    Publicaciones = models.ForeignKey(Publicaciones,on_delete=models.CASCADE, related_name="Imagenes_publi")
    def __str__(self):
        return f"{self.imagen}"
    

class Sangre(models.Model):
    tipo_sangre  = models.CharField(max_length=3)
    def __str__(self):
        return f"{self.tipo_sangre}"

class Lugar_publi(models.Model):
    Nombre_lugar = models.CharField(max_length=100)
    def __str__(self):
        return f"{self.Nombre_lugar}"



class Suscritos(models.Model):
    CustomUser= models.ForeignKey(CustomUser,on_delete=models.CASCADE, related_name="Suscritos")
    Sangre= models.ForeignKey(Sangre,on_delete=models.CASCADE, related_name="Suscritos")
    Lugar_publi= models.ForeignKey(Lugar_publi,on_delete=models.CASCADE, related_name="Suscritos")
 


class Lugar_campana(models.Model):

    Nombre_lugar = models.CharField(max_length=100)
    Canton = models.CharField(max_length=100)
    Direcion = models.CharField(max_length=200)
    def __str__(self):
        return f"{self.Nombre_lugar}"


class Campana(models.Model):
    Titulo = models.CharField(max_length=100)
    Descripicion= models.CharField(max_length=300)
    Fecha_inicio = models.DateTimeField (auto_now_add=False) 
    Fecha_fin = models.DateTimeField (auto_now_add=False) 
    Activo = models.BooleanField(default=True) 
    Contacto = models.CharField(max_length=50)
    CustomUser = models.ForeignKey(CustomUser,on_delete=models.CASCADE, related_name="Campana")
    Lugar_campana = models.ForeignKey(Lugar_campana,on_delete=models.CASCADE, related_name="Campana")

    def __str__(self):
        return f"{self.Titulo}"


class Imagen_campana(models.Model):
    imagen = CloudinaryField('imagen_campana', folder='campanas/')
    Campana = models.ForeignKey(Campana,on_delete=models.CASCADE, related_name="Imagen_campana")

    def __str__(self):
        return f"{self.imagen}"

class Mapa (models.Model):
    latitud = models.DecimalField(max_digits=9, decimal_places=6)
    longitud = models.DecimalField(max_digits=9, decimal_places=6)
    activo = models.BooleanField(default=True) 
    Campana = models.ForeignKey(Campana,on_delete=models.CASCADE, related_name="Mapa")
    def __str__(self):
        return f"{self.latitud}"


class Buzon(models.Model):
    Nombre_persona = models.CharField(max_length=100)
    Correo = models.CharField(max_length=50, unique=True)
    Pregunta = models.TextField()
    def __str__(self):
        return f"{self.Nombre_persona}"

class Respuesta(models.Model):
    CustomUser = models.ForeignKey(CustomUser,on_delete=models.CASCADE, related_name="Respuesta")
    Buzon = models.ForeignKey(Buzon,on_delete=models.CASCADE, related_name="Respuesta")
    Respuesta_P = models.TextField()

    def __str__(self):
        return f"{self.Respuesta_P}"