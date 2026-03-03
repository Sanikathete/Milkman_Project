from rest_framework import serializers

from orders.models import Order


class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = (
            'id',
            'product',
            'quantity',
            'total_price',
            'payment_status',
            'payment_method',
            'payment_reference',
            'is_active',
            'created_at',
        )
        read_only_fields = (
            'id',
            'total_price',
            'payment_status',
            'payment_method',
            'payment_reference',
            'is_active',
            'created_at',
        )

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError('Quantity must be at least 1.')
        return value

    def validate(self, attrs):
        if not attrs['product'].is_available:
            raise serializers.ValidationError({'product': 'This product is currently unavailable.'})
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        product = validated_data['product']
        quantity = validated_data['quantity']
        total_price = product.price * quantity
        return Order.objects.create(user=user, total_price=total_price, **validated_data)


class OrderDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id',
            'user',
            'user_email',
            'product',
            'product_name',
            'quantity',
            'total_price',
            'payment_status',
            'payment_method',
            'payment_reference',
            'is_active',
            'created_at',
        )
        read_only_fields = fields
