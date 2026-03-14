import logging

from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from accounts.models import CustomUser
from accounts.permissions import IsAdminRole
from accounts.serializers import (
    CustomTokenObtainPairSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    StaffCreateSerializer,
    StaffListSerializer,
    StaffUpdateSerializer,
    UserSerializer,
)


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_data = serializer.save()
        if reset_data:
            reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={reset_data['uid']}&token={reset_data['token']}"
            try:
                send_mail(
                    subject='Milkman Password Reset',
                    message=(
                        'We received a password reset request for your account. '
                        f'Use this link to set a new password: {reset_link}'
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[serializer.user.email],
                    fail_silently=True,
                )
            except Exception:  # pragma: no cover - defensive
                logging.exception('Failed to send password reset email.')
        return Response(
            {
                'detail': 'If an account exists for this email, a password reset link will be sent.',
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'detail': 'Password updated successfully. You can now log in.'},
            status=status.HTTP_200_OK,
        )


class UserListAPIView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        users = CustomUser.objects.select_related('profile').all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UserDetailAPIView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request, pk):
        user = get_object_or_404(CustomUser.objects.select_related('profile'), pk=pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)


class StaffListAPIView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        staff_qs = CustomUser.objects.select_related('staff_profile').filter(role=CustomUser.Role.ADMIN)
        serializer = StaffListSerializer(staff_qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = StaffCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff_member = serializer.save()
        return Response(StaffListSerializer(staff_member).data, status=status.HTTP_201_CREATED)


class StaffDetailAPIView(APIView):
    permission_classes = [IsAdminRole]

    def get_object(self, pk):
        return get_object_or_404(
            CustomUser.objects.select_related('staff_profile'),
            pk=pk,
            role=CustomUser.Role.ADMIN,
        )

    def get(self, request, pk):
        staff_member = self.get_object(pk)
        serializer = StaffListSerializer(staff_member)
        return Response(serializer.data)

    def patch(self, request, pk):
        staff_member = self.get_object(pk)
        serializer = StaffUpdateSerializer(staff_member, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        refreshed = self.get_object(pk)
        return Response(StaffListSerializer(refreshed).data)

    def delete(self, request, pk):
        staff_member = self.get_object(pk)
        staff_member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
