from models import Profile

def save_profile(backend, user, response, *args, **kwargs):
    try:
        profile = Profile.objects.get(user=user.pk)
    except Profile.DoesNotExist:
        profile = Profile(user=user)
        profile.save()