# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.shortcuts import redirect
from django.contrib.auth.models import User
from models import Profile, NewsCase, Analist
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
from filewriter import return_json_file, return_csv_file, return_csv_text_file

# @brief Function that login the user to Sophia GUI.
# @param request Web request with login data (username, password)
# @return HttpResponse Redirect to the "Index" if Login fails or "Articles" if success
def login(request):
    if request.method == 'POST':
        try:
            username = request.POST['username']
            password = request.POST['password']
            user = User.objects.get(username=username)
            if user is not None:
                if user.is_active:
                    user = authenticate(username=username, password=password)
                    auth_login(request, user)
                    return redirect('articles')
                else:
                    return render(request, 'accountnotactive.html')
                    # here should be an else for when user account is disbled
            else:
                return redirect('index')
        except Exception as e:
            return render(request,'badlogin.html')

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

# @brief Function that log out the user from Sophia
# @param requestfrom django.http import JsonResponse
# @return HttpResponse with the main page
@login_required()
def logout(request):
    auth_logout(request)
    return redirect(index)

# @brief Function that  render the "articles" page.
# @param request Web request
# @param num Value for the pagination
# @return HttpResponse with the articles page.
# @warning Login is required.
@login_required(login_url='/login_required')
def articles(request, num=1):

    analist_requests = Analist.objects.filter(request_send=True).exclude(request_accepted=True).count()
    my_user = request.user.social_auth.filter(provider='facebook').first()
    
    if my_user:
        url = u'https://graph.facebook.com/{0}/picture'.format(my_user.uid)
        return render(request, 'articles.html', {'user': request.user.get_full_name(),
                                                 'profile_pic': url,
                                                 'analist_requests':analist_requests,
                                                 })
    else:
        return render(request, 'articles.html', {'user': request.user.get_full_name(),
                                                 'analist_requests':analist_requests,
                                                 })

@login_required()
def modal_new(request):
    if request.method == 'POST':

        client,headers,api_url = getClient()
        art_id = request.POST.get('art_id').encode('utf8')
        # client = requests.post('http://{0}/v2/login/'.format(api_url),
        #     {'username': api_user, 'password': api_password})
        #cookies = dict(sessionid=client.cookies['sessionid'])
        #api_url = u'http://api.sophia-project.info/articles/{0}/'.format(news_pk)
        api_url = u'http://{0}/v2/articles/{1}/'.format(api_url, art_id)

        #response = requests.get(api_url ,cookies=cookies)
        response = client.get(api_url, headers=headers)

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

# @brief Function that conect to the API and get articles between two dates and group by date
# @param request
# @return JsonResponse with the data
@login_required(login_url='/login_required')
def articlesCountBy(request):
    if request.method == 'POST':

        countby = request.POST.get('countby').encode('utf8')
        search = request.POST.get('search').encode('utf8')
        
        search = json.loads(search)
        search['countby']=countby
        search = json.dumps(search)

        client,headers,api_url = getClient()
        api = u'http://{0}/v2/countby/'.format(api_url)
        try:
            response = client.post(api, data=search, headers=headers)
            #response = requests.get(api)

        except Exception as e:
            return HttpResponse(e)

        data = json.loads(response.text.encode('utf8'))
        data = data['aggregations']['result_over_time']['buckets']
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

        client,headers,api_url = getClient()

        api = u'http://{0}/v2/articles/from/{1}/to/{2}/'.format(api_url, startdate, enddate)

        response = client.get(api, cookies=cookies, headers=headers)

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

        client,headers,api_url = getClient()

        api = u'http://{0}/v2/search/page/{1}/'.format(api_url, page)
        response = client.post(api, data=data, headers=headers)
        #response = requests.post(api, data=data)

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


@login_required(login_url='/login_required')
def exportData(request):
    if request.method == 'POST':
        try:
            data = request.POST.get('data').encode('utf8')
            data = json.loads(data)
            search = data['search']
            options = data['checkbox']

            client,headers,api_url = getClient()
            corpusFields = []
            if(options['art_title'] == True):
                corpusFields.append('art_title')
            if(options['art_date'] == True):
                corpusFields.append('art_date')
            if(options['art_url'] == True):
                corpusFields.append('art_url')
            if(options['art_name_press_source'] == True):
                corpusFields.append('art_name_press_source')
            if(options['art_category'] == True):
                corpusFields.append('art_category')
            
            search['corpusFields']=corpusFields
            search = json.dumps(search)
            api = u'http://{0}/v2/corpus/'.format(api_url)
            response = client.post(api,data=search,headers=headers)
            response = json.loads(response.content)
            response = response['hits']['hits']

            results = []
            for x in response:
                results.append(x['_source'])

            if(options['format'] == 'CSV'):
                csv_file = return_csv_file(results)
                return csv_file
            elif(options['format'] == 'TXT'):
                txt_file = return_csv_text_file(results)
                return txt_file
            else:
                json_file = return_json_file(results)
                return json_file

        except Exception as e:
            print e
            return HttpResponse(e)

@login_required(login_url='/login_required')
def changeCategory(request):
    if request.method == 'POST':
        try:
            art_id = request.POST.get('id')
            category = request.POST.get('category')
            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]
            api_url = file["api_url"]
            api = u'http://{0}/v2/articles/{1}/'.format(api_url, art_id)
            response = requests.put(api, data={'art_category':category})
            return HttpResponse("success")
        except Exception as e:
            print e
            return HttpResponse("Error")

def getClient():
    file = json.loads(open("explora/static/user.json").read())
    api_url = file["api_url"]
    api_token = file["token"]
    URL_BASE_API = "http://api.sophia-project.info/"
    PARAM_LOGIN_URL = URL_BASE_API + "accounts/login"
    client = requests.session()
    client.get(PARAM_LOGIN_URL)
    csrftoken = client.cookies['csrftoken']
    headers = {"Authorization":"Bearer "+api_token}
    headers["X-CSRFToken"] = csrftoken
    return client, headers, api_url