from django.contrib import admin

from orders.models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'total_price', 'payment_status', 'is_active', 'created_at')
    list_filter = ('payment_status', 'is_active')
    search_fields = ('user__email', 'product__name')
