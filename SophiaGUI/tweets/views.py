from django.shortcuts import render, HttpResponse, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.http import JsonResponse
import requests
import simplejson as json
from explora.models import Profile, NewsCase, Analist
# Create your views here.

# @brief Function that renders Tweets Page
# @param request
# @return HttpResponse with Tweets Page
@login_required(login_url='/login_required')
def tweets(request):

    analist_requests = Analist.objects.filter(request_send=True).exclude(request_accepted=True).count()
    my_user = request.user.social_auth.filter(provider='facebook').first()
    if my_user:
        url = u'https://graph.facebook.com/{0}/picture'.format(my_user.uid)
        return render(request, 'tweets.html', {'user': request.user.get_full_name(),
                                               'profile_pic': url,
                                               'analist_requests':analist_requests
                                               })
    else:
        return render(request, 'tweets.html', {'user': request.user.get_full_name(),
                                                'analist_requests':analist_requests
                                               })

# @brief Function that get Tweet List
# @param request
# @return JsonResponse with Tweets List
@login_required(login_url='/login_required')
def getTweetsList(request, page=1):

    if request.method == 'POST':
        client,headers,api_url = getClient()
        api = u'http://{0}/v2/search/page/{1}/'.format(api_url, page)
        data = request.POST.get('data').encode('utf8')
        
        response = client.post(api, data=data, headers=headers)
        data_array = json.loads(response.text.encode('utf8'))
        articles_by_media = data_array['aggregations']['countByPressMedia']['buckets']
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
            'page': actual_page,
            'articles_by_media':articles_by_media
        }

        return JsonResponse(json_response, safe=False)


# @brief Function that get histogram for Tweets
# @param request
# @return JsonResponse with histogram data
@login_required(login_url='/login_required')
def tweetsCountBy(request):
    if request.method == 'POST':

        countby = request.POST.get('countby').encode('utf8')
        search = request.POST.get('search').encode('utf8')

        client,headers,api_url = getClient()
        search = json.loads(search)
        search['countby']=countby
        search = json.dumps(search)

        api = u'http://{0}/v2/countby/'.format(api_url)
        try:
            response = client.post(api, data=search, headers=headers)
        except Exception as e:
            return HttpResponse(e)

        data = json.loads(response.text.encode('utf8'))

        data = data['aggregations']['result_over_time']['buckets']
        return JsonResponse(data, safe=False)

@login_required(login_url='/login_required')
def getStackBar(request):
    countby = request.POST.get('countby').encode('utf8')
    search = request.POST.get('search').encode('utf8')
        
    search = json.loads(search)
    search['countby']=countby
    search = json.dumps(search)

    client,headers,api_url = getClient()
    api = u'http://{0}/v2/stackbar/'.format(api_url)
    try:
        response = client.post(api, data=search, headers=headers)
            #response = requests.get(api)
    except Exception as e:
        return HttpResponse(e)
         
    data = json.loads(response.text.encode('utf8'))
    total_by_day = data['aggregations']['result_over_time_all']
    total_by_media = data['aggregations']['countByPressMedia']['buckets']

    data = {
        'total_by_day':total_by_day,
        'total_by_media':total_by_media
    }
    return JsonResponse(data, safe=False)

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