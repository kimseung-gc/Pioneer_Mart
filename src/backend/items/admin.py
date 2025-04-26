from django.contrib import admin

# Register your models here.

from .models import Listing, ItemImage

admin.site.register(ItemImage)

from django.utils.html import format_html


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "seller",
        "price",
        "is_sold",
        "main_image_preview",
        "created_at",
    )
    readonly_fields = ("main_image_preview",)

    def main_image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px;" />', obj.image.url
            )
        return "-"

    main_image_preview.short_description = "Main Image"
