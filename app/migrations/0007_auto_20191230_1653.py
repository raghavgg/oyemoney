# Generated by Django 2.2.7 on 2019-12-30 16:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0006_securitymaster_master_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='securitymaster',
            name='master_date',
            field=models.DateField(null=True),
        ),
    ]