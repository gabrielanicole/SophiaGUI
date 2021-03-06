from django.db import models
from django.contrib.auth.models import User
from social.apps.django_app.default.models import UserSocialAuth
# Create your models here.

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    activation_url = models.CharField(max_length=50, default="NULL")

class NewsCase(models.Model):
    name = models.CharField(max_length=150)
    elastic_id = models.CharField   (primary_key=True, max_length=30)
    img_preview = models.CharField(max_length=300)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    follow_new_feed = models.BooleanField(default=True)
    creation_date = models.DateField()
    visible = models.BooleanField(default=True)

class Analist(models.Model):
    user = models.OneToOneField(Profile, on_delete=models.CASCADE)
    request_send = models.BooleanField(default=False)
    request_accepted = models.BooleanField(default=False)