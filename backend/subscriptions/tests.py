from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import CustomUser
from catalog.models import Category, Product
from subscriptions.models import Subscription


class SubscriptionAPITests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email='subuser@rajandairy.com',
            password='StrongPass@123',
            role=CustomUser.Role.CUSTOMER,
        )
        self.other_user = CustomUser.objects.create_user(
            email='other@rajandairy.com',
            password='StrongPass@123',
            role=CustomUser.Role.CUSTOMER,
        )
        self.category = Category.objects.create(name='Milk', description='Milk products')
        self.product = Product.objects.create(
            category=self.category,
            name='Cow Milk',
            description='Fresh',
            price=60,
            is_available=True,
        )
        self.url = '/api/subscriptions/'

    def test_create_subscription_pending_and_inactive(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'product': self.product.id,
            'frequency': 'Daily',
            'start_date': str(timezone.localdate() + timedelta(days=1)),
        }

        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        subscription = Subscription.objects.get(id=response.data['id'])
        self.assertEqual(subscription.payment_status, Subscription.PaymentStatus.PENDING)
        self.assertFalse(subscription.is_active)

    def test_duplicate_active_subscription_is_blocked(self):
        Subscription.objects.create(
            user=self.user,
            product=self.product,
            frequency=Subscription.Frequency.DAILY,
            start_date=timezone.localdate() + timedelta(days=1),
            is_active=True,
            payment_status=Subscription.PaymentStatus.PAID,
        )

        self.client.force_authenticate(user=self.user)
        payload = {
            'product': self.product.id,
            'frequency': 'Daily',
            'start_date': str(timezone.localdate() + timedelta(days=2)),
        }

        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_past_start_date_is_rejected(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'product': self.product.id,
            'frequency': 'Weekly',
            'start_date': str(timezone.localdate() - timedelta(days=1)),
        }

        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('start_date', response.data)

    def test_customer_only_sees_own_subscriptions(self):
        own_sub = Subscription.objects.create(
            user=self.user,
            product=self.product,
            frequency=Subscription.Frequency.DAILY,
            start_date=timezone.localdate() + timedelta(days=1),
        )
        Subscription.objects.create(
            user=self.other_user,
            product=self.product,
            frequency=Subscription.Frequency.WEEKLY,
            start_date=timezone.localdate() + timedelta(days=1),
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], own_sub.id)
