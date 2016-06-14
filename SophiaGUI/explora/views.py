from django.shortcuts import render
from django.shortcuts import HttpResponse

def index(request):
    return render(request,'explora/home.html')

def login(request):
    return render(request,'explora/login.html')