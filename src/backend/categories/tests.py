from django.test import TestCase
from django.urls import reverse
from .models import Category
from .serializers import CategorySerializer


class CategoryModelTest(TestCase):
    def test_str_representation(self):
        category = Category.objects.create(name="Books")
        self.assertEqual(str(category), "Books")

    def test_default_ordering(self):
        Category.objects.create(name="Books")
        Category.objects.create(name="Electronics")
        Category.objects.create(name="Appliances")
        names = list(Category.objects.values_list("name", flat=True))
        self.assertEqual(names, sorted(names))


class CategorySerializerTest(TestCase):
    def test_serialization(self):
        category = Category.objects.create(name="Furniture")
        serializer = CategorySerializer(category)
        self.assertEqual(serializer.data, {"id": category.id, "name": "Furniture"})

    def test_deserialization(self):
        data = {"name": "Garden"}
        serializer = CategorySerializer(data=data)
        self.assertTrue(serializer.is_valid())
        category = serializer.save()
        self.assertEqual(category.name, "Garden")



