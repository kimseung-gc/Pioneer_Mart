from django.test import TestCase
from .models import PurchaseRequest
from django.db import models
from items.models import Listing
from categories.models import Category
from django.contrib.auth.models import User
from .serializers import ListingDetailSerializer, PurchaseRequestSerializer


class PurchaseRequestTestCase(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="testuser", password="pass")
        self.cat1 = Category.objects.create(name="test_category")
        self.listing1 = Listing.objects.create(
            title="Test Book",
            category=self.cat1,
            description="A very good book.",
            price=10.99,
            seller=self.user1,
        )
        self.testPurchaseReq1 = PurchaseRequest.objects.create(
            listing=self.listing1, requester=self.user1
        )
        # Empty string case
        try:
            self.user2 = User.objects.create_user(username="", password="")
            self.cat2 = Category.objects.create(name="")
            self.listing2 = Listing.objects.create(
                title="",
                category=self.cat2,
                description="",
                price=10.99,
                seller=self.user2,
            )
            self.testPurchaseReq2 = PurchaseRequest.objects.create(
                listing=self.listing2, requester=self.user2
            )
            assert False
        except ValueError:
            assert True

    def test_string_version(self):
        self.assertEqual(
            str(self.testPurchaseReq1), "Request for Test Book by testuser"
        )
        self.assertEqual(self.testPurchaseReq1.listing.price, 10.99)
        self.assertEqual(self.testPurchaseReq1.listing.description, "A very good book.")
        self.assertEqual(self.testPurchaseReq1.listing.category.name, "test_category")
        self.assertEqual(self.testPurchaseReq1.listing.category, self.cat1)
        self.assertEqual(self.testPurchaseReq1.listing, self.listing1)


class PurchaseRequestSerializerTestCase(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="testuser", password="pass")
        self.cat1 = Category.objects.create(name="test_category")
        self.listing1 = Listing.objects.create(
            title="Test Book",
            category=self.cat1,
            description="A very good book.",
            price=10.99,
            seller=self.user1,
        )
        self.testPurchaseReq1 = PurchaseRequest.objects.create(
            listing=self.listing1, requester=self.user1
        )

    def test_list_serial(self):
        list_serial = ListingDetailSerializer(self.listing1)
        self.assertEqual(
            list_serial.data,
            {
                "id": 1,
                "title": "Test Book",
                "category": 1,
                "category_name": "test_category",
                "description": "A very good book.",
                "price": 10.99,
                "image": None,
                "is_sold": False,
                "seller": 1,
                "seller_name": "testuser",
                "created_at": list_serial.data["created_at"],
                "purchase_request_count": 1,
                "purchase_requesters": [],
            },
        )

    def test_serialization(self):
        serializer = PurchaseRequestSerializer(self.testPurchaseReq1)
        list_serial = ListingDetailSerializer(self.listing1)
        self.assertEqual(
            serializer.data,
            {
                "id": self.testPurchaseReq1.id,
                "listing": list_serial.data,
                "requester": 1,
                "requester_name": "testuser",
                "created_at": serializer.data["created_at"],
                "is_active": True,
                "status": "pending",
            },
        )
