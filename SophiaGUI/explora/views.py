# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.shortcuts import redirect
from django.contrib.auth.models import User
from models import Profile, NewsCase
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.http import JsonResponse
import requests
import simplejson as json
from django.core import serializers
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
import cStringIO
import csv
from filewriter import return_json_file, return_csv_file

# @brief Function that login the user to Sophia GUI.
# @param request Web request with login data (username, password)
# @return HttpResponse Redirect to the "Index" if Login fails or "Articles" if success
def login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                auth_login(request, user)
                return redirect('articles')
        # here should be an else for when user account is disbled
        else:
            return redirect('index')


@login_required()
def modal_new(request):
    if request.method == 'POST':

        file = json.loads(open("explora/static/user.json").read())
        api_user = file["user"]
        api_password = file["password"]
        api_url = file["api_url"]

        art_id = request.POST.get('art_id').encode('utf8')
        # client = requests.post('http://{0}/v2/login/'.format(api_url),
        #     {'username': api_user, 'password': api_password})
        #cookies = dict(sessionid=client.cookies['sessionid'])
        #api_url = u'http://api.sophia-project.info/articles/{0}/'.format(news_pk)
        api_url = u'http://{0}/v2/articles/{1}/'.format(api_url, art_id)

        #response = requests.get(api_url ,cookies=cookies)
        response = requests.get(api_url)

        data = json.loads(response.text.encode('utf8'))

        title = data['_source']['art_title']
        date = data['_source']['art_date']
        host = data['_source']['art_name_press_source']
        url = data['_source']['art_url']
        content = data['_source']['art_content']
        imageLink = data['_source']['art_image_link']
        category = data['_source']['art_category']

        return render(request, 'news_modal.html', {'title': title,
                                                   'date': date,
                                                   'host': host,
                                                   'url': url,
                                                   'content': content,
                                                   'category': category,
                                                   'imageLink': imageLink})
    else:
        return HttpResponse("Internal Error")

# @brief Function that redirect if a user is not logged into Sophia GUI
# @param request
# return HttpResponse Redirect to "articles" if success, or
# "login_required" if fails


def user_not_logged(request):
    if request.user.is_authenticated():
        return redirect('articles')
    else:
        return render(request, 'login_required.html')


def index(request):
    if request.user.is_authenticated():
        return redirect('articles')
    else:
        return render(request, 'home.html')

# @brief Function that  render the "articles" page.
# @param request Web request
# @param num Value for the pagination
# @return HttpResponse with the articles page.
# @warning Login is required.


@login_required(login_url='/login_required')
def articles(request, num=1):

    my_user = request.user.social_auth.filter(provider='facebook').first()
    if my_user:
        url = u'https://graph.facebook.com/{0}/picture'.format(my_user.uid)
        return render(request, 'articles.html', {'user': request.user.get_full_name(), 'profile_pic': url
                                                 })
    else:
        return render(request, 'articles.html', {'user': request.user.get_full_name()
                                                 })

# @brief Function that log out the user from Sophia
# @param requestfrom django.http import JsonResponse
# @return HttpResponse with the main page


@login_required()
def logout(request):
    auth_logout(request)
    return redirect('index')

# @brief Function that conect to the API and get articles between two dates and group by date
# @param request
# @return JsonResponse with the data
@login_required(login_url='/login_required')
def articlesCountBy(request):
    if request.method == 'POST':

        startdate = request.POST.get('startdate').encode('utf8')
        enddate = request.POST.get('enddate').encode('utf8')
        countby = request.POST.get('countby').encode('utf8')
        search = request.POST.get('search').encode('utf8')

        file = json.loads(open("explora/static/user.json").read())
        api_user = file["user"]
        api_password = file["password"]
        api_url = file["api_url"]

       # client = requests.post('http://{0}/v2/login/'.format(api_url),
       #      {'username': api_user, 'password': api_password})

       # cookies = dict(sessionid=client.cookies['sessionid'])

        api = u'http://{0}/v2/articles/from/{1}/to/{2}/countby/{3}'.format(
            api_url, startdate, enddate, countby)

        try:
            response = requests.post(api, data=search)
            #response = requests.get(api)

        except Exception as e:
            return HttpResponse(e)

        data = json.loads(response.text.encode('utf8'))

        data = data['aggregations']['articles_over_time']['buckets']
        return JsonResponse(data, safe=False)


