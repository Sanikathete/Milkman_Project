from django.contrib import admin

from subscriptions.models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'frequency', 'is_active', 'payment_status', 'start_date', 'end_date')
    list_filter = ('frequency', 'is_active', 'payment_status')
    search_fields = ('user__email', 'product__name')
