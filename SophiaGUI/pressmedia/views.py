from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import simplejson as json
import requests

# Create your views here.
@login_required(login_url='/login_required')
def pressMedia(request):
    my_user = request.user.social_auth.filter(provider='facebook').first()
    if my_user:
        url = u'https://graph.facebook.com/{0}/picture'.format(my_user.uid)
        return render(request, 'pressmedia.html', {'user': request.user.get_full_name(), 'profile_pic': url
                                               })
    else:
        return render(request, 'pressmedia.html', {'user': request.user.get_full_name()
                                               })

@login_required(login_url='/login_required')                              
def insertPressMedia(request):
    if request.method == 'POST':
        try:
            data = request.POST.get('data').encode('utf8')
            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]
            api_url = file["api_url"]
            #api = u'http://{0}/v2/pressmedia/'.format(api_url)
            #response = requests.post(api, data=data)
            return HttpResponse('Se ha insertado un nuevo medio de prensa')
        except Exception as e:
            print e
            return HttpResponse('Ha ocurrido un error durante el proceso')

def getPressMedia(request):
    if request.method == 'GET':
        try:
            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]
            api_url = file["api_url"]
            api = u'http://{0}/v2/pressmedia/'.format(api_url) 
            response = requests.get(api)
            print response.content
            return HttpResponse('')
        except Exception as e:
            print e
            return HttpResponse('')
            
    if request.method == 'POST':
        try:
            media_id = request.POST.get('media_id').encode('utf8')
            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]
            api_url = file["api_url"]
            api = u'http://{0}/v2/pressmedia/{1}'.format(api_url, media_id) 
            response = requests.get(api)
            response = json.loads(response.content)
            response = response['_source']
            return JsonResponse(response, safe=False)
        except Exception as e:
            print e
            return HttpResponse('')            

def getListPressMedia(request):
    if request.method == 'GET':
        try:
            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]
            api_url = file["api_url"]
            api = u'http://{0}/v2/pressmedia/ids/'.format(api_url) 
            response = requests.get(api)
            data = json.loads(response.content)
            data = data['hits']['hits']
            results = []
            for x in data:
                media = {
                    'media_id':x['_id'],
                    'media_name':x['fields']['pre_name']    
                }
                results.append(media)
            return JsonResponse(results,safe=False)
        except Exception as e:
            print e
            return HttpResponse('')