from django.shortcuts import get_object_or_404
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
)  # parse form content + media files
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import UserSerializer, UserProfileSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows users to be viewed.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own profile
        return User.objects.filter(id=self.request.user.id)


@api_view(["POST"])
@permission_classes([AllowAny])  # Allow unauthenticated users to register
def signup(request):
    data = request.data
    email = data.get("email")

    if not email:
        return Response(
            {"error": "The email field is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=email).exists():
        return Response(
            {"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST
        )

    # create the user
    user = User.objects.create_user(username=email[:8], email=email)

    # create the associated UserProfile automatically due to signals
    return Response(
        {"message": "User created successfully"}, status=status.HTTP_201_CREATED
    )
