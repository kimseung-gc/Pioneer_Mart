from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from items.models import Listing


class UserProfile(models.Model):
    user = models.OneToOneField(User, related_name="profile", on_delete=models.CASCADE)
    favorites = models.ManyToManyField(
        Listing, blank=True, related_name="favorited_by"
    )  # each user profile has multiple favorite listings
    is_verified = models.BooleanField(default=False)

    def get_purchase_requests(self):
        """Returns all listings the user has requested to purchase"""
        return Listing.objects.filter(
            purchase_requests__requester=self.user, purchase_requests__is_active=True
        )

    def __str__(self):
        return f"{self.user.email}'s profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        print(f"Creating profile for {instance.username}")  # Debugging
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        print(f"Saving profile for {instance.username}")  # Debugging
        instance.profile.save()
    except UserProfile.DoesNotExist:
        print(f"User {instance.username} has no profile, creating now...")
        UserProfile.objects.create(user=instance)
