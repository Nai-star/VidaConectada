from django.contrib import admin
from django.contrib.auth.models import User
from .models import Sangre, Urgente_Tip_Sang, Provincia, Cantones

admin.site.register(User)
admin.site.register(Sangre)
admin.site.register(Urgente_Tip_Sang)
admin.site.register(Provincia)
admin.site.register(Cantones)