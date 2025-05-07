from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from chat.models import ChatRoom, Message


class ChatRoomTestCase(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="pass1")
        self.user2 = User.objects.create_user(username="user2", password="pass2")
        self.client.force_authenticate(user=self.user1)
        self.room = ChatRoom.objects.create(user1=self.user1, user2=self.user2, item_id=1)

    def test_create_chat_room(self):
        self.assertEqual(ChatRoom.objects.count(), 1)
        self.assertEqual(self.room.user1, self.user1)
        self.assertEqual(self.room.user2, self.user2)
        self.assertEqual(self.room.item_id, 1)

    def test_get_room_list(self):
        response = self.client.get("/chat/room_list/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("rooms", response.data)

    def test_get_or_create_room(self):
        response = self.client.get(f"/chat/get_or_create_room/?user_id={self.user2.id}&item_id=1")
        self.assertEqual(response.status_code, 200)
        self.assertIn("room", response.data)


class MessageTestCase(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="pass1")
        self.user2 = User.objects.create_user(username="user2", password="pass2")
        self.room = ChatRoom.objects.create(user1=self.user1, user2=self.user2, item_id=1)
        self.message = Message.objects.create(
            room=self.room,
            sender=self.user1,
            receiver=self.user2,
            content="Hello!"
        )

    def test_message_creation(self):
        self.assertEqual(Message.objects.count(), 1)
        self.assertEqual(self.message.content, "Hello!")
        self.assertFalse(self.message.is_read)

    def test_mark_as_read(self):
        self.message.mark_as_read()
        self.assertTrue(self.message.is_read)
        self.assertIsNotNone(self.message.read_at)