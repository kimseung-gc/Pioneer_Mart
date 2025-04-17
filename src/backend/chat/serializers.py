from rest_framework import serializers
from .models import ChatRoom, Message
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "content", "user", "timestamp", "is_read", "read_at"]

    def get_username(self, obj):
        return obj.user.username if obj.user else "Unknown"


class ChatRoomSerializer(serializers.ModelSerializer):
    user1 = UserSerializer(read_only=True)
    user2 = UserSerializer(read_only=True)
    user_count = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()
    item_title = serializers.SerializerMethodField()
    unread_count = serializers.IntegerField(read_only=True, default=0)
    last_message_time = serializers.DateTimeField(read_only=True, allow_null=True)

    class Meta:
        model = ChatRoom
        fields = [
            "id",
            "user1",
            "user2",
            "item_id",
            "item_title",
            "created_at",
            "user_count",
            "message_count",
            "unread_count",
            "last_message_time",
        ]

    def get_user_count(self, obj):
        return 2  # there will always be 2 users in a private room

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_item_title(self, obj):
        from items.models import Listing

        try:
            item = Listing.objects.get(id=obj.item_id)
            return item.title
        except Listing.DoesNotExist:
            return None
