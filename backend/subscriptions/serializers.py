from django.utils import timezone
from rest_framework import serializers

from subscriptions.models import Subscription


class SubscriptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = (
            'id',
            'product',
            'frequency',
            'start_date',
            'end_date',
            'is_active',
            'payment_status',
            'payment_method',
            'payment_reference',
            'created_at',
        )
        read_only_fields = (
            'id',
            'is_active',
            'payment_status',
            'payment_method',
            'payment_reference',
            'created_at',
        )

    def validate(self, attrs):
        request = self.context['request']
        user = request.user
        instance = getattr(self, 'instance', None)

        start_date = attrs.get('start_date', instance.start_date if instance else None)
        end_date = attrs.get('end_date', instance.end_date if instance else None)
        product = attrs.get('product', instance.product if instance else None)

        if not start_date or not product:
            raise serializers.ValidationError('Product and start date are required.')

        if start_date < timezone.localdate():
            raise serializers.ValidationError({'start_date': 'Start date cannot be in the past.'})

        if end_date and end_date < start_date:
            raise serializers.ValidationError({'end_date': 'End date must be on or after start date.'})

        active_qs = Subscription.objects.filter(user=user, product=product, is_active=True)
        if instance:
            active_qs = active_qs.exclude(id=instance.id)
        if active_qs.exists():
            raise serializers.ValidationError('You already have an active subscription for this product.')

        if not product.is_available:
            raise serializers.ValidationError({'product': 'This product is currently unavailable.'})

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        return Subscription.objects.create(user=user, **validated_data)


class SubscriptionDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Subscription
        fields = (
            'id',
            'user',
            'user_email',
            'product',
            'product_name',
            'frequency',
            'start_date',
            'end_date',
            'is_active',
            'payment_status',
            'payment_method',
            'payment_reference',
            'created_at',
        )
        read_only_fields = fields
