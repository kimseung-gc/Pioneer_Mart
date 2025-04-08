from django.db import models
from items.models import Listing
from django.contrib.auth.models import User

class PurchaseRequest ( models.Model ):
    """
    PurchaseRequest class
    The class for purchase request.
    """
    listing = models.ForeignKey (
        Listing, 
        related_name="purchase_requests", 
        on_delete=models.CASCADE
    )
    requester = models.ForeignKey(
        User, 
        related_name="sent_purchase_requests", 
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField ( auto_now_add=True )
    is_active = models.BooleanField ( default=True )

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
        __str__
        returns the string version of the request
        """
        return f"Request for {self.listing.title} by {self.requester.username}"