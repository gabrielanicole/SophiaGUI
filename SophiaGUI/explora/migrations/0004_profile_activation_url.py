# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-02-02 19:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('explora', '0003_newscase_visible'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='activation_url',
            field=models.CharField(default=b'NULL', max_length=50),
        ),
    ]