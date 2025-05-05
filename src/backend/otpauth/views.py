# from AUTHKEY.config import EMAIL_HOST_USER
from userprofile.models import UserProfile
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)  # built in view from rest framework simple jwt
from django.core.mail import send_mail
from django.conf import settings
import os
from dotenv import load_dotenv

from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated

# from userprofile.models import UserProfile #TODO: uncomment when we make the userprofile api
# from userprofile.serializers import UserSerializer #TODO: same as above
from .models import OTP
from .serializers import (
    ContactFormSerializer,
    EmailSerializer,
    OTPVerificationSerializer,
    TokenSerializer,
)

# For these 2 classes, first we create an OTP code associated with the user's email
# then we verify the code in the 2nd class by checking if the received code
# matches with the associated email in the request. If it does then we generate a
# a JWT for the user to be able to access all the data


class RequestOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]

            # Create new OTP
            OTP.objects.filter(email=email).delete()
            otp = OTP.objects.create(email=email)
            print(f"\n\n{otp.otp}\n\n")  # TODO: comment this to send email
            # Send email with OTP
            subject = "Your OTP for authentication"
            message = f"Your OTP is {otp.otp}. It will expire in 10 minutes."
            # send_mail(
            #     subject, message, settings.DEFAULT_FROM_EMAIL, [email]
            # )  # TODO: uncomment this to send email

            return Response(
                {"detail": "OTP sent to your email"}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp_code = serializer.validated_data["otp"]

            # get latest OTP for this email
            try:
                otp = OTP.objects.filter(email=email).latest("created_at")

                if otp.otp == otp_code and otp.is_valid():
                    # retrieve the User object associated with the email
                    user, created = User.objects.get_or_create(
                        email=email, defaults={"username": email}
                    )
                    # create the UserProfile if not already created
                    profile, _ = UserProfile.objects.get_or_create(user=user)
                    profile.is_verified = True
                    # TODO: probably don't need this...will need to find a workaround cause what if the user's OTP code expired cause sem's over
                    profile.save()  # this just saves the user's profile

                    # generate JWT token
                    refresh = RefreshToken.for_user(user)

                    # create a dictionary containing the refresh token, access token, and serialized user data
                    # don't really know
                    response_data = {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    }
                    return Response(response_data, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {"detail": "Invalid or expired OTP"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except (OTP.DoesNotExist, User.DoesNotExist):
                return Response(
                    {"detail": "Invalid email or OTP"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(TokenRefreshView):
    permission_classes = [AllowAny]


class ContactFormView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ContactFormSerializer(data=request.data)
        if serializer.is_valid():
            description = serializer.validated_data["description"]
            user_email = serializer.validated_data["user_email"]

            subject = "New contact form from PioneerMart"
            message = f"Message from PioneerMart contact form:\n\nUser: {user_email}\n\n{description}"
            recipient_email = os.getenv("EMAIL_HOST_USER")
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [os.getenv("EMAIL_HOST_USER")],
                    fail_silently=False,
                )
                return Response(
                    {"detail": "Your message has been sent successfully"},
                    status=status.HTTP_200_OK,
                )
            except Exception as e:
                print(f"Error sending email: {str(e)}")
                return Response(
                    {"detail": "Failed to send message. Please try again later."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
