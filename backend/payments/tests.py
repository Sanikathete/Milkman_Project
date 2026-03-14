from datetime import timedelta
from unittest.mock import Mock, patch

import stripe
from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import CustomUser
from catalog.models import Category, Product
from orders.models import Order
from subscriptions.models import Subscription


class StripePaymentTests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email='payuser@rajandairy.com',
            password='StrongPass@123',
            role=CustomUser.Role.CUSTOMER,
        )
        self.admin = CustomUser.objects.create_user(
            email='admin@rajandairy.com',
            password='StrongPass@123',
            role=CustomUser.Role.ADMIN,
            is_staff=True,
        )

        self.category = Category.objects.create(name='Fresh Dairy', description='Fresh dairy products')
        self.product = Product.objects.create(
            category=self.category,
            name='Curd (Dahi)',
            description='Fresh curd',
            price=45,
            is_available=True,
        )

        self.order = Order.objects.create(
            user=self.user,
            product=self.product,
            quantity=2,
            total_price=90,
            payment_status=Order.PaymentStatus.PENDING,
            is_active=False,
        )

        self.subscription = Subscription.objects.create(
            user=self.user,
            product=self.product,
            frequency=Subscription.Frequency.DAILY,
            start_date=timezone.localdate() + timedelta(days=1),
            payment_status=Subscription.PaymentStatus.PENDING,
            is_active=False,
        )

    @override_settings(
        STRIPE_SECRET_KEY='sk_test',
        STRIPE_CURRENCY='inr',
        STRIPE_SUCCESS_URL='http://example.com/success',
        STRIPE_CANCEL_URL='http://example.com/cancel',
    )
    @patch('payments.views.stripe.checkout.Session.create')
    def test_checkout_creates_session_for_order(self, mock_create):
        mock_create.return_value = Mock(id='sess_123', url='http://checkout')
        self.client.force_authenticate(user=self.user)

        response = self.client.post('/api/payment/', {'order_id': self.order.id}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['checkout_url'], 'http://checkout')
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_reference, 'sess_123')
        self.assertEqual(self.order.payment_method, Order.PaymentMethod.CARD)

    @override_settings(STRIPE_WEBHOOK_SECRET='whsec_test')
    @patch('payments.views.stripe.Webhook.construct_event')
    def test_webhook_marks_order_paid(self, mock_construct_event):
        mock_construct_event.return_value = {
            'type': 'checkout.session.completed',
            'data': {
                'object': {
                    'metadata': {'type': 'order', 'order_id': str(self.order.id)},
                    'payment_intent': 'pi_123',
                    'id': 'sess_123',
                }
            },
        }

        response = self.client.post(
            '/api/payment/webhook/',
            data='{}',
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE='sig',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, Order.PaymentStatus.PAID)
        self.assertEqual(self.order.payment_reference, 'pi_123')

    @override_settings(STRIPE_WEBHOOK_SECRET='whsec_test')
    @patch('payments.views.stripe.Webhook.construct_event')
    def test_webhook_invalid_signature(self, mock_construct_event):
        mock_construct_event.side_effect = stripe.error.SignatureVerificationError('bad', 'sig')

        response = self.client.post(
            '/api/payment/webhook/',
            data='{}',
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE='sig',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)