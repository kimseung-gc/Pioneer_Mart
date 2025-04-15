from django.urls import path
from . import views

urlpatterns = [
    path("chat/rooms/", views.room_list, name="room_list"),
    # path("chat/rooms/create/", views.create_room, name="create_room"),
    path("chat/history/<int:room_id>/", views.chat_history, name="chat_history"),
    path("chat/get-or-create-room/", views.get_or_create_room),
]
