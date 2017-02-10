from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType

class Command(BaseCommand):
    help = 'Closes the specified poll for voting'

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        try:
            group, created = Group.objects.get_or_create(name='Analistas')
            content_type = ContentType.objects.get(app_label='explora', model='analist')
            permission = Permission.objects.create(codename='isAnalist',
                                                   name='Is Analist',
                                                    content_type=content_type)
            group = Group.objects.get(name='Analistas')
            group.permissions.add(permission)
            print "Group and permissions created successfully"
        except Exception as e:
            print e