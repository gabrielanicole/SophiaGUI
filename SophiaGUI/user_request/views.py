from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from explora.models import Profile, Analist
from django.core import serializers
from django.http import JsonResponse

# Create your views here.
@login_required(login_url='/login_required')
def user_request(request):

    my_user = request.user.social_auth.filter(provider='facebook').first()
    profile = Profile.objects.get(pk=request.user.pk)
    analist = Analist.objects.get(user_id=profile.pk)

    if my_user:
        url = u'https://graph.facebook.com/{0}/picture'.format(my_user.uid)
        return render(request, 'user_requests.html', {'user': request.user.get_full_name(),
                                                      'profile_pic': url,
                                                      'analist':analist
                                                   })
    else:
        return render(request, 'user_requests.html', {'user': request.user.get_full_name(),
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
        analist_list = Analist.objects.filter(request_send=True).select_related()
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
