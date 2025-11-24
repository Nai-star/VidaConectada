from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()

@receiver(post_save, sender=User)
def add_to_suscrito_group(sender, instance, created, **kwargs):
    if created:  # solo cuando el usuario es creado
        group, _ = Group.objects.get_or_create(name="Suscrito")
        instance.groups.add(group)
