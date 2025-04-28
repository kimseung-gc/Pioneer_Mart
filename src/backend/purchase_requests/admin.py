from django.contrib import admin

# Register your models here.

from .models import PurchaseRequest

admin.site.register(PurchaseRequest)
