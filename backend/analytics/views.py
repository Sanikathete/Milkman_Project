from django.conf import settings
from django.core.cache import cache
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth, TruncYear
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from orders.models import Order
from subscriptions.models import Subscription


class AnalyticsAPIView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        cache_key = 'analytics:summary'
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        paid_orders = Order.objects.filter(payment_status=Order.PaymentStatus.PAID)

        monthly = (
            paid_orders.annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total=Sum('total_price'))
            .order_by('month')
        )
        yearly = (
            paid_orders.annotate(year=TruncYear('created_at'))
            .values('year')
            .annotate(total=Sum('total_price'))
            .order_by('year')
        )

        product_sales = (
            paid_orders.values('product__name')
            .annotate(total_revenue=Sum('total_price'), total_quantity=Sum('quantity'))
            .order_by('-total_revenue')
        )

        most_sold = (
            paid_orders.values('product__name')
            .annotate(total_quantity=Sum('quantity'))
            .order_by('-total_quantity')
            .first()
        )

        active_subscriptions = Subscription.objects.filter(is_active=True)
        subscriptions_by_product = (
            active_subscriptions.values('product__name')
            .annotate(total=Count('id'))
            .order_by('-total')
        )
        most_subscribed = subscriptions_by_product.first()

        response = {
            'monthly_revenue': [
                {
                    'month': item['month'].strftime('%Y-%m'),
                    'total_revenue': float(item['total'] or 0),
                }
                for item in monthly
            ],
            'yearly_revenue': [
                {
                    'year': item['year'].strftime('%Y'),
                    'total_revenue': float(item['total'] or 0),
                }
                for item in yearly
            ],
            'most_sold_item': {
                'product': most_sold['product__name'],
                'total_quantity': int(most_sold['total_quantity']),
            }
            if most_sold
            else None,
            'most_subscribed_product': {
                'product': most_subscribed['product__name'],
                'total_subscriptions': int(most_subscribed['total']),
            }
            if most_subscribed
            else None,
            'subscriptions_by_product': [
                {
                    'product': item['product__name'],
                    'total_subscriptions': int(item['total']),
                }
                for item in subscriptions_by_product
            ],
            'product_sales': [
                {
                    'product': item['product__name'],
                    'total_revenue': float(item['total_revenue'] or 0),
                }
                for item in product_sales
            ],
            'total_sales_per_product': [
                {
                    'product': item['product__name'],
                    'total_quantity': int(item['total_quantity'] or 0),
                }
                for item in product_sales
            ],
        }

        cache.set(cache_key, response, getattr(settings, 'ANALYTICS_CACHE_SECONDS', 300))
        return Response(response)


class RevenueAPIView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        cache_key = 'analytics:revenue'
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        paid_orders = Order.objects.filter(payment_status=Order.PaymentStatus.PAID)
        product_sales = (
            paid_orders.values('product__name')
            .annotate(total_revenue=Sum('total_price'), total_quantity=Sum('quantity'))
            .order_by('product__name')
        )

        response = [
            {
                'item': item['product__name'],
                'total_quantity_sold': int(item['total_quantity'] or 0),
                'total_purchase': float(item['total_revenue'] or 0),
                'total_revenue': float(item['total_revenue'] or 0),
            }
            for item in product_sales
        ]

        cache.set(cache_key, response, getattr(settings, 'ANALYTICS_CACHE_SECONDS', 300))
        return Response(response)
