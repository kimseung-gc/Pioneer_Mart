from django.test import TestCase
from django.contrib.auth.models import User
from .models import Category
from .models import Listing

class ListingModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="pass")
        self.category = Category.objects.create(name="Books")

    def test_listing_creation(self):
        listing = Listing.objects.create(
            title="Test Book",
            category=self.category,
            description="A very good book.",
            price=10.99,
            seller=self.user,
        )
        self.assertEqual(listing.title, "Test Book")
        self.assertEqual(listing.category.name, "Books")
        self.assertEqual(listing.seller.username, "testuser")
        self.assertFalse(listing.is_sold)
        self.assertEqual(listing.seller_name, "testuser")
        self.assertEqual(listing.category_name, "Books")

    def test_get_purchase_request_count(self):
        listing = Listing.objects.create(
            title="Test Book",
            category=self.category,
            price=10.99,
            seller=self.user,
        )
        count = listing.get_purchase_request_count()
        self.assertEqual(count, 0)  # Should return 0 initially

    def test_str_method(self):
        listing = Listing.objects.create(
            title="Test Book",
            category=self.category,
            price=10.99,
            seller=self.user,
        )
        self.assertEqual(str(listing), "Test Book")
