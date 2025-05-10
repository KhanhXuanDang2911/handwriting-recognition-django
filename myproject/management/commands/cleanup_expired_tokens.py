from django.core.management.base import BaseCommand
from myapp.models import BlacklistedToken


class Command(BaseCommand):
    help = 'Cleans up expired blacklisted tokens'

    def handle(self, *args, **options):
        count, _ = BlacklistedToken.cleanup_expired_tokens()
        self.stdout.write(
            self.style.SUCCESS(f'Successfully cleaned up {count} expired tokens')
        )
