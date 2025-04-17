from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User
from chat.serializers import ChatRoomSerializer, MessageSerializer
from .models import ChatRoom, Message
from django.db.models import Q

# using api_view here cause I'm scared I'll break something


@api_view(["GET"])
def room_list(request):
    user = request.user
    rooms = ChatRoom.objects.filter(Q(user1=user) | Q(user2=user))

    # get unread counts for each room
    room_data = []
    for room in rooms:
        # get unread message count for this user
        unread_count = (
            Message.objects.filter(
                room=room,
                is_read=False,
            )
            .exclude(user=user)
            .count()
        )

        # now get the timestamp of the last message
        last_message = Message.objects.filter(room=room).order_by("-timestamp").first()
        last_message_time = last_message.timestamp if last_message else None

        # create a temporary dict with room data
        room_dict = {
            "room": room,
            "unread_count": unread_count,
            "last_message_time": last_message_time,
        }
        room_data.append(room_dict)

    # serialize the rooms with additional data
    serialized_rooms = []
    for item in room_data:
        serializer = ChatRoomSerializer(item["room"])
        data = serializer.data
        data["unread_count"] = item["unread_count"]
        data["last_message_time"] = item["last_message_time"]
        serialized_rooms.append(data)
    return Response({"rooms": serialized_rooms})


@api_view(["GET"])
def chat_history(request, room_id):
    try:
        room = ChatRoom.objects.get(id=room_id)
        user = request.user

        # check if the user has access to this room
        if user != room.user1 and user != room.user2:
            return Response(
                {"error": "You don't have access to this room"},
                status=status.HTTP_403_FORBIDDEN,
            )
        messages = Message.objects.filter(room=room).order_by("timestamp")

        # filter messages that are read when history is fetched
        unread_messagees = messages.filter(is_read=False).exclude(user=user)
        current_time = timezone.now()

        # mark those messages as read
        for message in unread_messagees:
            message.is_read = True
            message.read_at = current_time
            message.save()
        serializer = MessageSerializer(messages, many=True)
        return Response({"messages": serializer.data})
    except ChatRoom.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_or_create_room(request):
    other_user_id = request.GET.get("user_id")  # get the user id
    item_id = request.GET.get("item_id")  # get the item id
    if not other_user_id or not item_id:  # need both for new chat room
        return Response(
            {"error": "Both user_id and item_id are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        other_user = User.objects.get(id=other_user_id)  # get other user
        me = request.user  # this is current user
        # We wanna first check if a room already exists for this user item combo
        existing_rooms = ChatRoom.objects.filter(
            item_id=item_id, user1__in=[me, other_user], user2__in=[me, other_user]
        )
        if existing_rooms.exists():
            room = existing_rooms.first()  # room exists so return it
        else:
            # Create a new room for this item
            user1, user2 = sorted(
                [me, other_user], key=lambda u: u.id
            )  # sort by my name first
            room = ChatRoom.objects.create(user1=user1, user2=user2, item_id=item_id)

        # room, created = ChatRoom.objects.get_or_create(user1=user1, user2=user2)
        serializer = ChatRoomSerializer(room)
        return Response({"room": serializer.data})
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_room_as_read(request, room_id):
    """
    Mark all unread messages in a room as read for the current user
    """
    try:
        # first we get the room
        room = ChatRoom.objects.get(id=room_id)
        user = request.user

        # Then check if the user is part of this room
        if user != room.user1 and user != room.user2:
            return Response(
                {"error": "You don't have access to this room"},
                status=status.HTTP_403_FORBIDDEN,
            )

        print("hello")
        # Now find the messagees that are unread nad not sent by the current user
        unread_messages = Message.objects.filter(
            room=room,
            is_read=False,
        ).exclude(user=user)

        # Mark messages as read with a timestamp
        unread_count = unread_messages.count()
        current_time = timezone.now()
        for message in unread_messages:
            message.is_read = True
            message.read_at = current_time
            message.save()
        return Response(
            {
                "success": True,
                "message": f"Marked {unread_count} messages as read",
                "unread_count": 0,
            }
        )
    except ChatRoom.DoesNotExist:
        return Response(
            {"error": "Chat room not found"}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
