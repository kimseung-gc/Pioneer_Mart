from categories.models import Category
from rest_framework import serializers


# serializers.ModelSerializer simplifies the process of creating
# serializer that works with the Category Model
class CategorySerializer(serializers.ModelSerializer):
    # Meta class defines metadata for serializer (e.g. what model it's working with)
    class Meta:
        model = Category  # tell the serializer we're working with Category model
        fields = "__all__"  # get all fields
