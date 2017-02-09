from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.contrib.auth.models import User, Group, Permission
from django.contrib.auth.decorators import login_required
from explora.models import Profile, Analist
from django.core import serializers
from django.http import JsonResponse
from explora.models import Profile, Analist
from django.contrib.contenttypes.models import ContentType
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives

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

        content = useTemplate(username)
        subject = 'Se ha aceptado su solicitud de Analista'
        text_content = 'habilita el html de tu correo'
        html_content = content
        from_email = '"Sophia Project" <sophiaproject4@gmail.com>'
        to = user.email
        msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
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

def useTemplate(username):
    htmlFile = open("explora/static/analistConfirmation.html")
    content = htmlFile.read()
    content = content.replace("$$username$$",str(username))
    return(content)