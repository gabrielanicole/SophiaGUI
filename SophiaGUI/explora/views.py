from django.http import HttpResponse


def index(request):
    return HttpResponse("Hello world. You're at the Sophia GUI index !!!!!. And we are testing GitHub.")