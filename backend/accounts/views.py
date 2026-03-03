from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from accounts.models import CustomUser
from accounts.permissions import IsAdminRole
from accounts.serializers import CustomTokenObtainPairSerializer, RegisterSerializer, UserSerializer


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


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
