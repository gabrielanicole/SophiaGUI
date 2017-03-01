from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^tweets$', views.tweets, name='tweets'),
    url(r'^get_data/tweets/([0-9]*)/$',
        views.getTweetsList, name='getTweetsList'),
    url(r'^get_data/tweets/histogram/$',
        views.tweetsCountBy, name='tweetsCountBy'),
    url(r'^tweets/getStackBar/$', views.getStackBar, name='getStackBar')
]