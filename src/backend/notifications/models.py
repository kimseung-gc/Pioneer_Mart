from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class NotificationType(models.TextChoices):
    PURCHASE = "purchase", "Purchase Request"
    CHAT = "chat", "Chat Message"


class Notification(models.Model):
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    type = models.CharField(
        max_length=20, choices=NotificationType.choices
    )  # mentioned in class NotificationType
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)
    related_item = models.CharField(
        max_length=100, null=True, blank=True
    )  # item that this notification is about

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.type} notification for {self.recipient.username}"

    @property
    def time_display(self):
        """
        Returns a human-readable time difference
        """
        now = timezone.now()
        diff = now - self.created_at

        if diff.days > 0:
            # check if 1 day specifically
            if diff.days == 1:
                return "1d ago"
            # otherwise however many days ago
            return f"{diff.days}d ago"
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            if hours == 1:
                return "1h ago"
            return f"{hours}h ago"
        elif diff.seconds >= 60:
            minutes = diff.seconds // 60
            if minutes == 1:
                return "1m ago"
            return f"{minutes}m ago"
        else:
            return "Just now"
