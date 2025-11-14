from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField

class CustomUser(AbstractUser):
   
    Telefono = models.IntegerField( unique=True, null=True, blank=True)
    Edad = models.IntegerField(null=True, blank=True)
 
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
    
    texto=models.CharField(max_length=200)
    CustomUser = models.ForeignKey(CustomUser,on_delete=models.CASCADE, related_name="Publicaciones")
    Estado =models.BooleanField()
    def __str__(self):
        return f"{self.texto}"

class Imagenes_publi(models.Model):
    imagen = CloudinaryField('imagen_publicacion', folder='publicaciones/')
    Publicaciones = models.ForeignKey(Publicaciones,on_delete=models.CASCADE, related_name="Imagenes_publi")
    def __str__(self):
        return f"{self.imagen}"
    

class Sangre(models.Model):
    tipo_sangre  = models.CharField(max_length=3)
    frecuencia = models.CharField(max_length=20)
    poblacion = models.CharField(max_length=20)
    donaA =  models.CharField(max_length=30)
    recibeDe =  models.CharField(max_length=40)
    def __str__(self):
        return f"{self.tipo_sangre}"
    
class Urgente_Tip_Sang(models.Model):
    Sangre = models.ForeignKey(Sangre,on_delete=models.CASCADE, related_name="Urgente_Tip_Sang")
    urgencia = models.CharField(max_length=40)
    activo= models.BooleanField()
    nota = models.CharField(max_length=40)
    actualizado = models.DateTimeField()
    def __str__(self):
        return f"{self.urgencia}"




class Suscritos(models.Model):
    CustomUser= models.ForeignKey(CustomUser,on_delete=models.CASCADE, related_name="Suscritos")
    Sangre= models.ForeignKey(Sangre,on_delete=models.CASCADE, related_name="Suscritos")
    Fecha = models.DateTimeField(auto_now_add=True)

    
 


class Lugar_campana(models.Model):

    Nombre_lugar = models.CharField(max_length=100)
    Canton = models.CharField(max_length=100)
    Direcion = models.CharField(max_length=200)
    def __str__(self):
        return f"{self.Nombre_lugar}"


class Campana(models.Model):
    Titulo = models.CharField(max_length=100)
    Descripcion= models.CharField(max_length=300)
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
    Nombre_persona = models.CharField(max_length=100,null=True )
    correo = models.CharField(max_length=50,null=True  )
    pregunta = models.TextField(null=True )
    estado = models.CharField(max_length=20,default="Pendiente")
    fecha = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.Nombre_persona}"

class Respuesta(models.Model):
    CustomUser = models.ForeignKey(CustomUser,on_delete=models.CASCADE, related_name="Respuesta")
    Buzon = models.ForeignKey(Buzon,on_delete=models.CASCADE, related_name="Respuesta")
    Respuesta_P = models.TextField()
    estado = models.BooleanField(default=False)
    Fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.Respuesta_P}"

class Requisitos (models.Model):
    requisitos = models.CharField(max_length=200)
    Estado = models.BooleanField(default=True)
     
    def __str__(self):
        return f"{self.requisitos}"

class DetalleRequisitos (models.Model):
    Campana = models.ForeignKey(Campana,on_delete=models.CASCADE, related_name="DetalleRequisito")
    Requisitos = models.ForeignKey(Requisitos,on_delete=models.CASCADE, related_name="DetalleRequisito")


class carusel (models.Model):
    imagen = CloudinaryField('imagen_carusel', folder='carusel/')
    texto  = models.CharField(max_length=100)
    estado = models.BooleanField(default=True)
    # NUEVOS CAMPOS
    filtro_oscuro = models.BooleanField(default=False)
    mostrar_texto = models.BooleanField(default=True)
     
    def __str__(self):
        return f"{self.imagen}"