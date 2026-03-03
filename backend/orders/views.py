from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from orders.models import Order
from orders.serializers import OrderCreateSerializer, OrderDetailSerializer


class OrderListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def apply_filters(self, request, queryset):
        payment_status = request.query_params.get('payment_status')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        return queryset

    def get_queryset(self, request):
        queryset = Order.objects.select_related('user', 'product').all()
        user = request.user
        if user.is_authenticated and getattr(user, 'role', None) == 'ADMIN':
            return self.apply_filters(request, queryset)
        return self.apply_filters(request, queryset.filter(user=user))

    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = OrderDetailSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self, request):
        queryset = Order.objects.select_related('user', 'product').all()
        user = request.user
        if user.is_authenticated and getattr(user, 'role', None) == 'ADMIN':
            return queryset
        return queryset.filter(user=user)

    def get_object(self, request, pk):
        return get_object_or_404(self.get_queryset(request), pk=pk)

    def get(self, request, pk):
        order = self.get_object(request, pk)
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data)


class OrderAdminListAPIView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        queryset = Order.objects.select_related('user', 'product').all()
        payment_status = request.query_params.get('payment_status')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        serializer = OrderDetailSerializer(queryset, many=True)
        return Response(serializer.data)
