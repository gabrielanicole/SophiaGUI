from django.shortcuts import render
from django.shortcuts import HttpResponse
import requests
import simplejson as json
from telnetlib import theNULL
from pprint import pprint


def modal_new(request):
        if request.method == 'POST':
            #here we should have the id of the new.
            json_data = json.dumps({
                                    "title":"Titular de la Noticia",
                                    "date":"23/01/2016",
                                    "host":"Radio BioBio",
                                    "url": "https://t.co/l5U8VqUGcA",
                                    "content":"Attention he extremity unwilling on otherwise. Conviction up partiality as delightful is discovered. Yet jennings resolved disposed exertion you off. Left did fond drew fat head poor. So if he into shot half many long. China fully him every fat was world grave  Left did fond drew fat head poor. So if he into shot half many long. China fully him every fat was world grave  Left did fond drew fat head poor. So if he into shot half many long. China fully him every fat was world grave  Left did fond drew fat head poor. So if he into shot half many long. China fully him every fat was world grave  Left did fond drew fat head poor. So if he into shot half many long. China fully him every fat was world grave  Left did fond drew fat head poor. So if he into shot half many long. China fully him every fat was world grave  Left did fond drew fat head poor. So if he into shot half many long. China fully him every fat was world grave  Left did fond drew fat head poor. So if he into shot half many long. China fully him every fat was world grave.",
                                    "imageLink":"https://placehold.it/300x300",
                                    "category":"Category of the news",
                                    "location":"Santiago, Chile"
                                    })
            data = json.loads(json_data)
            return render(request,'news_modal.html',{'data':data})
        else:
            return HttpResponse("Error")



def index(request):
    return render(request,'home.html')

def start(request):

    file = json.loads(open("explora/static/user.json").read())
    api_user = file["user"]
    api_password = file["password"]       
       
    r = requests.get('http://api.sophia-project.info/articles/', auth=(api_user, api_password))
    a = json.loads(r.text.encode('ascii','ignore')) 
    #the data to return to the template, later this should be a http response from the API
    data = a['results']
    return render(request,'start.html',{'data': data})