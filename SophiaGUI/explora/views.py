# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.shortcuts import redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
import requests
import simplejson as json
from telnetlib import theNULL
from pprint import pprint


##@brief Function that login the user to Sophia GUI.
##@param request Web request with login data (username, password)
##@return HttpResponse Redirect to the "Index" if Login fails or "Articles" if success
def login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                auth_login(request,user)
                return redirect('articles')
        #here should be an else for when user account is disbled
        else:
            return redirect('index')

def modal_new(request):
        if request.method == 'POST':
            news_pk = request.POST['news_id']

            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]

            api_url = u'http://api.sophia-project.info/articles/{0}/'.format(news_pk)
            r = requests.get(api_url, auth=(api_user, api_password))
            a = json.loads(r.text.encode('utf8'))
            #Here come the data
            title = a['title']
            date = a['date']
            host = a['host']
            url = a['url']
            content = a['content']
            imageLink = a['imageLink']

            return render(request,'news_modal.html',{'title':title,
                                                     'date':date,
                                                     'host':host,
                                                     'url':url,
                                                     'content':content,
                                                     'imageLink':imageLink})
        else:
            return HttpResponse("Internal Error")

##@brief Function that redirect if a user is not logged into Sophia GUI
##@param request
##return HttpResponse Redirect to "articles" if success, or "login_required" if fails
def user_not_logged(request):
    if request.user.is_authenticated():
        return redirect('articles')
    else:
        return render(request,'login_required.html')

def index(request):

    if request.user.is_authenticated():
        return redirect('articles')
    else:
        return render(request,'home.html')


##@brief Function that  render the "articles" page.
##@param request Web request
##@param num Value for the pagination
##@return HttpResponse with the articles page.
##@warning Login is required.
@login_required(login_url='/login_required')
def articles(request, num="1"):

    pages = 10
    num_pages = []
    for i in range(1,pages):
        num_pages.append(i)

    file = json.loads(open("explora/static/user.json").read())
    api_user = file["user"]
    api_password = file["password"]

    api_url = u'http://api.sophia-project.info/articles/?page={0}'.format(num)
    r = requests.get(api_url, auth=(api_user, api_password))
    a = json.loads(r.text.encode('utf8'))
    data = a['results']

    my_user = request.user.social_auth.filter(provider='facebook').first()
    if my_user:
        url = u'https://graph.facebook.com/{0}/picture'.format(my_user.uid)
        return render(request,'articles.html',{'data': data
                                               ,'user':request.user.get_full_name()
                                               ,'profile_pic':url
                                               ,'num_pages':num_pages
                                               })
    else:
        return render(request,'articles.html',{'data': data
                                               ,'user':request.user.get_full_name()
                                               ,'num_pages':num_pages
                                               })
##@brief Function that log out the user from Sophia
##@param request
##@return HttpResponse with the main page
@login_required()
def logout(request):
    auth_logout(request)
    return redirect('index')
