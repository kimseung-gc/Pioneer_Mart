from django.contrib import admin

# Register your models here.

from .models import ChatRoom, Message

admin.site.register(ChatRoom)
admin.site.register(Message)
