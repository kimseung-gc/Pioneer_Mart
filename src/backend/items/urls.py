from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet

router = DefaultRouter()
router.register(
    r"items", ItemViewSet, basename="items"
)  # if using ViewSet!! this registers all CRUD operations for items
# POST /items/{id}/toggle_favorite/ - Toggles favorite status for a listing.
# GET /items/favorites/ - Retrieves all favorite listings.

urlpatterns = [
    path("", include(router.urls)),  # if using ViewSet
]
