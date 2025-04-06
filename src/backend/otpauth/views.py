from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User

# from userprofile.models import UserProfile #TODO: uncomment when we make the userprofile api
# from userprofile.serializers import UserSerializer #TODO: same as above
from .models import OTP
from .serializers import EmailSerializer, OTPVerificationSerializer, TokenSerializer

# For these 2 classes, first we create an OTP code associated with the user's email
# then we verify the code in the 2nd class by checking if the received code
# matches with the associated email in the request. If it does then we generate a
# a JWT for the user to be able to access all the data

# TODO: implement refresh token functionality
# b/c the access token will eventually expire and so to avoid forcing the user to log in again the client
# needs a way to get a new valid access token using the refresh token.
# therefore i need to implement a dedicated endpoint for the refresh token
# (e.g. api/auth/refresh/). The client will then store
# the new access token in local storage replacing the expired one. The refresh endpoint should probably
# go in the views.py file or smth once we migrate to viewsets cause those are a lot easier to deal with.


class RequestOTPView(APIView):
    permission_classes = [AllowAny]

    # TODO: Check if email sent from frontend is valid i.e. however many characters ppl's usernames are
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]

            # Create or get user
            # TODO: This gets the entire user's grinnell email...I need to only get their username
            user, created = User.objects.get_or_create(
                email=email, defaults={"username": email}
            )
            # Create new OTP
            # TODO: we'll likely need to interact with this otp code or something of the sort to let users login
            # TODO: because users aren't gonna keep asking for a code lmao
            otp = OTP.objects.create(email=email)
            print(f"\n\n{otp.otp}\n\n")  # TODO: comment this to send email
            # Send email with OTP
            subject = "Your OTP for authentication"
            message = f"Your OTP is {otp.otp}. It will expire in 10 minutes."
            # send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email]) # TODO: uncomment this to send email

            return Response(
                {"detail": "OTP sent to your email"}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # if settings.DEVELOPMENT_MODE:
        #     try:
        #         user = User.objects.get(id=settings.DEVELOPMENT_USER_ID)
        #     except User.DoesNotExist:
        #         return Response({'error': 'Development user not found'}, status=status.HTTP_404_NOT_FOUND)

        #     refresh = RefreshToken.for_user(user)
        #     return Response({
        #         'refresh': str(refresh),
        #         'access': str(refresh.access_token),
        #     })
        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp_code = serializer.validated_data["otp"]

            # get latest OTP for this email
            try:
                # pretty sure this contains multiple OTP code lol don't know when i wrote thi
                # also idk if I wanna keep this...it seems like extra useless data
                otp = OTP.objects.filter(email=email).latest("created_at")

                if otp.otp == otp_code and otp.is_valid():
                    # retrieve the User object associated with the email
                    user = User.objects.get(email=email)
                    profile = user.profile
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
                        "user": UserSerializer(user).data,
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
