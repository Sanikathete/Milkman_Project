from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import CustomUser


class CatalogPermissionTests(APITestCase):
    def test_customer_cannot_create_category(self):
        user = CustomUser.objects.create_user(
            email='customer-catalog@rajandairy.com',
            password='StrongPass@123',
            role=CustomUser.Role.CUSTOMER,
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(
            '/api/categories/',
            {'name': 'Unauthorized Category', 'description': 'Should fail'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
