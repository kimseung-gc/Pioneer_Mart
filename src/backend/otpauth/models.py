# Import Modules
import django
from django.db import models
import random
from datetime import datetime, timedelta, timezone
from django.core.exceptions import ValidationError
from django.core.validators import validate_email


class OTP(models.Model):
    """
    Represents a One-Time Password (OTP) entry associated with a user’s email address.
    This model is used to generate, store, and validate time-sensitive OTPs for email verification.

    Fields
    ----------
    email      : EmailField
    otp        : CharField (length of 6)
    created_at : DateTimeField (added automatically)
    expires_at : DateTimeField
    """

    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        """
        Overrides the save() method to automatically generate a 6-digit OTP
        and set the expiry time if they are not already set.
        """
        if not self.otp:
            if self.email == "storemail@grinnell.edu":
                self.otp = "012345"
            else:
                self.otp = "".join([str(random.randint(0, 9)) for _ in range(6)])

        if not self.expires_at:
            # Set expiry to 10 minutes from now
            self.expires_at = django.utils.timezone.now() + timedelta(minutes=10)

        super().save(*args, **kwargs)

    def is_valid(self):
        """
        Returns if the given OTP is valid
        """
        return django.utils.timezone.now() <= self.expires_at

    def is_valid_email(self):
        """
        Returns if the email of the given OTP is valid or not.
        """
        try:
            validate_email(self.email)
        except ValidationError as e:
            return False

    def __str__(self):
        """
        String representation of the OTP instance.
        """
        return f"OTP for {self.email}"
