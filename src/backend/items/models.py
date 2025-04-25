from django.db import models
from django.contrib.auth.models import User

from categories.models import Category

# Create your models here.


class Listing(models.Model):
    title = models.CharField(max_length=255)
    # related_name="items" allows us to access listings related to a category using category.items.all()
    # on_delete=models.CASCADE...if category is deleted, all items in that category are also deleted
    category = models.ForeignKey(
        Category, related_name="items", on_delete=models.CASCADE
    )
    category_name = models.CharField(
        max_length=255, blank=True
    )  # populated automatically in the save method below
    description = models.TextField(
        blank=True, null=True
    )  # text field for long er than 255 characters, blank & null if user doesn't wanna add description
    price = models.FloatField()
    image = models.ImageField(
        upload_to="item_images", blank=True, null=True
    )  # django will create item_images if folder doesn't exist
    additional_images = models.ManyToManyField(
        "ItemImage", related_name="listings", blank=True
    )
    is_sold = models.BooleanField(default=False)
    seller = models.ForeignKey(
        User, related_name="items", on_delete=models.CASCADE
    )  # if user is deleted, all items are also deleted
    seller_name = models.CharField(
        max_length=255, blank=True, editable=False
    )  # New field to store the seller's name
    created_at = models.DateTimeField(auto_now_add=True)  # add date/time automatically
    # updated_at = models.DateTimeField(auto_now=True)  #TODO: do this after editing functionality

    def get_purchase_request_count(self):
        """
        Returns the count of active purchase requests for this listing.

        Returns:
            int: The number of active purchase requests.
        """
        return self.purchase_requests.filter(is_active=True).count()

    def get_purchase_requesters(self):
        """
        Returns a queryset of users who have active purchase requests for this listing.

        This method uses the reverse relationship 'sent_purchase_requests' from the User model
        to the PurchaseRequest model, filtering by the current listing and active requests.

        Returns:
            QuerySet[User]: A queryset of User objects.
        """
        # sent_purchase_requests__listing linked to purchase_requests model...self is current listing
        return User.objects.filter(
            sent_purchase_requests__listing=self, sent_purchase_requests__is_active=True
        )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        """
        Overrides the default save method to automatically populate seller_name and category_name.
        """
        if self.seller:
            self.seller_name = self.seller.username
        if self.category:
            self.category_name = self.category.name
        super().save(*args, **kwargs)

    # To show the name of the categories
    def __str__(self):
        """
        Returns the title of the listing as its string representation.
        """
        return self.title


# new model for additional images
class ItemImage(models.Model):
    image = models.ImageField(upload_to="item_additional_images")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id}"
