# Generated by Django 2.2.7 on 2019-12-30 16:52

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_remove_securitymaster_master_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='securitymaster',
            name='master_date',
            field=models.DateField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
