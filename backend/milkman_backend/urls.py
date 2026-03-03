from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import LoginView, RegisterView, UserDetailAPIView, UserListAPIView
from catalog.views import (
    CategoryDetailAPIView,
    CategoryListCreateAPIView,
    ProductDetailAPIView,
    ProductListCreateAPIView,
)
from orders.views import OrderAdminListAPIView, OrderDetailAPIView, OrderListCreateAPIView
from payments.views import DummyPaymentView
from subscriptions.views import (
    SubscriptionAdminListAPIView,
    SubscriptionDetailAPIView,
    SubscriptionListCreateAPIView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    path('api/categories/', CategoryListCreateAPIView.as_view(), name='category-list-create'),
    path('api/categories/<int:pk>/', CategoryDetailAPIView.as_view(), name='category-detail'),

    path('api/products/', ProductListCreateAPIView.as_view(), name='product-list-create'),
    path('api/products/<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),

    path('api/subscriptions/', SubscriptionListCreateAPIView.as_view(), name='subscription-list-create'),
    path('api/subscriptions/<int:pk>/', SubscriptionDetailAPIView.as_view(), name='subscription-detail'),
    path('api/subscriptions/admin/all/', SubscriptionAdminListAPIView.as_view(), name='subscription-admin-list'),

    path('api/orders/', OrderListCreateAPIView.as_view(), name='order-list-create'),
    path('api/orders/<int:pk>/', OrderDetailAPIView.as_view(), name='order-detail'),
    path('api/orders/admin/all/', OrderAdminListAPIView.as_view(), name='order-admin-list'),

    path('api/users/', UserListAPIView.as_view(), name='user-list'),
    path('api/users/<int:pk>/', UserDetailAPIView.as_view(), name='user-detail'),

    path('api/payment/', DummyPaymentView.as_view(), name='dummy-payment'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
