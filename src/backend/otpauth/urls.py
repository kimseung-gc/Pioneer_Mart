from django.urls import path
from .views import RefreshTokenView, RequestOTPView, VerifyOTPView, ContactFormView

urlpatterns = [
    path("request-otp/", RequestOTPView.as_view(), name="request-otp"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("contact", ContactFormView.as_view(), name="contact"),
    path("refresh/", RefreshTokenView.as_view(), name="token-refresh"),
]
