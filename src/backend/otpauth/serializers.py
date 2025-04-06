from rest_framework import serializers
from django.contrib.auth.models import User

# from userprofile.serializers import UserSerializer #TODO: uncomment when we make userprofile api


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()


class OTPVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class TokenSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    # user = UserSerializer() #TODO: same as above
