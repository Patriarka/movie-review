# Generated by Django 4.1.7 on 2023-05-09 12:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0002_remove_publication_movie_director'),
    ]

    operations = [
        migrations.AddField(
            model_name='publication',
            name='imgur_link',
            field=models.URLField(blank=True),
        ),
    ]
