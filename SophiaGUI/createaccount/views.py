#-*- conding:utf8 -*-

from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.contrib.auth.models import User, Group
from explora.models import Profile, Analist
import simplejson as json
from django.http import JsonResponse
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
import uuid
import sys, os

# Create your views here.
def createaccount(request):
    return render(request,'registration.html')

def createUser(request):
    reload(sys)
    sys.setdefaultencoding('utf8')
    if request.method == 'POST':
        try:
            data = json.loads(request.POST.get('data').encode('utf8'))

            username = data['username'].encode('utf8')
            firstname = data['firstname'].encode('utf8')
            lastname = data['lastname'].encode('utf8')
            password = data['password'].encode('utf8')
            email = data['email'].encode('utf8')

            #validate if user exists
            if User.objects.filter(username=username).exists():
                return HttpResponse('user exists')
            else:
                #then create the new user and profile
                new_user = User.objects.create_user(username=username,
                                                    email=email,
                                                    password=password,
                                                    first_name=firstname,
                                                    last_name=lastname,
                                                    is_active=False)
                new_user.save()
                #ver el uuid a partir de un usuario
                link = uuid.uuid3(uuid.NAMESPACE_DNS, username)
                profile = Profile(user=new_user, activation_url=link)
                profile.save()
                analist = Analist(user=profile)
                analist.save()
                
                content = useTemplate('http://www.sophia-project.info/activate/'+str(link), username.encode('utf8',errors='strict'))
                subject = 'Confirme su direccion de correo electronico'
                text_content = 'habilita el html de tu correo'
                html_content = content.encode('utf8')
                from_email = '"Sophia Project" <sophiaproject4@gmail.com>'
                to = email
                msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
                msg.attach_alternative(html_content, "text/html")
                msg.send()
                return HttpResponse("new user created")

        except Exception as e:
            print e
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
            return HttpResponse('Internal Error!')

def useTemplate(link, username):
    htmlFile = open("explora/static/mailConformation.html")
    content = htmlFile.read()
    content = content.replace("$$link$$",str(link).encode('utf8'))
    content = content.replace("$$username$$",str(username.encode('utf8',errors='strict')))
    return(content)

def activateUser(request, userUrl):
    user_profile = Profile.objects.get(activation_url=userUrl)
    user = User.objects.get(pk=user_profile.user_id)
    if(user.is_active == False):
        user.is_active = True
    else:
        user.is_active = True
    user.save()

    return render(request,'accountactive.html',{'user':user.get_full_name()})