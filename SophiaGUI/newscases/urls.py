from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^create/newsCase/', views.createNewsCase, name='createNewsCase'),
    url(r'^newscases', views.newsCases, name='newsCases'),
    url(r'^get_data/usernewscases/([0-9]*)/$',
        views.getUserNewsCases, name='getUserNewsCases'),
    url(r'^showNewsCase/(?P<elastic_id>[\w\-]+)$',
        views.showNewsCase, name='showNewsCase'),
    url(r'^getNewsCaseInfo/$', views.getNewCaseInfo, name='getNewCaseInfo'),
    url(r'^updateNewsCase/$', views.updateNewsCase, name='updateNewsCase'),
    url(r'^removeArticle/$', views.removeArticle, name='removeArticle'),
    url(r'^removeNewsCase/$', views.removeNewsCase, name='removeNewsCase'),
]