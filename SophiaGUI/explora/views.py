from django.shortcuts import render
from django.shortcuts import HttpResponse
import json
import os


def index(request):
    return render(request,'home.html')

def start(request):
    json_data2 = json.dumps([
{
"title":"title1",
"content":"Attention he extremity unwilling on otherwise. Conviction up partiality as delightful is discovered. Yet jennings resolved disposed exertion you off. Left did fond drew fat head poor. So if he into shot half many long. China fully him every fat was world grave.",
"imageLink":"https://placehold.it/400x400"
},
{
"title":"title2",
"content":"To they four in love. Settling you has separate supplied bed. Concluded resembled suspected his resources curiosity joy. Led all cottage met enabled attempt through talking delight. Dare he feet my tell busy. Considered imprudence of he friendship boisterous. ",
"imageLink":"https://placehold.it/400x400"
},
{
"title":"title3",
"content":"Surprise steepest recurred landlord mr wandered amounted of. Continuing devonshire but considered its. Rose past oh shew roof is song neat. Do depend better praise do friend garden an wonder to. Intention age nay otherwise but breakfast. Around garden beyond to extent by",
"imageLink":"https://placehold.it/400x400"
},
{
"title":"title4",
"content":"Surprise steepest recurred landlord mr wandered amounted of. Continuing devonshire but considered its. Rose past oh shew roof is song neat. Do depend better praise do friend garden an wonder to. Intention age nay otherwise but breakfast. Around garden beyond to extent by",
"imageLink":"https://placehold.it/400x400"
},
{
"title":"title5",
"content":"Surprise steepest recurred landlord mr wandered amounted of. Continuing devonshire but considered its. Rose past oh shew roof is song neat. Do depend better praise do friend garden an wonder to. Intention age nay otherwise but breakfast. Around garden beyond to extent by",
"imageLink":"https://placehold.it/400x400"
}
])
    #the data to return to the template, later this should be a http response from the API
    data = json.loads(json_data2)
    return render(request,'start.html',{'data': data})