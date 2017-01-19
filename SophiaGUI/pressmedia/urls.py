from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^pressmedia$', views.pressMedia, name='pressMedia'),
]