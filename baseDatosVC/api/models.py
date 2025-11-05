from django.db import models

class Usuario(models.Model):
    Nombre = models.CharField (max_length=50)
    Apellido = models.CharField(max_length=50)
    Telefono = models.IntegerField(max_length=50)
    Edad = models.IntegerField(max_length=50)
    Correo = models.CharField(max_length=50)
    Usuario = models.CharField(max_length=50)
    Contra = models.CharField(max_length=50)