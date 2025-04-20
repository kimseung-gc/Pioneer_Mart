from django.urls import path
from . import views

urlpatterns = [
    path("chat/rooms/", views.room_list, name="room_list"),
    path("chat/history/<int:room_id>/", views.chat_history, name="chat_history"),
    path("chat/get-or-create-room/", views.get_or_create_room),
    path(
        "chat/rooms/<int:room_id>/mark-read/",
        views.mark_room_as_read,
        name="mark-room-as-read",
    ),
    path("chat/unread-count/", views.unread_count, name="unread_count"),
]
