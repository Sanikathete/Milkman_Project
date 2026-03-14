from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from accounts.models import CustomUser, Profile, StaffProfile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('phone', 'address', 'city', 'pincode')


class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = ('position', 'salary', 'joining_date')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    profile = ProfileSerializer(required=False)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'password', 'role', 'profile')
        read_only_fields = ('id', 'role')

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        user = CustomUser.objects.create_user(**validated_data)
        profile = user.profile
        for key, value in profile_data.items():
            setattr(profile, key, value)
        profile.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        email = value.strip().lower()
        self.user = CustomUser.objects.filter(email__iexact=email).first()
        return email

    def save(self):
        if not self.user:
            return None
        return {
            'uid': urlsafe_base64_encode(force_bytes(self.user.pk)),
            'token': default_token_generator.make_token(self.user),
        }


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})

        try:
            user_id = force_str(urlsafe_base64_decode(attrs['uid']))
            user = CustomUser.objects.get(pk=user_id)
        except (CustomUser.DoesNotExist, ValueError, TypeError, OverflowError) as exc:
            raise serializers.ValidationError({'uid': 'Invalid password reset link.'}) from exc

        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError({'token': 'Invalid or expired password reset link.'})

        validate_password(attrs['password'], user)
        attrs['user'] = user
        return attrs

    def save(self):
        user = self.validated_data['user']
        user.set_password(self.validated_data['password'])
        user.save(update_fields=['password'])
        return user


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'role', 'is_active', 'date_joined', 'profile')


class StaffListSerializer(serializers.ModelSerializer):
    staff_profile = StaffProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'is_active', 'date_joined', 'staff_profile')


class StaffCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    staff_profile = StaffProfileSerializer(required=False)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'password', 'is_active', 'staff_profile')
        read_only_fields = ('id',)

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        staff_data = validated_data.pop('staff_profile', {})
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(
            password=password,
            role=CustomUser.Role.ADMIN,
            is_staff=True,
            **validated_data,
        )
        staff_profile, _ = StaffProfile.objects.get_or_create(user=user)
        for key, value in staff_data.items():
            setattr(staff_profile, key, value)
        staff_profile.save()
        return user


class StaffUpdateSerializer(serializers.ModelSerializer):
    staff_profile = StaffProfileSerializer(required=False)

    class Meta:
        model = CustomUser
        fields = ('email', 'is_active', 'staff_profile')

    def update(self, instance, validated_data):
        staff_data = validated_data.pop('staff_profile', None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()

        if staff_data is not None:
            staff_profile, _ = StaffProfile.objects.get_or_create(user=instance)
            for key, value in staff_data.items():
                setattr(staff_profile, key, value)
            staff_profile.save()

        return instance


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
