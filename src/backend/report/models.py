from django.db import models
from django.contrib.auth.models import User

from items.models import Listing


class ItemReport(models.Model):
    item = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="reports")
    reporter = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="reported_items"
    )
    reason = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_reports",
    )

    class Meta:
        unique_together = [
            "item",
            "reporter",
        ]  # prevent duplicate reports from the same user
        ordering = ["-created_at"]  # get the most recent reports first

    def __str__(self):
        return f"Report for {self.item.title} by {self.reporter.username}"
