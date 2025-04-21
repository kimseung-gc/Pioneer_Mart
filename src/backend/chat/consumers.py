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
        user_id = data["user_id"]

        # Save message to database w/ is_read=False for unread_messages stuff
        message_obj = await self.save_message(user_id, message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "user_id": user_id,
                "username": await self.get_username(user_id),
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
                    "username": event["username"],
                    "timestamp": event.get("timestamp"),
                }
            )
        )

    @database_sync_to_async
    def save_message(self, user_id, message):
        print(f"room_id received: {self.room_id} (type={type(self.room_id)})")
        try:
            room = ChatRoom.objects.get(id=int(self.room_id))
        except ChatRoom.DoesNotExist:
            print(f"[ERROR] No room found with id={self.room_id}")
            raise
        user = User.objects.get(id=user_id)

        # create message with is_read=False by defualt
        message_obj = Message.objects.create(
            user=user,
            room=room,
            content=message,
            is_read=False,  # this need to be explicity set as unread
        )
        return message_obj

    @database_sync_to_async
    def get_username(self, user_id):
        return User.objects.get(id=user_id).username
