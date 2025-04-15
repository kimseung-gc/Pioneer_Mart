# serializers.py - User and UserProfile Serializers
# This module defines serializers for exposing user and profile data in API responses.
# UserProfileSerializer exposes additional fields for user metadata.
# UserSerializer combines core user information with embedded profile details.

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserProfile model.
    Includes:
    - is_verified: Boolean field indicating if the user's email/account has been verified.
    """
    class Meta:
        model = UserProfile
        fields = ["is_verified"]

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model with a nested, read-only UserProfileSerializer.
    Fields:
    - id: Unique identifier for the user
    - username: The user's login name (read-only)
    - email: The user's email address
    - profile: Embedded profile data including verification status
    """
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "profile"]
        read_only_fields = ["username"]
