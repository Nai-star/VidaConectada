from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='campana',
            name='Hora_inicio',
            field=models.TimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='campana',
            name='Hora_fin',
            field=models.TimeField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='campana',
            name='Fecha_inicio',
            field=models.DateField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='campana',
            name='Fecha_fin',
            field=models.DateField(null=True, blank=True),
        ),
    ]
