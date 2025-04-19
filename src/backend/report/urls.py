from django.urls import path
from . import views

urlpatterns = [
    path(
        "report/<int:item_id>/toggle_report/", views.toggle_report, name="toggle_report"
    ),
    # path("report/reported_items/", views.reported_items, name="reported_items"),
]
