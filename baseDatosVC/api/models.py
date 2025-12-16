from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from django.utils import timezone

class CustomUser(AbstractUser):
   
    Telefono = models.IntegerField( unique=True, null=True, blank=True)
    Edad = models.IntegerField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["email"], name="unique_customuser_email")
        ]
 
    def __str__(self):
        return f"{self.Telefono}"
    

class Group(models.Model):
    Nombre_rol = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.Nombre_rol}"
    


class UsuarioRol(models.Model):
    customuser = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        db_column="customuser_id",
        related_name="roles"
    )
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        db_column="group_id",
        related_name="usuarios"
    )

    class Meta:
        db_table = "api_customuser_groups"
        managed = False # Evita que Django intente crear esta tabla automáticamente


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
    Numero_cedula = models.CharField(max_length=12, unique=True)
    Sangre= models.ForeignKey(Sangre,on_delete=models.CASCADE, related_name="Suscritos")
    Fecha = models.DateTimeField(auto_now_add=True)
    nombre = models.CharField(max_length=200)
    correo = models.CharField( max_length=200, unique=True)
    Telefono = models.CharField(max_length=15, null=True, blank=True) 


class Provincia(models.Model):
    nombre_p = models.CharField(max_length=100)
    def __str__(self):
        return f"{self.nombre_p}"
    
class Cantones(models.Model):
    nombre_canton = models.CharField(max_length=100)
    Provincia= models.ForeignKey( Provincia,on_delete=models.CASCADE, related_name="Cantones")
    def __str__(self):
        return f"{self. nombre_canton}"


#campañas
class Campana(models.Model):
    Titulo = models.CharField(max_length=100)
    Descripcion= models.CharField(max_length=300)

    # Fechas sin hora
    Fecha_inicio = models.DateField(default=timezone.now, null=False, blank=False)
    Fecha_fin = models.DateField(default=timezone.now, null=False, blank=False)

    # Nuevas horas
    Hora_inicio = models.TimeField(null=False, blank=False)
    Hora_fin = models.TimeField(null=False, blank=False)

    Activo = models.BooleanField(default=True)
    Contacto = models.CharField(max_length=50)
    direccion_exacta=models.CharField(max_length=300)
    CustomUser = models.ForeignKey(CustomUser,on_delete=models.CASCADE, related_name="Campana")
    Cantones= models.ForeignKey( Cantones,on_delete=models.CASCADE, related_name="Campana",null=True, blank=True)
    def __str__(self):
        return f"{self.Titulo}"
    

class Imagen_campana(models.Model):
    imagen = CloudinaryField('imagen_campana', folder='campanas')
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
    CustomUser = models.ForeignKey(CustomUser,on_delete=models.CASCADE, related_name="DetalleRequisito")
    Estado =models.BooleanField()


    def __str__(self):
        return f"{self.Estado}"



class carusel (models.Model):
    imagen = CloudinaryField('imagen_carusel', folder='carusel')
    texto  = models.CharField(max_length=100)
    estado = models.BooleanField(default=True)
    filtro_oscuro = models.BooleanField(default=False)
    mostrar_texto = models.BooleanField(default=True)
     
    def __str__(self):
        return f"{self.imagen}"
    
class Galeria(models.Model):
    imagen_g = CloudinaryField('imagen_g', folder='galeria')
    descripcion = models.TextField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    CustomUser = models.ForeignKey(CustomUser,on_delete=models.CASCADE, related_name="Galeria")


    def __str__(self):
       return f"{self.imagen_g}"

class Red_bancos(models.Model):
    nombre_hospi = models.CharField(max_length=200)
    horarios = models.CharField(max_length=100)
    hora = models.CharField(max_length=100)
    Contacto  = models.CharField(max_length=100)
    Notas  = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
       return f"{self.nombre_hospi}"




class Testimonio(models.Model):

    Estado = models.BooleanField(default=True)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    CustomUser = models.ForeignKey(CustomUser,on_delete=models.CASCADE, related_name="Testimonio")

    def __str__(self):
        return f"{self.Estado} "
    

class Testimonio_texto (models.Model):
    Nombre = models.CharField(max_length=150)
    Frase =  models.CharField(max_length=255)
    Foto_P = CloudinaryField('imagen_Testimonio_texto', folder='Testimonio_texto')
    Testimonio = models.ForeignKey(Testimonio,on_delete=models.CASCADE, related_name="Testimonio_texto")
    def __str__(self):
        return f"{self.Nombre} "

class Testimonio_video (models.Model):
    Video =  CloudinaryField('imagen_Testimonio_video', folder='Testimonio_video', resource_type='video')
    Descripcion  =  models.CharField(max_length=200)
    Testimonio = models.ForeignKey(Testimonio,on_delete=models.CASCADE, related_name="Testimonio_video")

    def __str__(self):
        return f"{self.Video} "




class Participacion(models.Model):
    """ Numero_cedula = models.CharField(max_length=12, null=True, blank=True) """
    suscritos = models.ForeignKey(Suscritos, on_delete=models.SET_NULL, null=True, blank=True, related_name="participaciones")
    sangre = models.ForeignKey(Sangre, on_delete=models.SET_NULL, null=True, blank=True)
    campana = models.ForeignKey(Campana, on_delete=models.CASCADE, related_name="participaciones")
    fecha_participacion = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "api_participacion"
        ordering = ["-fecha_participacion"]
        unique_together = (("suscritos", "campana"),)

    def __str__(self):
        if self.suscritos:
            # usa los campos que realmente existen en tu modelo Suscritos
            nombre = getattr(self.suscritos, "nombre", "")
            correo = getattr(self.suscritos, "correo", "")
            return f"{nombre} - {correo}"
        return "Participación sin usuario asignado"

