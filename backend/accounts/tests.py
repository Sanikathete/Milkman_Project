from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import override_settings
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
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

    def test_forgot_password_returns_reset_token_data(self):
        user = CustomUser.objects.create_user(
            email='customer4@rajandairy.com',
            password='StrongPass@123',
            role=CustomUser.Role.CUSTOMER,
        )

        with override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'):
            response = self.client.post(
                reverse('forgot-password'),
                {'email': user.email},
                format='json',
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('detail', response.data)
        self.assertEqual(len(mail.outbox), 1)

    def test_reset_password_updates_password(self):
        user = CustomUser.objects.create_user(
            email='customer5@rajandairy.com',
            password='StrongPass@123',
            role=CustomUser.Role.CUSTOMER,
        )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = self.client.post(
            reverse('reset-password'),
            {
                'uid': uid,
                'token': token,
                'password': 'NewStrongPass@123',
                'confirm_password': 'NewStrongPass@123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password('NewStrongPass@123'))

    def test_admin_can_manage_staff(self):
        admin = CustomUser.objects.create_user(
            email='staffadmin@rajandairy.com',
            password='StrongPass@123',
            role=CustomUser.Role.ADMIN,
            is_staff=True,
        )
        self.client.force_authenticate(user=admin)

        create_response = self.client.post(
            reverse('staff-list'),
            {
                'email': 'staff1@rajandairy.com',
                'password': 'StrongPass@123',
                'is_active': True,
                'staff_profile': {
                    'position': 'Manager',
                    'salary': '55000.00',
                    'joining_date': '2025-01-05',
                },
            },
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        staff_id = create_response.data['id']

        update_response = self.client.patch(
            reverse('staff-detail', kwargs={'pk': staff_id}),
            {
                'staff_profile': {
                    'position': 'Senior Manager',
                    'salary': '62000.00',
                }
            },
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['staff_profile']['position'], 'Senior Manager')

        delete_response = self.client.delete(reverse('staff-detail', kwargs={'pk': staff_id}))
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_customer_cannot_access_staff_endpoints(self):
        customer = CustomUser.objects.create_user(
            email='custstaff@rajandairy.com',
            password='StrongPass@123',
            role=CustomUser.Role.CUSTOMER,
        )
        self.client.force_authenticate(user=customer)

        response = self.client.get(reverse('staff-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
