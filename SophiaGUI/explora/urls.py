from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^articles$', views.articles, name='articles'),
    url(r'articles/modal_new$', views.modal_new, name='modal_new'),
    url(r'^logout/$', views.logout, name='logout'),
    url(r'^login$', views.login, name='login'),
    url(r'login_required$', views.user_not_logged, name='user_not_logged'),
    url(r'articles/user_news_case$', views.user_news_case, name='user_news_case'),
    url(r'^get_data/articles/histogram$',
        views.articlesCountBy, name='articlesCountBy'),
    url(r'^get_data/articles/articles-list$',
        views.articlesByDates, name='articlesByDates'),
    url(r'^get_data/articles/articles_advance_search/([0-9]*)/$',
        views.advancedSearch, name='advancedSearch'),
    url(r'^tweets$', views.tweets, name='tweets'),
    url(r'^get_data/tweets/([0-9]*)/$',
        views.getTweetsList, name='getTweetsList'),
    url(r'^get_data/tweets/histogram/$',
        views.tweetsCountBy, name='tweetsCountBy'),
    url(r'^accounts/login/?next=/', views.index, name='index'),
    url(r'^create/newsCase/',views.createNewsCase,name='createNewsCase'),
    url(r'^newscases', views.newsCases, name='newsCases'),
]
