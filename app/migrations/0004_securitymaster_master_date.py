# Generated by Django 2.2.7 on 2019-12-30 16:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_auto_20191229_0510'),
    ]

    operations = [
        migrations.AddField(
            model_name='securitymaster',
            name='master_date',
            field=models.DateField(default=None),
            preserve_default=False,
        ),
    ]
