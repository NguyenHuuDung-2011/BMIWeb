# Generated by Django 4.2.7 on 2025-06-07 03:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bmiwebsite', '0002_studenthealth_delete_people'),
    ]

    operations = [
        migrations.AlterField(
            model_name='studenthealth',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]
