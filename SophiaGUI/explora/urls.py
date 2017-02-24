from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^articles$', views.articles, name='articles'),
    url(r'articles/modal_new$', views.modal_new, name='modal_new'),
    url(r'^logout/$', views.logout, name='logout'),
    url(r'^login$', views.login, name='login'),
    url(r'login_required$', views.user_not_logged, name='user_not_logged'),
    url(r'^get_data/articles/histogram$',
        views.articlesCountBy, name='articlesCountBy'),
    url(r'^get_data/articles/articles-list$',
        views.articlesByDates, name='articlesByDates'),
    url(r'^get_data/articles/articles_advance_search/([0-9]*)/$',
        views.advancedSearch, name='advancedSearch'),
    url(r'^exportData/$', views.exportData, name='exportData'),
    url(r'^articles/changeCategory/$', views.changeCategory, name='changeCategory'),
    url(r'^articles/getGeoJSON/$', views.sendGeoJSON, name='sendGeoJSON'),
    url(r'^articles/getStackBar/$', views.getStackBar, name='getStackBar')
]
