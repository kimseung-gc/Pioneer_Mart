from rest_framework import viewsets
from .models import Category
from .serializers import CategorySerializer


# viewsets.ModelViewSet is a class that provides complete CRUD operations
class CategoryViewSet(viewsets.ModelViewSet):
    # This will get data in the form of python objects
    queryset = Category.objects.all()

    # This will serialize the data by converting into JSON format
    serializer_class = CategorySerializer

    # disable pagination for the categories endpoint
    pagination_class = None