# @brief Function that conect to the API and get articles between two dates
# called from histogram.js brushed() function.
# @param request
# @return JsonResponse with the data
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

        api = u'http://{0}/v2/articles/from/{1}/to/{2}/'.format(
            api_url, startdate, enddate)

        response = requests.get(api, cookies=cookies)

        data_array = json.loads(response.text.encode('utf8'))

        # give the format to the data
        data = data_array['hits']['hits']
        results = []
        for key in data:
            array_element = {
                'art_id': key['_id'],
                'art_title': key['_source']['art_title'],
                'art_url': key['_source']['art_url'],
                'art_image_link': key['_source']['art_image_link'],
                'art_content': key['_source']['art_content'],
                'art_name_press_source': key['_source']['art_name_press_source'],
                'art_category': key['_source']['art_category'],
                'art_date': key['_source']['art_date']
            }
            results.append(array_element)
        data = results
        return JsonResponse(data, safe=False)

# @brief Function get a List of Articles
# @param request
# @return JsonResponse with articles selected
@login_required(login_url='/login_required')
def advancedSearch(request, page=1):
    if request.method == 'POST':

        data = request.POST.get('data').encode('utf8')

        file = json.loads(open("explora/static/user.json").read())
        api_user = file["user"]
        api_password = file["password"]
        api_url = file["api_url"]

        # client = requests.post('http://{0}/v2/login/'.format(api_url),
        #     {'username': api_user, 'password': api_password})

        #cookies = dict(sessionid=client.cookies['sessionid'])

        api = u'http://{0}/v2/search/page/{1}/'.format(api_url, page)

        response = requests.post(api, data=data)

        data_array = json.loads(response.content.encode('utf8'))

        total_search = data_array['hits']['total'] 
        total_pages = data_array['totalPages']
        actual_page = data_array['page']
        data = data_array['hits']['hits']

        results = []
        for key in data:
            array_element = {
                'art_id': key['_id'],
                'art_title': key['_source']['art_title'],
                'art_url': key['_source']['art_url'],
                'art_image_link': key['_source']['art_image_link'],
                'art_name_press_source': key['_source']['art_name_press_source'],
                'art_category': key['_source']['art_category'],
                'art_date': key['_source']['art_date']
            }
            results.append(array_element)

        json_response = {'totalpages': total_pages,
                         'page': actual_page,
                         'total':total_search,
                         'results': results}
        return JsonResponse(json_response, safe=False)


# @brief Function that renders Tweets Page
# @param request
# @return HttpResponse with Tweets Page
@login_required(login_url='/login_required')
def tweets(request):

    my_user = request.user.social_auth.filter(provider='facebook').first()
    if my_user:
        url = u'https://graph.facebook.com/{0}/picture'.format(my_user.uid)
        return render(request, 'tweets.html', {'user': request.user.get_full_name(), 'profile_pic': url
                                               })
    else:
        return render(request, 'tweets.html', {'user': request.user.get_full_name()
                                               })


# @brief Function that get Tweet List
# @param request
# @return JsonResponse with Tweets List
@login_required(login_url='/login_required')
def getTweetsList(request, page=1):

    if request.method == 'POST':
        try:
            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]
            api_url = file["api_url"]

        except Exception as e:
            return HttpResponse("Failed to load user")

        api = u'http://{0}/v2/search/page/{1}/'.format(api_url, page)
        data = request.POST.get('data').encode('utf8')
        response = requests.post(api, data=data)
        data_array = json.loads(response.text.encode('utf8'))
        total = data_array['hits']['total']
        totalPages = data_array['totalPages']
        actual_page = data_array['page']
        data_array = data_array['hits']['hits']
        results = []

        for document in data_array:
            result = {
                "pub_username": document['_source']['pub_username'],
                "pub_date": document['_source']['pub_date'],
                "pub_content": document['_source']['pub_content'],
                "pub_url": document['_source']['pub_url']
            }
            results.append(result)

        json_response = {
            'totalPages': totalPages,
            'results': results,
            'total':total,
            'page': actual_page
        }

        return JsonResponse(json_response, safe=False)


