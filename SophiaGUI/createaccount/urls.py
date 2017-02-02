from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^createaccount/$', views.createaccount, name='createaccount'),
    url(r'^createaccount/createUser/$', views.createUser, name='createUser'),
    url(r'^activate/(?P<userUrl>[\w\-]+)$', views.activateUser,name='activateUser'),
]