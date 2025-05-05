# chat/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

from notifications.models import Notification, NotificationType


class ChatRoom(models.Model):
    user1 = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="chatrooms_as_user1"
    )
    user2 = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="chatrooms_as_user2"
    )
    item_id = models.IntegerField(null=True, blank=True)

    # name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # This is the unique user1, user2, item_id combo that defines each new chat room
        unique_together = ("user1", "user2", "item_id")

    def __str__(self):
        return f"{self.user1.username} & {self.user2.username}"

    def participants(self):
        return [self.user1, self.user2]


class Message(models.Model):
    room = models.ForeignKey(
        ChatRoom, on_delete=models.CASCADE, related_name="messages"
    )  # The chat room
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_messages"
    )  # other user
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="received_messages"
    )  # current user
    content = models.TextField()  # actual message content
    timestamp = models.DateTimeField(auto_now_add=True)  # time the message was sent
    is_read = models.BooleanField(default=False)  # track the read status
    read_at = models.DateTimeField(null=True, blank=True)  # when the message was read

    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username} at {self.timestamp}"

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()

    # create the message notification
    def save(self, *args, **kwargs):
        # first check if the key is null. If yes then notification is new
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # create the actual notification
        if is_new and self.room.item_id:
            Notification.objects.create(
                recipient=self.receiver,
                type=NotificationType.CHAT,
                message=f"{self.sender.username} sent a message about an item you posted",
            )
