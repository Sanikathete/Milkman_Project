from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import CustomUser


class AuthAPITests(APITestCase):
    def test_register_customer_creates_profile(self):
        url = reverse('register')
        payload = {
            'email': 'customer1@rajandairy.com',
            'password': 'StrongPass@123',
            'profile': {
                'phone': '9876543210',
                'address': 'Market Road',
                'city': 'Sangamner',
                'pincode': '422605',
            },
        }

        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = CustomUser.objects.get(email=payload['email'])
        self.assertEqual(user.role, CustomUser.Role.CUSTOMER)
        self.assertEqual(user.profile.city, 'Sangamner')

    def test_login_returns_tokens_and_user(self):
        CustomUser.objects.create_user(
            email='customer2@rajandairy.com',
            password='StrongPass@123',
            role=CustomUser.Role.CUSTOMER,
        )

        response = self.client.post(
            reverse('login'),
            {'email': 'customer2@rajandairy.com', 'password': 'StrongPass@123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'customer2@rajandairy.com')

    def test_refresh_returns_new_access_token(self):
        user = CustomUser.objects.create_user(
            email='customer3@rajandairy.com',
            password='StrongPass@123',
            role=CustomUser.Role.CUSTOMER,
        )

        login_response = self.client.post(
            reverse('login'),
            {'email': user.email, 'password': 'StrongPass@123'},
            format='json',
        )

        response = self.client.post(
            reverse('token-refresh'),
            {'refresh': login_response.data['refresh']},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
