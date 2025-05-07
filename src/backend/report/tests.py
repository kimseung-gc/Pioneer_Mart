from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from items.models import Listing
from report.models import ItemReport


class ReportFeatureTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="reporter", password="pass")
        self.user2 = User.objects.create_user(username="seller", password="pass")
        self.client.force_authenticate(user=self.user1)
        self.listing = Listing.objects.create(
            title="Bike",
            description="Mountain bike",
            price=100,
            seller=self.user2
        )

    def test_report_item(self):
        url = f"/report/{self.listing.id}/toggle/"
        data = {"reason": "Inappropriate content"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ItemReport.objects.filter(item=self.listing, reporter=self.user1).exists())

    def test_unreport_item(self):
        ItemReport.objects.create(item=self.listing, reporter=self.user1, reason="Spam")
        url = f"/report/{self.listing.id}/toggle/"
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(ItemReport.objects.filter(item=self.listing, reporter=self.user1).exists())

    def test_cannot_report_own_item(self):
        self.client.force_authenticate(user=self.user2)
        url = f"/report/{self.listing.id}/toggle/"
        response = self.client.post(url, {"reason": "Just testing"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_report_requires_reason(self):
        url = f"/report/{self.listing.id}/toggle/"
        response = self.client.post(url)  # no reason provided
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_user_reported_items(self):
        ItemReport.objects.create(item=self.listing, reporter=self.user1, reason="Scam")
        response = self.client.get("/report/my_reports/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["reason"], "Scam")