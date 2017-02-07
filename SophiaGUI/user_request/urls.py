from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^requests$', views.user_request, name='user_request'),
    url(r'^requests/changeToAnalyst/$', views.changeToAnalyst, name='changeToAnalyst'),
    url(r'^requests/getRequestList/$', views.getRequestList, name='getRequestList'),
]