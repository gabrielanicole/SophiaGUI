from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^createaccount/$', views.createaccount, name='createaccount'),
    url(r'createaccount/createUser', views.createUser, name='createUser'),
]