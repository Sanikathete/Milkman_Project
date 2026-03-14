from django.shortcuts import get_object_or_404
from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from subscriptions.models import Subscription
from subscriptions.serializers import SubscriptionCreateSerializer, SubscriptionDetailSerializer


class SubscriptionFilterSerializer(serializers.Serializer):
    payment_status = serializers.ChoiceField(choices=Subscription.PaymentStatus.choices, required=False)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)

    def validate(self, attrs):
        date_from = attrs.get('date_from')
        date_to = attrs.get('date_to')
        if date_from and date_to and date_from > date_to:
            raise serializers.ValidationError({'date_to': 'date_to must be on or after date_from.'})
        return attrs


def apply_subscription_filters(request, queryset):
    serializer = SubscriptionFilterSerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)
    filters = serializer.validated_data

    if 'payment_status' in filters:
        queryset = queryset.filter(payment_status=filters['payment_status'])
    if 'date_from' in filters:
        queryset = queryset.filter(created_at__date__gte=filters['date_from'])
    if 'date_to' in filters:
        queryset = queryset.filter(created_at__date__lte=filters['date_to'])
    return queryset


class SubscriptionListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self, request):
        queryset = Subscription.objects.select_related('user', 'product').all()
        user = request.user
        if user.is_authenticated and getattr(user, 'role', None) == 'ADMIN':
            return apply_subscription_filters(request, queryset)
        return apply_subscription_filters(request, queryset.filter(user=user))

    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = SubscriptionDetailSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SubscriptionCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        subscription = serializer.save()
        return Response(SubscriptionDetailSerializer(subscription).data, status=status.HTTP_201_CREATED)


class SubscriptionDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self, request):
        queryset = Subscription.objects.select_related('user', 'product').all()
        user = request.user
        if user.is_authenticated and getattr(user, 'role', None) == 'ADMIN':
            return queryset
        return queryset.filter(user=user)

    def get_object(self, request, pk):
        return get_object_or_404(self.get_queryset(request), pk=pk)

    def get(self, request, pk):
        subscription = self.get_object(request, pk)
        serializer = SubscriptionDetailSerializer(subscription)
        return Response(serializer.data)

    def patch(self, request, pk):
        subscription = self.get_object(request, pk)
        serializer = SubscriptionCreateSerializer(
            subscription,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(SubscriptionDetailSerializer(subscription).data)


class SubscriptionAdminListAPIView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        queryset = Subscription.objects.select_related('user', 'product').all()
        queryset = apply_subscription_filters(request, queryset)
        serializer = SubscriptionDetailSerializer(queryset, many=True)
        return Response(serializer.data)
