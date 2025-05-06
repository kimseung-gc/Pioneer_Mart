from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction
from chat.models import Message, ChatRoom
from items.models import ItemImage, Listing
from notifications.models import Notification
from otpauth.models import OTP
from purchase_requests.models import PurchaseRequest
from report.models import ItemReport
from userprofile.models import UserProfile
from categories.models import Category
from django.contrib.sessions.models import Session


class Command(BaseCommand):
    help = "Wipe all data except admin user"

    @transaction.atomic
    def handle(self, *args, **kwargs):
        # Keep admin user(s)
        admin_users = User.objects.filter(is_superuser=True)
        admin_ids = list(admin_users.values_list("id", flat=True))

        # Delete in the proper order to avoid foreign key constraint errors
        self.stdout.write("Deleting sessions...")
        Session.objects.all().delete()

        self.stdout.write("Deleting chat messages...")
        Message.objects.all().delete()

        self.stdout.write("Deleting chat rooms...")
        ChatRoom.objects.all().delete()

        self.stdout.write("Deleting item images...")
        ItemImage.objects.all().delete()

        self.stdout.write("Deleting additional images...")
        # Handle the items_listing_additional_images table (many-to-many relationship)
        Listing.additional_images.through.objects.all().delete()

        self.stdout.write("Deleting listings...")
        Listing.objects.all().delete()

        self.stdout.write("Deleting notifications...")
        Notification.objects.all().delete()

        self.stdout.write("Deleting purchase requests...")
        PurchaseRequest.objects.all().delete()

        self.stdout.write("Deleting item reports...")
        ItemReport.objects.all().delete()

        self.stdout.write("Deleting OTPs...")
        OTP.objects.all().delete()

        self.stdout.write("Deleting userprofile favorites...")
        # Handle the userprofile_userprofile_favorites table (many-to-many relationship)
        UserProfile.favorites.through.objects.all().delete()

        self.stdout.write("Deleting non-admin user profiles...")
        UserProfile.objects.exclude(user__in=admin_users).delete()

        self.stdout.write("Deleting non-admin users...")
        User.objects.exclude(id__in=admin_ids).delete()

        self.stdout.write(self.style.SUCCESS("Wipe complete. Admin user preserved."))