# @brief Function that get histogram for Tweets
# @param request
# @return JsonResponse with histogram data
@login_required(login_url='/login_required')
def tweetsCountBy(request):
    if request.method == 'POST':

        startdate = request.POST.get('startdate').encode('utf8')
        enddate = request.POST.get('enddate').encode('utf8')
        countby = request.POST.get('countby').encode('utf8')
        search = request.POST.get('search').encode('utf8')

        file = json.loads(open("explora/static/user.json").read())
        api_user = file["user"]
        api_password = file["password"]
        api_url = file["api_url"]

       # client = requests.post('http://{0}/v2/login/'.format(api_url),
       #      {'username': api_user, 'password': api_password})

       # cookies = dict(sessionid=client.cookies['sessionid'])

        api = u'http://{0}/v2/publications/from/{1}/to/{2}/countby/{3}'.format(
            api_url, startdate, enddate, countby)

        try:
            response = requests.post(api, data=search)
            #response = requests.get(api)

        except Exception as e:
            return HttpResponse(e)

        data = json.loads(response.text.encode('utf8'))

        data = data['aggregations']['publications_over_time']['buckets']
        return JsonResponse(data, safe=False)


@login_required(login_url='/login_required')
def exportData(request):
    if request.method == 'POST':
        try:
            data = request.POST.get('data').encode('utf8')
            data = json.loads(data)
            search = data['search']
            options = data['checkbox']

            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]
            api_url = file["api_url"]

            corpusFields = []
            if(options['art_title'] == True):
                corpusFields.append('art_title')
            if(options['art_date'] == True):
                corpusFields.append('art_date')
            if(options['art_url'] == True):
                corpusFields.append('art_url')
            if(options['art_name_press_source'] == True):
                corpusFields.append('art_name_press_source')
            if(options['art_content'] == True):
                corpusFields.append('art_content')
            if(options['art_category'] == True):
                corpusFields.append('art_category')
            
            search['corpusFields']=corpusFields
            search = json.dumps(search)
            api = u'http://{0}/v2/corpus/'.format(api_url)
            response = requests.post(api,data=search)
            response = json.loads(response.content)
            response = response['hits']['hits']

            results = []
            for x in response:
                results.append(x['_source'])

            if(options['format'] == 'CSV'):
                csv_file = return_csv_file(results)
                return csv_file
            else:
                json_file = return_json_file(results)
                return json_file

        except Exception as e:
            print e
            return HttpResponse('Error')

    if request.method == 'GET':
        try:
            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]
            api_url = file["api_url"]
            corpusFields = []
            corpusFields.append('art_title')
            corpusFields.append('art_date')
            corpusFields.append('art_name_press_source')
            
            search = {'and': [],
                      'index': 'articles',
                      'dates': {'startdate': '2016-11-01', 'enddate': '2017-01-25'},
                      'fields': ['art_content'],
                      'not_and': [],
                      'art_name_press_source':"",
                      'or': [{'match': 'cholito '}],
                      'art_category': ""}
            
            search['corpusFields']=corpusFields
            search = json.dumps(search)
            api = u'http://{0}/v2/corpus/'.format(api_url)
            response = requests.post(api,data=search)
            response = json.loads(response.content)
            response = response['hits']['hits']

            results = []
            for x in response:
                results.append(x['_source'])
        
            json_file = return_json_file(results)
            csv_file = return_csv_file(results)
            return csv_file

        except Exception as e:
            print e
            return HttpResponse('')