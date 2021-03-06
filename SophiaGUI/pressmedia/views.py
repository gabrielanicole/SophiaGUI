from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import simplejson as json
import requests
import tweepy
from twitter import addFriend, removeFriend
from explora.models import Profile, Analist

# Create your views here.


@login_required(login_url='/login_required')
def pressMedia(request):
    analist_requests = Analist.objects.filter(request_send=True).exclude(request_accepted=True).count()
    my_user = request.user.social_auth.filter(provider='facebook').first()
    if my_user:
        url = u'https://graph.facebook.com/{0}/picture'.format(my_user.uid)
        return render(request, 'pressmedia.html', {'user': request.user.get_full_name(),
                                                   'profile_pic': url,
                                                   'analist_requests':analist_requests
                                                   })
    else:
        return render(request, 'pressmedia.html', {'user': request.user.get_full_name(),
                                                  'analist_requests':analist_requests
                                                   })

@login_required(login_url='/login_required')
def insertPressMedia(request):
    if request.method == 'POST':
        try:
            data = request.POST.get('data').encode('utf8')
            client,headers,api_url = getClient()
            data = json.loads(data)

            consumer_key = 'wHpPsl5nuZXEyJU6fgqPzvs3V'
            consumer_secret = 'zqDiIsAMGaCvuQpwYFZCawLGjRWHH9UNW6iPq9lXdY3PEvmYTk'
            access_token = '822060303907176448-YYFVabdPAF8Fw8JbB7bM2out2RUFTvn'
            access_token_secret = 'ctFi2JCDuI80e6lYCZDzKu3OYTBhvzAXeS1bCfO7aKMtn'
            auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
            auth.set_access_token(access_token, access_token_secret)
            t_api = tweepy.API(auth)
            addFriend(t_api, data['pre_twitter'])
            if addFriend == '200':
                data = json.dumps(data)
                api = u'http://{0}/v2/pressmedia/'.format(api_url)
                response = client.post(api, data=data, headers=headers)
                return HttpResponse('Se ha insertado un nuevo medio de prensa')
            else:
                return HttpResponse('No se ha insertado un nuevo usuario')
        except Exception as e:
            print e
            return HttpResponse('Ha ocurrido un error durante el proceso')


@login_required(login_url='/login_required')
def getPressMedia(request):
    if request.method == 'GET':
        try:
            client,headers,api_url = getClient()
            api = u'http://{0}/v2/pressmedia/'.format(api_url)
            response = client.get(api, headers=headers)
            return HttpResponse('')
        except Exception as e:
            print e
            return HttpResponse('')

    if request.method == 'POST':
        try:
            media_id = request.POST.get('media_id').encode('utf8')
            client,headers,api_url = getClient()
            api = u'http://{0}/v2/pressmedia/{1}'.format(api_url, media_id)
            response = client.get(api, headers=headers)
            response = json.loads(response.content)
            response = response['_source']
            return JsonResponse(response, safe=False)
        except Exception as e:
            print e
            return HttpResponse('')


@login_required(login_url='/login_required')
def getListPressMedia(request):
    if request.method == 'GET':
        try:
            client,headers,api_url = getClient()
            api = u'http://{0}/v2/pressmedia/ids/'.format(api_url)
            response = client.get(api, headers=headers)
            data = json.loads(response.content)
            data = data['hits']['hits']
            results = []
            for x in data:
                media = {
                    'media_id': x['_id'],
                    'media_name': x['fields']['pre_name'][0],
                    'media_twitter': x['fields']['pre_twitter'][0]
                }
                results.append(media)
            return JsonResponse(results, safe=False)
        except Exception as e:
            print e
            return HttpResponse('')


@login_required(login_url='/login_required')
def getMediaGroups(request):
    if request.method == 'GET':
        try:
            client,headers,api_url = getClient()
            api = u'http://{0}/v2/pressmedia/owners/'.format(api_url)
            response = client.get(api, headers=headers)
            d = json.loads(response.content)
            data = {
                'names': d
            }
            return JsonResponse(data, safe=False)
        except Exception as e:
            print e
            return HttpResponse('error')

@login_required(login_url='/login_required')
def editPressMedia(request):
    if request.method == 'POST':
        try:
            data = request.POST.get('data').encode('utf8')
            media_id = request.POST.get('mediaEditid').encode('utf8')
            client,headers,api_url = getClient()
            data = json.loads(data)
            consumer_key = 'wHpPsl5nuZXEyJU6fgqPzvs3V'
            consumer_secret = 'zqDiIsAMGaCvuQpwYFZCawLGjRWHH9UNW6iPq9lXdY3PEvmYTk'
            access_token = '822060303907176448-YYFVabdPAF8Fw8JbB7bM2out2RUFTvn'
            access_token_secret = 'ctFi2JCDuI80e6lYCZDzKu3OYTBhvzAXeS1bCfO7aKMtn'
            auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
            auth.set_access_token(access_token, access_token_secret)
            t_api = tweepy.API(auth)
            addFriend(t_api, data['pre_twitter'])
            data = json.dumps(data)
            api = u'http://{0}/v2/pressmedia/{1}/'.format(api_url, media_id)
            response = client.put(api, data=data, headers=headers)
            return HttpResponse('Se ha editado nuevo medio de prensa')
        except Exception as e:
            print e
            return HttpResponse('Ha ocurrido un error durante el proceso')

@login_required(login_url='/login_required')
def deletePressMedia(request):
    if request.method == 'POST':
        try:
            media_id = request.POST.get('media_id').encode('utf8')
            screen_name = request.POST.get('twitter').encode('utf8')
            client,headers,api_url = getClient()

            #delete from Twitter
            consumer_key = 'wHpPsl5nuZXEyJU6fgqPzvs3V'
            consumer_secret = 'zqDiIsAMGaCvuQpwYFZCawLGjRWHH9UNW6iPq9lXdY3PEvmYTk'
            access_token = '822060303907176448-YYFVabdPAF8Fw8JbB7bM2out2RUFTvn'
            access_token_secret = 'ctFi2JCDuI80e6lYCZDzKu3OYTBhvzAXeS1bCfO7aKMtn'
            auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
            auth.set_access_token(access_token, access_token_secret)
            t_api = tweepy.API(auth)
            removeFriend(t_api, screen_name)

            api = u'http://{0}/v2/pressmedia/{1}/'.format(api_url, media_id)
            response = client.delete(api, headers=headers)

            return HttpResponse("Ok")
        except Exception as e:
            print e 
            return HttpResponse("Internal Server Error")

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