from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^requests$', views.user_request, name='user_request'),
]