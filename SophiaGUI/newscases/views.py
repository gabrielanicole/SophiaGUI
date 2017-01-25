from django.shortcuts import render
from explora.models import Profile, NewsCase
from django.shortcuts import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.http import JsonResponse
import requests
import simplejson as json
from django.core import serializers
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q

# Create your views here.
# @brief Function that create a NewsCase
# @param request
# @return HttpResponse with status
@login_required(login_url='/login_required')
def createNewsCase(request):
    if request.method == 'POST':
        try:

            data = request.POST.get('data').encode('utf8')
            data = json.loads(data)
            follow_new_feed = data['follow_new_feed']

            elastic_data = {
                "new_name": data['new_name'],
                "new_date": data['new_date']+" 00:00:00",
                "new_date_from": data['dates']['startdate'] +" 00:00:00",
                "new_date_to": data['dates']['enddate'] +" 00:00:00",
                "new_and": data['and'],
                "new_or": data['or'],
                "new_category": data['category'],
                "new_press_source": data['press_source'],
                "new_not": data['not_and'],
                "new_art_yes": [],
                "new_art_not": [],
                "new_index": data['index'],
                "new_fields": data['fields']
            }

            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]
            api_url = file["api_url"]

            get_first_document ={
                "index": data['index'],
                "fields": data['fields'],
                "and": data['and'],
                "or": data['or'],
                "not_and": data['not_and'],
                "dates": { "startdate": data['dates']['startdate'], "enddate": data['dates']['enddate'] },
                "category": data['category'],
                "press_source": data['press_source']
            }

            get_first_document = json.dumps(get_first_document)
            try:
                api = u'http://{0}/v2/search/page/1/'.format(api_url)
                documents = requests.post(api, data=get_first_document)
                doc_results = json.loads(documents.text.encode('utf8'))
                doc_results = doc_results['hits']['hits']
                img_preview = doc_results[0]['_source']['art_image_link']
            except Exception as e:
                print e
                return HttpResponse(e)

            try:
                elastic_data = json.dumps(elastic_data)
                api = u'http://{0}/v2/newscases/'.format(api_url)
                response = requests.post(api,data=elastic_data)
                elastic_response = json.loads(response.text.encode('utf8'))
                elastic_id = elastic_response['_id']
            except Exception as e:
                print e
                return HttpResponse(e)

            userprofile = Profile.objects.get(user=request.user.pk)
            newCase = NewsCase(name=data['new_name'],
                               elastic_id=elastic_id,
                               img_preview=img_preview,
                               user=userprofile,
                               follow_new_feed=follow_new_feed,
                               creation_date=data['new_date']
                               )
            newCase.save()
            return HttpResponse('ok')

        except Exception as e:
            print e
            return HttpResponse(e)


@login_required(login_url='/login_required')
def newsCases(request):

    my_user = request.user.social_auth.filter(provider='facebook').first()
    if my_user:
        url = u'https://graph.facebook.com/{0}/picture'.format(my_user.uid)
        return render(request, 'newscase.html', {'user': request.user.get_full_name(), 'profile_pic': url
                                               })
    else:
        return render(request, 'newscase.html', {'user': request.user.get_full_name()
                                               })

@login_required(login_url='/login_required')
def getUserNewsCases(request, page=1):
    if request.method == 'POST':
        userprofile = Profile.objects.get(user=request.user.pk)

        data = request.POST.get('data').encode('utf8')
        data = json.loads(data)

        search_and = data['and']
        search_not = data['not_and']
        search_or = data['or']
        startdate = data['startdate']
        enddate = data['enddate']
      
        bus_and = []
        for x in range(len(search_and)):
            if search_and[x].get('match') != None:
                aux = search_and[x].get('match').split()
                for w in aux:
                    bus_and.append(w)
            if search_and[x].get('match_phrase') != None:
                aux = search_and[x].get('match_phrase')
                bus_and.append(aux) 
        bus_or = []
        for x in range(len(search_or)):
            if search_or[x].get('match') != None:
                aux = search_or[x].get('match').split()
                for w in aux:
                    bus_or.append(w)
            if search_or[x].get('match_phrase') != None:
                aux = search_or[x].get('match_phrase')
                bus_or.append(aux) 
        bus_not = []
        for x in range(len(search_not)):
            if search_not[x].get('match') != None:
                aux = search_not[x].get('match').split()
                for w in aux:
                    bus_not.append(w)
            if search_not[x].get('match_phrase') != None:
                aux = search_not[x].get('match_phrase')
                bus_not.append(aux)

        q_objects = Q()
        for item in bus_and:
            q_objects.add(Q(name__contains=item),Q.AND)

        for item in bus_or:
            q_objects.add(Q(name__contains=item),Q.OR)
        
        for item in bus_not:
            q_objects.add(~Q(name__contains=item),Q.OR)

        q_objects.add(Q(user=userprofile),Q.AND)
        q_objects.add(Q(visible = True),Q.AND)

        #------------------------------------------#
        #q_objects.add(Q(creation_date__range=[startdate,enddate]))
        #------------------------------------------#
        user_news_cases = NewsCase.objects.filter(q_objects)
        p = Paginator(user_news_cases,10)
        try:
            cases = p.page(page).object_list
        except PageNotAnInteger:
            cases = p.page(1).object_list
        except EmptyPage:
            cases = p.page(p.num_pages).object_list
        
        data = []
        for x in cases:
            d ={
                'name':x.name,
                'elastic_id':x.elastic_id,
                'img_preview':x.img_preview,
                'creation_date':x.creation_date,
            }
            data.append(d)

        data_json ={ 
            'page': page,
            'totalpages':p.num_pages,
            'data': data}

        return JsonResponse(data_json, safe=False)

