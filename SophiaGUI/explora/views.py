# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.shortcuts import redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
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

@login_required()
def modal_new(request):
        if request.method == 'POST':

            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]
            api_url = file["api_url"]

            art_id = request.POST['art_id']

            client = requests.post('http://{0}/v2/login/'.format(api_url),
                 {'username': api_user, 'password': api_password})
            cookies = dict(sessionid=client.cookies['sessionid'])
            #api_url = u'http://api.sophia-project.info/articles/{0}/'.format(news_pk)
            api_url = u'http://{0}/v2/articles/{1}/'.format(api_url,art_id)

            response = requests.get(api_url ,cookies=cookies)

            data = json.loads(response.text.encode('utf8'))

            title = data['_source']['art_title']
            date = data['_source']['art_date']
            host = data['_source']['art_name_press_source']
            url = data['_source']['art_url']
            content = data['_source']['art_content']
            imageLink = data['_source']['art_image_link']
            category = data['_source']['art_category']

            return render(request,'news_modal.html',{'title':title,
                                                     'date':date,
                                                     'host':host,
                                                     'url':url,
                                                     'content':content,
                                                     'category':category,
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

    file = json.loads(open("explora/static/user.json").read())
    api_user = file["user"]
    api_password = file["password"]
    api_url = file["api_url"]

    client = requests.post('http://{0}/v2/login/'.format(api_url),
         {'username': api_user, 'password': api_password})

    cookies = dict(sessionid=client.cookies['sessionid'])

    response = requests.get(u'http://{0}/v2/articles/'.format(api_url), cookies=cookies)
    data_array = json.loads(response.text.encode('utf8'))

    #give the format to the data
    data = data_array['hits']['hits']
    results = []

    for key in data:
        array_element = {
                    'art_id':key['_id'],
                    'art_title':key['_source']['art_title'],
                    'art_url':key['_source']['art_url'],
                    'art_image_link': key['_source']['art_image_link'],
                    'art_content':key['_source']['art_content'],
                    'art_name_press_source':key['_source']['art_name_press_source'],
                    'art_category':key['_source']['art_category'],
                    'art_date':key['_source']['art_date']
        }
        results.append(array_element)

    pages = 10
    num_pages = []
    for i in range(1,pages):
        num_pages.append(i)

    data = results

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
##@param requestfrom django.http import JsonResponse
##@return HttpResponse with the main page
@login_required()
def logout(request):
    auth_logout(request)
    return redirect('index')

@login_required()
def user_news_case(request):
    if request.method == 'GET':
        #Here we should get the user news cases
        cases = []
        cases.append("Caso noticioso 1")
        cases.append("Caso noticioso 2")
        return render(request,'user_news_case.html',{'cases':cases })
    else:
        return HttpResponse("Internal Error")



##@brief Function that conect to the API and get articles between two dates and group by date
##@param request
##@return JsonResponse with the data
@login_required(login_url='/login_required')
def articlesCountBy(request):
    if request.method == 'POST':

        startdate = request.POST['startdate']
        enddate = request.POST['enddate']
        countby = request.POST['countby']

        file = json.loads(open("explora/static/user.json").read())
        api_user = file["user"]
        api_password = file["password"]
        api_url = file["api_url"]

        client = requests.post('http://{0}/v2/login/'.format(api_url),
             {'username': api_user, 'password': api_password})

        cookies = dict(sessionid=client.cookies['sessionid'])

        api = u'http://{0}/v2/articles/from/{1}/to/{2}/countby/{3}'.format(api_url,startdate,enddate,countby)

        response = requests.get(api,cookies=cookies)

        data = json.loads(response.text.encode('utf8'))

        data = data['aggregations']['articles_over_time']['buckets']
        #print JsonResponse(data, safe=False)
        #data = data['articles_over_time']['buckets']

        return JsonResponse(data,safe=False)


##@brief Function that conect to the API and get articles between two dates
## called from histogram.js brushed() function.
##@param request
##@return JsonResponse with the data
@login_required(login_url='/login_required')
def articlesByDates(request):
    if request.method == 'POST':

        startdate = request.POST['startdate']
        enddate = request.POST['enddate']

        file = json.loads(open("explora/static/user.json").read())
        api_user = file["user"]
        api_password = file["password"]
        api_url = file["api_url"]

        client = requests.post('http://{0}/v2/login/'.format(api_url),
             {'username': api_user, 'password': api_password})

        cookies = dict(sessionid=client.cookies['sessionid'])

        api = u'http://{0}/v2/articles/from/{1}/to/{2}/'.format(api_url,startdate,enddate)

        response = requests.get(api,cookies=cookies)

        data_array = json.loads(response.text.encode('utf8'))

        #give the format to the data
        data = data_array['hits']['hits']
        results = []
        for key in data:
            array_element = {
                    'art_id':key['_id'],
                    'art_title':key['_source']['art_title'],
                    'art_url':key['_source']['art_url'],
                    'art_image_link': key['_source']['art_image_link'],
                    'art_content':key['_source']['art_content'],
                    'art_name_press_source':key['_source']['art_name_press_source'],
                    'art_category':key['_source']['art_category'],
                    'art_date':key['_source']['art_date']
            }
            results.append(array_element)
        data = results

        return render(request,'articles_list.html',{'data': data})

@login_required(login_url='/login_required')
def advancedSearch(request):
    if request.method == 'POST':
        data = request.POST.get('json_data')
        #print request.POST['json_data']

        file = json.loads(open("explora/static/user.json").read())
        api_user = file["user"]
        api_password = file["password"]
        api_url = file["api_url"]

        #client = requests.post('http://{0}/v2/login/'.format(api_url),
        #     {'username': api_user, 'password': api_password})

        #cookies = dict(sessionid=client.cookies['sessionid'])


        api = u'http://{0}/v2/search/'.format(api_url)

        response = requests.post(api,data=data)

        data_array = json.loads(response.content.encode('utf8'))
        data = data_array['hits']['hits']
        results = []
        for key in data:
            array_element = {
                    'art_id':key['_id'],
                    'art_title':key['_source']['art_title'],
                    'art_url':key['_source']['art_url'],
                    'art_image_link': key['_source']['art_image_link'],
                    'art_content':key['_source']['art_content'],
                    'art_name_press_source':key['_source']['art_name_press_source'],
                    'art_category':key['_source']['art_category'],
                    'art_date':key['_source']['art_date']
            }
            results.append(array_element)
        data = results
        return render(request,'articles_list.html',{'data': data})
