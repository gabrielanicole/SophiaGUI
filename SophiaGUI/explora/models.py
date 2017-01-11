from django.db import models
from django.contrib.auth.models import User
from social.apps.django_app.default.models import UserSocialAuth
# Create your models here.

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

class NewsCase(models.Model):
    name = models.CharField(max_length=150)
    elastic_id = models.CharField   (primary_key=True, max_length=30)
    img_preview = models.CharField(max_length=300)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)