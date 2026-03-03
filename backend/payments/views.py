from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from subscriptions.models import Subscription


class DummyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    class InputSerializer(serializers.Serializer):
        subscription_id = serializers.IntegerField(required=False)
        order_id = serializers.IntegerField(required=False)
        payment_method = serializers.ChoiceField(choices=['Card', 'UPI', 'NetBanking', 'COD'])
        details = serializers.DictField(required=False)

        def validate(self, attrs):
            if not attrs.get('subscription_id') and not attrs.get('order_id'):
                raise serializers.ValidationError('Either subscription_id or order_id is required.')
            if attrs.get('subscription_id') and attrs.get('order_id'):
                raise serializers.ValidationError('Send only one of subscription_id or order_id.')

            method = attrs.get('payment_method')
            details = attrs.get('details', {})

            if method == 'Card':
                required = ['card_holder', 'card_last4', 'expiry']
            elif method == 'UPI':
                required = ['upi_id', 'txn_ref']
            elif method == 'NetBanking':
                required = ['bank_name', 'txn_ref']
            else:
                required = []

            missing = [field for field in required if not details.get(field)]
            if missing:
                raise serializers.ValidationError({'details': f'Missing fields for {method}: {", ".join(missing)}'})

            return attrs

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        subscription_id = serializer.validated_data.get('subscription_id')
        order_id = serializer.validated_data.get('order_id')
        payment_method = serializer.validated_data['payment_method']
        details = serializer.validated_data.get('details', {})
        user = request.user

        if payment_method in ('UPI', 'NetBanking'):
            reference = details.get('txn_ref', '')
        elif payment_method == 'Card':
            reference = f"CARD-{details.get('card_last4', '')}"
        else:
            reference = 'COD'

        if subscription_id:
            try:
                subscription = Subscription.objects.select_related('user').get(id=subscription_id)
            except Subscription.DoesNotExist:
                return Response({'detail': 'Subscription not found.'}, status=404)

            if user.role != 'ADMIN' and subscription.user_id != user.id:
                return Response({'detail': 'You are not allowed to pay this subscription.'}, status=403)

            subscription.payment_status = Subscription.PaymentStatus.PAID
            subscription.payment_method = payment_method
            subscription.payment_reference = reference
            subscription.is_active = True
            subscription.save(update_fields=['payment_status', 'payment_method', 'payment_reference', 'is_active'])

            return Response(
                {
                    'message': 'Subscription payment successful.',
                    'type': 'subscription',
                    'subscription_id': subscription.id,
                    'payment_status': subscription.payment_status,
                    'payment_method': subscription.payment_method,
                    'payment_reference': subscription.payment_reference,
                    'is_active': subscription.is_active,
                },
                status=200,
            )

        try:
            order = Order.objects.select_related('user').get(id=order_id)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=404)

        if user.role != 'ADMIN' and order.user_id != user.id:
            return Response({'detail': 'You are not allowed to pay this order.'}, status=403)

        order.payment_status = Order.PaymentStatus.PAID
        order.payment_method = payment_method
        order.payment_reference = reference
        order.is_active = True
        order.save(update_fields=['payment_status', 'payment_method', 'payment_reference', 'is_active'])

        return Response(
            {
                'message': 'Order payment successful.',
                'type': 'order',
                'order_id': order.id,
                'payment_status': order.payment_status,
                'payment_method': order.payment_method,
                'payment_reference': order.payment_reference,
                'is_active': order.is_active,
            },
            status=200,
        )
