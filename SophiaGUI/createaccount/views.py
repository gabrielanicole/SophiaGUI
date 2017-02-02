from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.contrib.auth.models import User
from explora.models import Profile
import simplejson as json
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
                new_user = User.objects.create_user(username=username,
                                                    email=email,
                                                    password=password,
                                                    first_name=firstname,
                                                    last_name=lastname)
                new_user.save()
                profile = Profile(user=new_user)
                profile.save()
                return HttpResponse("new user created")

        except Exception as e:
            print e
            return HttpResponse('Internal Error!')