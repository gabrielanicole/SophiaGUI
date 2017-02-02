from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.contrib.auth.models import User
from explora.models import Profile
import simplejson as json
from django.http import JsonResponse
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
import uuid
# Create your views here.

def createaccount(request):
    return render(request,'registration.html')

def createUser(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.POST.get('data').encode('utf8'))
            username = data['username']
            firstname = data['firstname']
            lastname = data['lastname']
            password = data['password']
            email = data['email']

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
                profile = Profile(user=new_user)
                profile.save()
                return HttpResponse("new user created")

        except Exception as e:
            print e
            return HttpResponse('Internal Error!')



def sendmail(request):
    link = uuid.uuid3('javier')
    print link
    content = useTemplate('www.confirme.mail.com/'+str(link))
    try:
        subject = 'Confirme su direccion de correo electronico'
        text_content = 'habilita el html de tu correo'
        html_content = content
        from_email = '"Sophia Project" <sophiaproject4@gmail.com>'
        to = "javierperezferrada@gmail.com"
        msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
    except Exception as e:
        print "fallo sendmail"
        print e
    return JsonResponse({"response":"ok"})

def useTemplate(link):
    htmlFile = open("mailConfirmation.html")
    content = htmlFile.read()
    content = content.replace("$$link$$",str(link))
    return(content)
