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
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscription_id = serializer.validated_data.get('subscription_id')
        order_id = serializer.validated_data.get('order_id')
        user = request.user

        if order_id:
            try:
                order = Order.objects.get(id=order_id)
            except Order.DoesNotExist:
                return Response({'detail': 'Order not found.'}, status=404)
            if user.role != 'ADMIN' and order.user_id != user.id:
                return Response({'detail': 'Not allowed.'}, status=403)
            Order.objects.filter(id=order_id).update(
                payment_status=Order.PaymentStatus.PAID,
                payment_method=Order.PaymentMethod.CARD,
                payment_reference='demo_payment_' + str(order_id),
                is_active=True,
            )
            return Response({
                'checkout_url': '/dashboard?payment=success',
                'session_id': 'demo_' + str(order_id),
                'message': 'Demo payment successful!'
            })

        if subscription_id:
            try:
                subscription = Subscription.objects.get(id=subscription_id)
            except Subscription.DoesNotExist:
                return Response({'detail': 'Subscription not found.'}, status=404)
            if user.role != 'ADMIN' and subscription.user_id != user.id:
                return Response({'detail': 'Not allowed.'}, status=403)
            Subscription.objects.filter(id=subscription_id).update(
                payment_status=Subscription.PaymentStatus.PAID,
                payment_method=Subscription.PaymentMethod.CARD,
                payment_reference='demo_payment_' + str(subscription_id),
                is_active=True,
            )
            return Response({
                'checkout_url': '/dashboard?payment=success',
                'session_id': 'demo_' + str(subscription_id),
                'message': 'Demo payment successful!'
            })

        return Response({'detail': 'Invalid request.'}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        return Response(status=200)
