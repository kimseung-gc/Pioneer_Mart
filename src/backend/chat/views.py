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
    serializer = ChatRoomSerializer(rooms, many=True)
    return Response({"rooms": serializer.data})


@api_view(["POST"])
def create_room(request):
    serializer = ChatRoomSerializer(data=request.data)
    if serializer.is_valid():
        room = serializer.save()
        return Response({"room": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def chat_history(request, room_id):
    try:
        room = ChatRoom.objects.get(id=room_id)
    except ChatRoom.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    messages = Message.objects.filter(room=room).order_by("timestamp")
    serializer = MessageSerializer(messages, many=True)
    return Response({"messages": serializer.data})


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
