from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.contrib.auth.models import User, Group, Permission
from django.contrib.auth.decorators import login_required
from explora.models import Profile, Analist
from django.core import serializers
from django.http import JsonResponse
from explora.models import Profile, Analist
from django.contrib.contenttypes.models import ContentType

# Create your views here.
@login_required(login_url='/login_required')
def user_request(request):

    my_user = request.user.social_auth.filter(provider='facebook').first()
    analist_requests = Analist.objects.filter(request_send=True).exclude(request_accepted=True).count()

    try:
        profile = Profile.objects.get(pk=request.user.pk)
        analist = Analist.objects.get(user_id=profile.pk)

    except Exception as e:
        print e
        u = request.user
        profile = Profile(user=u, activation_url="NULL")
        profile.save()
        analist = Analist(user=profile)
        analist.save()

    if my_user:
        url = u'https://graph.facebook.com/{0}/picture'.format(my_user.uid)
        return render(request, 'user_requests.html', {'user': request.user.get_full_name(),
                                                      'profile_pic': url,
                                                      'analist_requests':analist_requests,
                                                      'analist':analist
                                                   })
    else:
        return render(request, 'user_requests.html', {'user': request.user.get_full_name(),
                                                      'analist_requests':analist_requests,
                                                      'analist':analist
                                                   })

@login_required(login_url='/login_required')
def changeToAnalyst(request):
    profile = Profile.objects.get(pk=request.user.pk)
    analist = Analist.objects.get(user_id=profile.pk)
    analist.request_send = True
    analist.save()
    return HttpResponse("ok")

@login_required(login_url='/login_required')
def getRequestList(request):
    if request.method == 'GET':
        analist_list = Analist.objects.filter(request_send=True).exclude(request_accepted=True)
        response_list = []
        for x in analist_list:
            d = {
                'username':x.user.user.username,
                'firstname':x.user.user.first_name,
                'lastname':x.user.user.last_name,
                'email':x.user.user.email
            }
            response_list.append(d)
        return JsonResponse(response_list, safe=False)

@login_required(login_url='/login_required')
def acceptAnalistRequest(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        user = User.objects.get(username=username)
        profile = Profile.objects.get(pk=user.pk)
        analist = Analist.objects.get(user_id=profile.pk)
        analist.request_accepted = True
        analist.save()
        group = Group.objects.get(name='Analistas')
        user.groups.add(group)
        return HttpResponse("ok")

@login_required(login_url='/login_required')
def rejectAnalistRequest(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        user = User.objects.get(username=username)
        profile = Profile.objects.get(pk=user.pk)
        analist = Analist.objects.get(user_id=profile.pk)
        analist.request_send  = False
        analist.request_accepted = False
        analist.save()
        return HttpResponse("ok")

@login_required(login_url='/login_required')
def getAllowedRequestList(request):
    if request.method == 'GET':
        analist_list = Analist.objects.filter(request_accepted=True)
        response_list = []
        for x in analist_list:
            d = {
                'username':x.user.user.username,
                'firstname':x.user.user.first_name,
                'lastname':x.user.user.last_name,
                'email':x.user.user.email
            }
            response_list.append(d)
        return JsonResponse(response_list, safe=False)

@login_required(login_url='/login_required')
def removePermission(request):
    if request.method == 'POST':
        try:
            username = request.POST.get('username')
            user = User.objects.get(username=username)
            profile = Profile.objects.get(pk=user.pk)
            analist = Analist.objects.get(user_id=profile.pk)
            analist.request_send  = False
            analist.request_accepted = False
            analist.save()
            group = Group.objects.get(name='Analistas')
            group.user_set.remove(user)
            return HttpResponse("success")
        except Exception as e:
            print e
            return HttpResponse("error")