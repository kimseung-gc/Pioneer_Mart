from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    # we'll use the time_display function in the notification model to return time
    time = serializers.CharField(source="time_display", read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "type", "message", "time", "is_read", "related_item"]
