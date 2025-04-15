# serializers.py - Serializers for PurchaseRequest and Listing
#  This module defines two serializers:
#  1. ListingDetailSerializer - Adds purchase-related fields to the listing view.
#  2. PurchaseRequestSerializer - Handles creation and representation of purchase requests.

from rest_framework import serializers
from .models import PurchaseRequest, Listing

# ListingDetailSerializer extends the default listing with request-related metadata.
class ListingDetailSerializer(serializers.ModelSerializer):
    """
    ListingDetailSerializer
    Serializes Listing objects with additional fields related to purchase requests:
    - purchase_request_count: total number of active requests for the listing
    - purchase_requesters: a list of users who requested to buy the item (visible only to seller)
    """
    purchase_request_count = serializers.SerializerMethodField()
    purchase_requesters = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "category",
            "category_name",
            "description",
            "price",
            "image",
            "is_sold",
            "seller",
            "seller_name",
            "created_at",
            "purchase_request_count",   # Custom field
            "purchase_requesters",      # Custom field, conditionally shown
        ]

    def get_purchase_request_count(self, obj):
        """
        Get the number of purchase requests for the listing.

        Args:
            obj (Listing): The listing being serialized.

        Returns:
            int: Number of requests linked to this listing.
        """
        return obj.get_purchase_request_count()

    def get_purchase_requesters(self, obj):
        """
        Get a list of users who requested the item (visible only to seller).

        Args:
            obj (Listing): The listing being serialized.

        Returns:
            list: List of dicts with requester 'id' and 'username'.
        """
        request = self.context.get("request")
        if request and request.user == obj.seller:
            users = obj.get_purchase_requesters()
            return [{"id": user.id, "username": user.username} for user in users]
        return []

# PurchaseRequestSerializer handles serialization of purchase request records.
class PurchaseRequestSerializer(serializers.ModelSerializer):
    """
    PurchaseRequestSerializer
    Serializes PurchaseRequest instances including nested listing and requester's name.
    """
    requester_name = serializers.SerializerMethodField()
    listing = ListingDetailSerializer(read_only=True)

    class Meta:
        model = PurchaseRequest
        fields = [
            "id",
            "listing",
            "requester",
            "requester_name",
            "created_at",
            "is_active",
        ]
        read_only_fields = ["requester", "created_at"]

    def get_requester_name(self, obj):
        """
        Get the username of the user who made the request.

        Args:
            obj (PurchaseRequest): The object being serialized.

        Returns:
            str: Username of the requester.
        """
        return obj.requester.username
