# models.py - PurchaseRequest Model
# This model defines a PurchaseRequest object which links a user to a specific item listing they wish to purchase.
# It prevents duplicate requests and tracks when the request was made and whether it is still active.

# Import Modules
from django.db import models
from items.models import Listing
from django.contrib.auth.models import User

class PurchaseRequest ( models.Model ):
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

    listing = models.ForeignKey(
        Listing,
        related_name="purchase_requests",
        on_delete=models.CASCADE
    )
    requester = models.ForeignKey(
        User,
        related_name="sent_purchase_requests",
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        """
        Local class to prevent duplicate requests for the same "listing" and "requester"
        """
        unique_together = (
            "listing",
            "requester",
        )  # this will prevent duplicate requests

    def __str__ ( self ):
        """
        Returns a readable string representation of the purchase request.
        """
        return f"Request for {self.listing.title} by {self.requester.username}"