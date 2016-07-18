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
            #here we should have the id of the new.
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


#here we should redirect
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
    #the data to return to the template, later this should be a http response from the API
    data = a['results']

    #Search if is a social user
    my_user = request.user.social_auth.filter(provider='facebook').first()
    if my_user:
        #if is someone from facebook we get the profile image
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

@login_required()
def logout(request):
    #Log out the user from facebook or django
    auth_logout(request)
    return redirect('index')
