from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import CustomUser
from catalog.models import Category, Product
from subscriptions.models import Subscription


class PaymentAPITests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email='payuser@rajandairy.com',
            password='StrongPass@123',
            role=CustomUser.Role.CUSTOMER,
        )
        self.other_user = CustomUser.objects.create_user(
            email='payother@rajandairy.com',
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

        self.subscription = Subscription.objects.create(
            user=self.user,
            product=self.product,
            frequency=Subscription.Frequency.DAILY,
            start_date=timezone.localdate() + timedelta(days=1),
            payment_status=Subscription.PaymentStatus.PENDING,
            is_active=False,
        )
        self.url = '/api/payment/'

    def test_owner_can_pay_and_activate_subscription(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.url,
            {
                'subscription_id': self.subscription.id,
                'payment_method': 'Card',
                'details': {
                    'card_holder': 'Test User',
                    'card_last4': '4242',
                    'expiry': '12/30',
                },
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.subscription.refresh_from_db()
        self.assertEqual(self.subscription.payment_status, Subscription.PaymentStatus.PAID)
        self.assertTrue(self.subscription.is_active)

    def test_other_customer_cannot_pay_subscription(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(
            self.url,
            {
                'subscription_id': self.subscription.id,
                'payment_method': 'UPI',
                'details': {
                    'upi_id': 'test@upi',
                    'txn_ref': 'TXN-1234',
                },
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_pay_any_subscription(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            self.url,
            {
                'subscription_id': self.subscription.id,
                'payment_method': 'NetBanking',
                'details': {
                    'bank_name': 'SBI',
                    'txn_ref': 'NB-7788',
                },
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
