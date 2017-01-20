from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^pressmedia$', views.pressMedia, name='pressMedia'),
    url(r'^pressmedia/insert/$', views.insertPressMedia, name='insertPressMedia'),
    url(r'^pressmedia/get/$', views.getPressMedia, name="getPressMedia"),
    url(r'^pressmedia/getlist/$', views.getListPressMedia,name="getListPressMedia"),
]