from django.core.management.base import BaseCommand

from accounts.models import CustomUser


class Command(BaseCommand):
    help = 'Create a default admin user for local development.'

    def add_arguments(self, parser):
        parser.add_argument('--email', default='admin', help='Admin username/email (default: admin)')
        parser.add_argument(
            '--password',
            default='admin123456',
            help='Admin password (default: admin123456)',
        )

    def handle(self, *args, **options):
        email = (options.get('email') or 'admin').strip().lower()
        password = options.get('password') or 'admin123456'

        if CustomUser.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Admin "{email}" already exists.'))
            return

        user = CustomUser.objects.create_superuser(email=email, password=password)
        user.is_active = True
        user.is_staff = True
        user.save(update_fields=['is_active', 'is_staff'])

        self.stdout.write(self.style.SUCCESS(f'Created admin "{email}".'))
