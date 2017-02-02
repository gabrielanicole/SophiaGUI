from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.contrib.auth.models import User
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
            return HttpResponse("0k")
        except Exception as e:
            print e
            return HttpResponse('')