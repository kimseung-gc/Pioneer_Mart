import django
from django.db import models
import random
from datetime import datetime, timedelta, timezone


class OTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.otp:
            # Generate a 6 digit OTP
            self.otp = "".join([str(random.randint(0, 9)) for _ in range(6)])

        if not self.expires_at:
            # Set expiry to 10 minutes from now
            self.expires_at = django.utils.timezone.now() + timedelta(minutes=10)

        super().save(*args, **kwargs)

    def is_valid(self):
        return django.utils.timezone.now() <= self.expires_at

    def __str__(self):
        return f"OTP for {self.email}"
