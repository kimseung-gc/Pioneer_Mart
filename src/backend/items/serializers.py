from rest_framework import serializers
from .models import Listing


class ItemSerializer(serializers.ModelSerializer):
    # This is a read only field
    is_favorited = serializers.SerializerMethodField()

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
            "is_favorited",
        ]  # get all fields
        read_only_fields = ["id", "seller_name", "category_name", "created_at"]

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
