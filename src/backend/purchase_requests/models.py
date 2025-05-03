# models.py - PurchaseRequest Model
# This model defines a PurchaseRequest object which links a user to a specific item listing they wish to purchase.
# It prevents duplicate requests and tracks when the request was made and whether it is still active.

# Import Modules
from django.db import models
from django.db.models import Q, UniqueConstraint
from notifications.models import Notification, NotificationType
from items.models import Listing
from django.contrib.auth.models import User


class PurchaseRequest(models.Model):
    """
    PurchaseRequest model represents a user's intent to purchase a specific listing.

    Fields:
    - listing: ForeignKey to the Listing model. Represents the item being requested.
    - requester: ForeignKey to the User model. Represents the user making the request.
    - created_at: Timestamp when the request was created.
    - is_active: Boolean flag to indicate if the request is still active.

    Meta:
    - unique_together: Ensures a user cannot send multiple requests for the same listing.
    """

    # status choices for the purchase requests
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("declines", "Declined"),
        ("cancelled", "Cancelled"),
    )

    listing = models.ForeignKey(
        Listing, related_name="purchase_requests", on_delete=models.CASCADE
    )
    requester = models.ForeignKey(
        User, related_name="sent_purchase_requests", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # create a notification for the purchase request
        if is_new:
            Notification.objects.create(
                recipient=self.listing.seller,
                type=NotificationType.PURCHASE,
                message=f"{self.requester.username} requested to buy your item '{self.listing.title}'",
                related_item=self.listing.title,
            )

    class Meta:
        """
        Local class to prevent duplicate requests for the same "listing" and "requester"
        """

        # this should allow multiple 'cancelled', 'declined', or 'accepted' requests & no errors when cancelling repeatedly
        constraints = [
            UniqueConstraint(
                fields=["listing", "requester"],
                condition=Q(status="pending"),
                name="unique_pending_purchase_request",
            )
        ]
        ordering = ["-created_at"]  # get the newest purchase request first

    def __str__(self):
        """
        Returns a readable string representation of the purchase request.
        """
        return f"Request for {self.listing.title} by {self.requester.username}"
