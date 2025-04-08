from django.test import TestCase
from .models import OTP
from django.db import models
from datetime import datetime, timedelta, timezone
from django.contrib.auth.models import User
from .serializers import EmailSerializer, OTPVerificationSerializer, TokenSerializer

class OTPAuthTestCase (TestCase):
    def setUp(self):
        self.OTP1 = OTP.objects.create(
            email = "grain@grin.edu",
            otp = "566723"
            )
        self.assertTrue(self.OTP1.is_valid())
        self.OTP2 = OTP.objects.create(
            email = "",
            otp = "566723"
            )
        self.assertFalse(self.OTP2.is_valid_email())
    def test_string_version(self):
        self.assertEqual(str(self.OTP1), "OTP for grain@grin.edu")
        self.assertEqual(self.OTP1.otp, "566723")

class OTPAuthSerializerTestCase (TestCase):
    def setUp (self):
        self.OTP1 = OTP.objects.create(
            email = "grain@grin.edu",
            otp = "566723"
            )
        self.serial1 = OTPVerificationSerializer(self.OTP1)
    def test_serial (self):
        print(self.serial1.data)
        self.assertEqual(self.serial1.data, {
            'email': 'grain@grin.edu', 
            'otp': '566723'
            })
    