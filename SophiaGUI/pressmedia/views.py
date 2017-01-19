from django.shortcuts import render
from django.shortcuts import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

# Create your views here.
@login_required(login_url='/login_required')
def pressMedia(request):
    my_user = request.user.social_auth.filter(provider='facebook').first()
    if my_user:
        url = u'https://graph.facebook.com/{0}/picture'.format(my_user.uid)
        return render(request, 'pressmedia.html', {'user': request.user.get_full_name(), 'profile_pic': url
                                               })
    else:
        return render(request, 'pressmedia.html', {'user': request.user.get_full_name()
                                               })