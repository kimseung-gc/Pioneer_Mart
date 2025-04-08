import django
from django.db import models
import random
from datetime import datetime, timedelta, timezone


class OTP (models.Model):
    """
    OTP class
    object type for OTP. Sends the email the OTP and when given the correct OTP, registers the user.
    """
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        """
        saves the OTP
        """
        if not self.otp:
            # Generate a 6 digit OTP
            self.otp = "".join([str(random.randint(0, 9)) for _ in range(6)])

        if not self.expires_at:
            # Set expiry to 10 minutes from now
            self.expires_at = django.utils.timezone.now() + timedelta(minutes=10)

        super().save(*args, **kwargs)

    def is_valid (self):
        """
        returns if the given OTP is valid
        """
        return django.utils.timezone.now() <= self.expires_at
    
    def is_valid_email (self):
        """
        returns if the email of the given OTP is valid or not.
        """
        splitEmail = self.email.split("@")
        if (len(splitEmail) != 2):
            return False
        if ("@" not in self.email) or (splitEmail[0] == "") or (splitEmail[1] == ""):
            return False
        elif ("." not in splitEmail[1]):
            return False
        else:
            splitSecond = splitEmail[1].split('.')
            if (len(splitSecond) != 2):
                return False
            elif ((splitSecond[0] == 0) or (splitSecond[1] == 0)):
                return False
        return True

    def __str__ (self):
        return f"OTP for {self.email}"
