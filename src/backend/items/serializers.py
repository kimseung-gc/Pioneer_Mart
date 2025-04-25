from rest_framework import serializers

from report.models import ItemReport
from django.contrib.auth.models import User
from .models import ItemImage, Listing


# new serializer for the ItemImage model
class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ["id", "image"]


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username")


class ItemSerializer(serializers.ModelSerializer):
    # This is a read only field
    is_favorited = serializers.SerializerMethodField()
    is_reported = serializers.SerializerMethodField()

    # new field for additional images
    additional_images = ItemImageSerializer(many=True, read_only=True)
    purchase_requesters = serializers.SerializerMethodField()
    purchase_request_count = serializers.SerializerMethodField()

    # # this will be used to handle the uploaded additional images
    # uploaded_images = serializers.ListField(
    #     child=serializers.ImageField(allow_empty_file=False, use_url=False),
    #     write_only=True,
    #     required=False,
    # )

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
            "additional_images",
            "is_sold",
            "seller",
            "seller_name",
            "created_at",
            "is_favorited",
            "is_reported",
            "purchase_request_count",
            "purchase_requesters",
        ]  # get all fields
        read_only_fields = [
            "id",
            "seller",
            "seller_name",
            "category_name",
            "created_at",
        ]

    def get_is_favorited(self, obj):
        """
        Checks if the listing is favorited by the current user.

        Args:
            obj (Listing): The Listing object being serialized.

        Returns:
            bool: True if the listing is favorited, False otherwise.
        """
        user = self.context.get("request").user
        return obj in user.profile.favorites.all()

    def get_is_reported(self, obj):
        """
        Checks if the listing is reported by the current user.

        Args:
            obj (Listing): The Listing object being serialized.

        Returns:
            bool: True if the listing is reported, False otherwise.
        """
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return ItemReport.objects.filter(item=obj, reporter=request.user).exists()
        return False

    def get_purchase_requesters(self, obj):
        requesters = obj.get_purchase_requesters()
        return UserMiniSerializer(requesters, many=True).data

    def get_purchase_request_count(self, obj):
        return obj.get_purchase_request_count()
