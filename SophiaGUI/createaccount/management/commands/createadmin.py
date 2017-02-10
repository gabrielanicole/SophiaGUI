from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType

class Command(BaseCommand):
    help = 'Create a nice admin'

    def add_arguments(self, parser):
        parser.add_argument('username', nargs='+', type=str)

    def handle(self, *args, **options):
        for username in options['username']:
            try:
                user = User.objects.get(username=username)
                user.is_superuser = True
                user.is_staff = True
                user.save()
                print user.get_full_name()+ " is now an Admin"
            except Exception as e:
                print e
                print "User doesn't exist"