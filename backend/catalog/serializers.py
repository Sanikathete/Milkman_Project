from rest_framework import serializers

from catalog.models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'created_at')
        read_only_fields = ('id', 'created_at')


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ('id', 'name', 'price', 'image', 'is_available', 'category', 'category_name')


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id',
            'category',
            'name',
            'description',
            'price',
            'image',
            'is_available',
            'created_at',
        )


class AdminProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            'id',
            'category',
            'name',
            'description',
            'price',
            'image',
            'is_available',
            'created_at',
        )
        read_only_fields = ('id', 'created_at')

    def validate_image(self, value):
        if not value:
            return value

        allowed_extensions = ('.jpg', '.jpeg', '.png', '.webp')
        file_name = value.name.lower()
        if not file_name.endswith(allowed_extensions):
            raise serializers.ValidationError('Only JPG, PNG, and WEBP images are allowed.')

        max_size = 5 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError('Image size cannot exceed 5MB.')

        return value