@login_required(login_url='/login_required')
def showNewsCase(request,elastic_id):

    my_user = request.user.social_auth.filter(provider='facebook').first()
    if my_user:
        url = u'https://graph.facebook.com/{0}/picture'.format(my_user.uid)
        return render(request, 'shownewscases.html', {'user': request.user.get_full_name(), 'profile_pic': url
                                               })
    else:
        return render(request, 'shownewscases.html', {'user': request.user.get_full_name()
                                               })

@login_required(login_url='/login_required')
def getNewCaseInfo(request):
    if request.method == 'POST':
        elastic_id = request.POST.get('elastic_id')
        try:
            userprofile = Profile.objects.get(user=request.user.pk)
            newCase = NewsCase.objects.get(elastic_id=elastic_id)
        except Exception as e:
            print e
            return HttpResponse("e")       
        try:
            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]
            api_url = file["api_url"]
            api = u'http://{0}/v2/newscases/{1}/'.format(api_url,elastic_id)
            response = requests.get(api)
            response = json.loads(response.content)
            response = response['_source']

            json_response = {
                "follow_new_feed": newCase.follow_new_feed,
                "news_case_data":response
            }

            return JsonResponse(json_response, safe=False)
        except Exception as e:
            print e
            return HttpResponse(e)

@login_required(login_url='/login_required')
def updateNewsCase(request):
    if request.method == 'POST':
        try:
            data = request.POST.get('data').encode('utf8')
            data = json.loads(data)
            follow_new_feed = data['follow_new_feed']
            elastic_id = data['elastic_id']

            newCase = NewsCase.objects.get(elastic_id=elastic_id)
                       
            if len(data['new_name']) > 0:
                newCase.name = data['new_name']
                newCase.follow_new_feed = follow_new_feed
                newCase.save()
                elastic_data = {
                    "new_name": data['new_name'],
                    "new_date_from": data['dates']['startdate'] +" 00:00:00",
                    "new_date_to": data['dates']['enddate'] +" 00:00:00",
                    "new_and": data['and'],
                    "new_or": data['or'],
                    "new_category": data['category'],
                    "new_press_source": data['press_source'],
                    "new_not": data['not_and'],
                }

            else:
                newCase.follow_new_feed = follow_new_feed
                newCase.save()
                elastic_data = {
                    "new_date_from": data['dates']['startdate'] +" 00:00:00",
                    "new_date_to": data['dates']['enddate'] +" 00:00:00",
                    "new_and": data['and'],
                    "new_or": data['or'],
                    "new_category": data['category'],
                    "new_press_source": data['press_source'],
                    "new_not": data['not_and'],
                }
            
            elastic_data = json.dumps(elastic_data)

            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]
            api_url = file["api_url"]
            api = u'http://{0}/v2/newscases/{1}/'.format(api_url,elastic_id)
            response = requests.put(api, data=elastic_data)

            return HttpResponse("ok")

        except Exception as e:
            print e
            return HttpResponse(e)

@login_required(login_url='/login_required')
def removeArticle(request):
    if request.method == 'POST':
        try:
            elastic_id = request.POST.get('elastic_id')
            article_id = request.POST.get('article_id')
            try:
                userprofile = Profile.objects.get(user=request.user.pk)
                newCase = NewsCase.objects.get(elastic_id=elastic_id)
            except Exception as e:
                return HttpResponse("The newscase was from another person")
            
            file = json.loads(open("explora/static/user.json").read())
            api_user = file["user"]
            api_password = file["password"]
            api_url = file["api_url"]
            api = u'http://{0}/v2/newscases/{1}/'.format(api_url,elastic_id)
            response = requests.get(api)
            response = json.loads(response.content)
            new_art_not = response['_source']['new_art_not']
            new_art_not.append(article_id)
            response_data = {
                "new_art_not":new_art_not
            }
            response_data = json.dumps(response_data)
            response = requests.put(api, data=response_data)
            return HttpResponse("ok")
        except Exception as e:
            print e
            return HttpResponse(e)

@login_required(login_url='/login_required')
def removeNewsCase(request):
    if request.method == 'POST':
            elastic_id = request.POST.get('elastic_id')
            try:
                userprofile = Profile.objects.get(user=request.user.pk)
                newCase = NewsCase.objects.get(elastic_id=elastic_id)
            except Exception as e:
                return HttpResponse("The newscase was from another person")
            newCase.visible = False
            newCase.save()
            return HttpResponse('')