from rest_framework import serializers
from .models import PurchaseRequest, Listing

# We have two different serializers to provide a more tailored & efficient response.
# Because of this we can present different views of the data.


# This class has two additional fields and methods for specific data
class ListingDetailSerializer ( serializers.ModelSerializer ):
    """
    ListingDetailSerializer class
    Retrieves details from the given requester.
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
            "purchase_request_count",  # not part of original Listing model
            "purchase_requesters",  # not part of original Listing model
        ]

    def get_purchase_request_count(self, obj):
        """
        Returns the count of purchase requests for the listing.

        Args:
            obj (Listing): The Listing object being serialized.

        Returns:
            int: The count of purchase requests.
        """
        return obj.get_purchase_request_count()

    def get_purchase_requesters(self, obj):
        """
        Returns a list of requesters (seller only) or an empty list.

        Args:
            obj (Listing): The Listing object being serialized.

        Returns:
            list: A list of dictionaries containing requester IDs and usernames, or an empty list.
        """
        request = self.context.get("request")
        if request and request.user == obj.seller:
            users = obj.get_purchase_requesters()
            return [{"id": user.id, "username": user.username} for user in users]
        return []


# This class will handle the serialization of PurchaseRequest objects
class PurchaseRequestSerializer ( serializers.ModelSerializer ):
    """
    PurchaseRequestSerializer class
    retrieves data from a given object
    """
    requester_name = serializers.SerializerMethodField()
    listing = ListingDetailSerializer(read_only=True)  # Use the previous serializer

    class Meta:
        """
        Local class for preventing duplication
        """
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
        Returns the username of the requester.

        Args:
            obj (PurchaseRequest): The PurchaseRequest object being serialized.

        Returns:
            str: The username of the requester.
        """
        return obj.requester.username