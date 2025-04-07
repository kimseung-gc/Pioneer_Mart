from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PurchaseRequestViewSet

router = DefaultRouter()
router.register(
    r"requests", PurchaseRequestViewSet
)  # if using ViewSet!! this registers all CRUD operations for items

urlpatterns = [
    path("", include(router.urls)),  # if using ViewSet
]