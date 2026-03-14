import stripe
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from subscriptions.models import Subscription


class StripeCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    class InputSerializer(serializers.Serializer):
        subscription_id = serializers.IntegerField(required=False)
        order_id = serializers.IntegerField(required=False)

        def validate(self, attrs):
            if not attrs.get('subscription_id') and not attrs.get('order_id'):
                raise serializers.ValidationError('Either subscription_id or order_id is required.')
            if attrs.get('subscription_id') and attrs.get('order_id'):
                raise serializers.ValidationError('Send only one of subscription_id or order_id.')
            return attrs

    def post(self, request):
        if not settings.STRIPE_SECRET_KEY:
            return Response({'detail': 'Stripe is not configured.'}, status=500)

        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        subscription_id = serializer.validated_data.get('subscription_id')
        order_id = serializer.validated_data.get('order_id')
        user = request.user

        stripe.api_key = settings.STRIPE_SECRET_KEY
        currency = settings.STRIPE_CURRENCY

        if subscription_id:
            try:
                subscription = Subscription.objects.select_related('user', 'product').get(id=subscription_id)
            except Subscription.DoesNotExist:
                return Response({'detail': 'Subscription not found.'}, status=404)

            if user.role != 'ADMIN' and subscription.user_id != user.id:
                return Response({'detail': 'You are not allowed to pay this subscription.'}, status=403)

            amount = int(subscription.product.price * 100)
            description = f'Subscription for {subscription.product.name}'
            metadata = {
                'type': 'subscription',
                'subscription_id': str(subscription.id),
                'user_id': str(user.id),
            }
            reference_target = subscription
        else:
            try:
                order = Order.objects.select_related('user', 'product').get(id=order_id)
            except Order.DoesNotExist:
                return Response({'detail': 'Order not found.'}, status=404)

            if user.role != 'ADMIN' and order.user_id != user.id:
                return Response({'detail': 'You are not allowed to pay this order.'}, status=403)

            amount = int(order.total_price * 100)
            description = f'Order for {order.product.name}'
            metadata = {
                'type': 'order',
                'order_id': str(order.id),
                'user_id': str(user.id),
            }
            reference_target = order

        session = stripe.checkout.Session.create(
            mode='payment',
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': currency,
                        'product_data': {'name': description},
                        'unit_amount': amount,
                    },
                    'quantity': 1,
                }
            ],
            success_url=settings.STRIPE_SUCCESS_URL,
            cancel_url=settings.STRIPE_CANCEL_URL,
            metadata=metadata,
        )

        reference_target.payment_reference = session.id
        reference_target.payment_method = Order.PaymentMethod.CARD if isinstance(reference_target, Order) else Subscription.PaymentMethod.CARD
        reference_target.save(update_fields=['payment_reference', 'payment_method'])

        return Response({'checkout_url': session.url, 'session_id': session.id})


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        if not settings.STRIPE_WEBHOOK_SECRET:
            return Response({'detail': 'Stripe webhook is not configured.'}, status=500)

        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
        except ValueError:
            return Response(status=400)
        except stripe.error.SignatureVerificationError:
            return Response(status=400)

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            metadata = session.get('metadata', {})
            payment_intent = session.get('payment_intent')
            payment_reference = payment_intent or session.get('id')
            if metadata.get('type') == 'order':
                order_id = metadata.get('order_id')
                if order_id:
                    Order.objects.filter(id=order_id).update(
                        payment_status=Order.PaymentStatus.PAID,
                        payment_method=Order.PaymentMethod.CARD,
                        payment_reference=payment_reference,
                        is_active=True,
                    )
            elif metadata.get('type') == 'subscription':
                subscription_id = metadata.get('subscription_id')
                if subscription_id:
                    Subscription.objects.filter(id=subscription_id).update(
                        payment_status=Subscription.PaymentStatus.PAID,
                        payment_method=Subscription.PaymentMethod.CARD,
                        payment_reference=payment_reference,
                        is_active=True,
                    )

        return Response(status=200)
