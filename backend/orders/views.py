from django.shortcuts import get_object_or_404
from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from orders.models import Order
from orders.serializers import OrderCreateSerializer, OrderDetailSerializer


class OrderFilterSerializer(serializers.Serializer):
    payment_status = serializers.ChoiceField(choices=Order.PaymentStatus.choices, required=False)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)

    def validate(self, attrs):
        date_from = attrs.get('date_from')
        date_to = attrs.get('date_to')
        if date_from and date_to and date_from > date_to:
            raise serializers.ValidationError({'date_to': 'date_to must be on or after date_from.'})
        return attrs


def apply_order_filters(request, queryset):
    serializer = OrderFilterSerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)
    filters = serializer.validated_data

    if 'payment_status' in filters:
        queryset = queryset.filter(payment_status=filters['payment_status'])
    if 'date_from' in filters:
        queryset = queryset.filter(created_at__date__gte=filters['date_from'])
    if 'date_to' in filters:
        queryset = queryset.filter(created_at__date__lte=filters['date_to'])
    return queryset


class OrderListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self, request):
        queryset = Order.objects.select_related('user', 'product').all()
        user = request.user
        if user.is_authenticated and getattr(user, 'role', None) == 'ADMIN':
            return apply_order_filters(request, queryset)
        return apply_order_filters(request, queryset.filter(user=user))

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
        queryset = apply_order_filters(request, queryset)
        serializer = OrderDetailSerializer(queryset, many=True)
        return Response(serializer.data)
