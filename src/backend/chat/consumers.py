import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatRoom, Message
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_{self.room_id}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data["message"]
        sender_id = data["user_id"]
        receiver_id = data["receiver_id"]

        # Save message to database w/ is_read=False for unread_messages stuff
        message_obj = await self.save_message(sender_id, receiver_id, message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "user_id": sender_id,
                "receiver_id": receiver_id,
                "username": await self.get_username(sender_id),
                "timestamp": (
                    message_obj.timestamp.isoformat()
                    if message_obj
                    else timezone.now().isoformat()
                ),
            },
        )

    # Receive message from room group
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "message": event["message"],
                    "user_id": event["user_id"],
                    "receiver_id": event["receiver_id"],
                    "username": event["username"],
                    "timestamp": event.get("timestamp"),
                }
            )
        )

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, message):
        room = ChatRoom.objects.get(id=int(self.room_id))
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)
        # create message with is_read=False by defualt
        return Message.objects.create(
            room=room, sender=sender, receiver=receiver, content=message, is_read=False
        )

    @database_sync_to_async
    def get_username(self, user_id):
        return User.objects.get(id=user_id).username
