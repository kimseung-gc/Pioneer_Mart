# Generated by Django 4.2.20 on 2025-04-08 00:46

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("items", "0001_initial"),
        ("userprofile", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="favorites",
            field=models.ManyToManyField(
                blank=True, related_name="favorited_by", to="items.listing"
            ),
        ),
    ]
