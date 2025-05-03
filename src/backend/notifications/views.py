from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, NotificationType
from .serializers import NotificationSerializer
from django.db.models import Q


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        notification_type = self.request.query_params.get("type", None)

        queryset = Notification.objects.filter(recipient=user)

        # for the all condition we have on the frontend
        if notification_type and notification_type != "all":
            queryset = queryset.filter(type=notification_type)
        return queryset

    @action(detail=False, methods=["post"])
    def mark_as_read(self, request):
        notification_ids = request.data.get("notification_ids", [])

        # if we don't get a notification id from the frontend
        if not notification_ids:
            return Response(
                {"error": "No notification IDs provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        notifications = Notification.objects.filter(
            id__in=notification_ids, recipient=request.user
        )
        notifications.update(is_read=True)
        return Response({"status": "notification marked as read"})

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        count = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).count()
        return Response({"unread_count": count})

    @action(detail=False, methods=["post"])
    def reset_unread_count(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(
            is_read=True
        )
        return Response({"status": "reset unread count"})


# notification utility functions OUTSIDE the class


# purchase request notification
def create_purchase_notification(recipient, item_name, requester_name):
    message = f"{requester_name} requested to buy your item '{item_name}'"
    return Notification.objects.create(
        recipient=recipient,
        type=NotificationType.PURCHASE,
        message=message,
        related_item=item_name,
    )


# chat notification
def create_chat_notification(recipient, item_name, sender_name):
    message = f"{sender_name} sent a message about '{item_name}'"

    return Notification.objects.create(
        recipient=recipient,
        type=NotificationType.CHAT,
        message=message,
        related_item=item_name,
    )
