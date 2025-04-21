from django.urls import path
from . import views

urlpatterns = [
    path(
        "report/<int:item_id>/toggle_report/", views.toggle_report, name="toggle_report"
    ),
    path(
        "report/reported-items/",
        views.UserReportedItemsView.as_view(),
        name="reported_items",
    ),
]
