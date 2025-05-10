from django.contrib import admin
from .models import User, History, BlacklistedToken

admin.site.register(User)
admin.site.register(History)
@admin.register(BlacklistedToken)
class BlacklistedTokenAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'blacklisted_at', 'expires_at', 'reason')
    list_filter = ('blacklisted_at', 'expires_at')
    search_fields = ('user__username', 'reason')
    date_hierarchy = 'blacklisted_at'
    readonly_fields = ('blacklisted_at',)
