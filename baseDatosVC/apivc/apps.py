from django.apps import AppConfig


class ApivcConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apivc'



class BaseDatosVCConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'baseDatosVC'

    def ready(self):
        import VidaConectada.baseDatosVC.apivc.signals
