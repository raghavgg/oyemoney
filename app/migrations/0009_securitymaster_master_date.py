# Generated by Django 2.2.7 on 2019-12-30 16:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0008_remove_securitymaster_master_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='securitymaster',
            name='master_date',
            field=models.DateField(null=True),
        ),
    ]