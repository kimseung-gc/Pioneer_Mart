from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import UserProfile
from .serializers import UserSerializer


class UserProfileModelTest(TestCase):
    def test_profile_created_with_user(self):
        user = User.objects.create_user(username="tester", email="tester@test.com", password="pass")
        self.assertTrue(UserProfile.objects.filter(user=user).exists())

    def test_profile_str_method(self):
        user = User.objects.create_user(username="john", email="john@test.com")
        profile = user.profile
        self.assertEqual(str(profile), "john@test.com's profile")


class UserProfileAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="tester", email="tester@test.com", password="pass")
        self.client.force_authenticate(user=self.user)

    def test_get_user_profile(self):
        response = self.client.get(reverse("user-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["email"], "tester@test.com")
        self.assertIn("profile", response.data[0])

    def test_signup_success(self):
        self.client.logout()
        response = self.client.post(reverse("signup"), {"email": "newuser@test.com"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="newuser@test.com").exists())

    def test_signup_missing_email(self):
        self.client.logout()
        response = self.client.post(reverse("signup"), {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "The email field is required")

    def test_signup_duplicate_email(self):
        self.client.logout()
        response = self.client.post(reverse("signup"), {"email": "tester@test.com"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "User already exists")


class UserSerializerTest(TestCase):
    def test_user_serializer_output(self):
        user = User.objects.create_user(username="alice", email="alice@test.com")
        serializer = UserSerializer(user)
        self.assertEqual(serializer.data["email"], "alice@test.com")
        self.assertIn("profile", serializer.data)
