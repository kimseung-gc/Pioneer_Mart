from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .models import Notification, NotificationType
from .serializers import NotificationSerializer


class NotificationModelTests(TestCase):
    """Tests for the nOtification model"""

    def setUp(self):
        # first create the test user
        self.user = User.objects.create_user(username="testuser", password="testpass")

        # create a test notification
        self.notification = Notification.objects.create(
            recipient=self.user,
            type=NotificationType.PURCHASE,
            message="Test notification",
            related_item="Test item",
        )

    def test_notification_creation(self):
        """Test that a notification ncan be created"""
        self.assertEqual(self.notification.recipient, self.user)
        self.assertEqual(self.notification.type, NotificationType.PURCHASE)
        self.assertEqual(self.notification.message, "Test notification")
        self.assertEqual(self.notification.related_item, "Test item")
        self.assertFalse(self.notification.is_read)

    def test_notification_string_representation(self):
        """Test the string representation of a notification"""
        expected_string = f"{NotificationType.PURCHASE} notification for testuser"
        self.assertEqual(str(self.notification), expected_string)

    def test_time_display_just_now(self):
        """Test time_display property which should return 'just now' for recent notifications"""
        self.assertEqual(self.notification.time_display, "Just now")

    def test_time_display_minutes(self):
        """Test time_display property returns minutes ago"""
        # notification created 5 minutes ago
        self.notification.created_at = timezone.now() - timedelta(minutes=5)
        self.notification.save()
        self.assertEqual(self.notification.time_display, "5m ago")

        # test a singular minute
        self.notification.created_at = timezone.now() - timedelta(minutes=1)
        self.notification.save()
        self.assertEqual(self.notification.time_display, "1m ago")
