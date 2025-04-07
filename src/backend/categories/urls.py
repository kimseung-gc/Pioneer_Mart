from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet

router = DefaultRouter()  # class that automatically generates URL patterns for ViewSets
# if using ViewSet, this registers CategoryViewSet w/ router
router.register(r"categories", CategoryViewSet)  # 'categories' is the base URL
urlpatterns = [
    path(
        "", include(router.urls)
    ),  # if using ViewSet. This will register all basic CRUD operations
]
