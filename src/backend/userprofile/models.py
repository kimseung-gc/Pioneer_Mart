# models.py - UserProfile Model
# This model defines a UserProfile associated with Django's built-in User model.
# It extends user information with favorites (many-to-many relationship to listings)
# and a verification flag. Signals are used to automatically create or update the profile
# when a User instance is created or saved.

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from items.models import Listing

class UserProfile(models.Model):
    """
    Extends the default User model with additional attributes:
    - favorites: Listings the user has favorited
    - is_verified: Indicates whether the user's account has been verified
    """
    user = models.OneToOneField(User, related_name="profile", on_delete=models.CASCADE)
    favorites = models.ManyToManyField(
        Listing, blank=True, related_name="favorited_by"
    )  # each user profile has multiple favorite listings
    is_verified = models.BooleanField(default=False)

    def get_purchase_requests(self):
        """
        Returns all listings the user has made active purchase requests for.
        """
        return Listing.objects.filter(
            purchase_requests__requester=self.user,
            purchase_requests__is_active=True
        )

    def __str__(self):
        """
        String representation of the profile using the user's email.
        """
        return f"{self.user.email}'s profile"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal to create a UserProfile whenever a new User is created.
    """
    if created:
        print(f"Creating profile for {instance.username}")
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Signal to save or recreate the UserProfile when a User is updated.
    """
    try:
        print(f"Saving profile for {instance.username}")
        instance.profile.save()
    except UserProfile.DoesNotExist:
        print(f"User {instance.username} has no profile, creating now...")
        UserProfile.objects.create(user=instance)
