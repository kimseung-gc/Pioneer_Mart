# views.py - Reporting System for Listings
# This module handles API endpoints related to reporting items on the marketplace.
# It allows authenticated users to toggle item reports and retrieve their own report history.

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView

from .serializers import ReportedItemSerializer
from .models import Listing, ItemReport
from django.shortcuts import get_object_or_404


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_report(request, item_id):
    """
    Allows an authenticated user to report or unreport a specific item listing.

    Behavior:
    - If the user is the seller of the item, return an error (users can't report their own items).
    - If the user has already reported the item and it is unresolved, delete the report (unreport).
    - If the item is not yet reported, require a 'reason' in the POST data and create a new report.

    Args:
        request: DRF Request object containing the user's POST data.
        item_id: The ID of the listing to report/unreport.

    Returns:
        A Response indicating success or an error message with the appropriate HTTP status.
    """
     
    item = get_object_or_404(Listing, id=item_id)

    # Check if the user is not reporting their own item
    if item.seller == request.user:
        return Response(
            {"error": "You cannot report your own item"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if user has already reported this item
    existing_report = ItemReport.objects.filter(
        item=item, reporter=request.user, resolved=False
    ).first()
    # IF they have reported then if they click again, it'll be unreported
    if existing_report:
        existing_report.delete()
        return Response(
            {"success": "Item unreported successfully"},
            status=status.HTTP_200_OK,
        )
    # otherwise create the report
    reason = request.data.get("reason")
    if not reason:
        return Response(
            {"error": "Reason is required when reporting an item"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    report = ItemReport.objects.create(item=item, reporter=request.user, reason=reason)

    return Response(
        {"success": "Item reported successfully"}, status=status.HTTP_201_CREATED
    )


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def get_user_reported_items(request):
#     reports = ItemReport.objects.filter(reporter=request.user)
#     serializer = ReportedItemSerializer(reports, many=True)
#     return Response(serializer.data, status=status.HTTP_200_OK)
class UserReportedItemsView(ListAPIView):
    """
    Returns a list of all items reported by the currently authenticated user.

    Features:
    - Requires authentication.
    - Uses ListAPIView for efficient pagination and serialization.
    - Uses the ReportedItemSerializer to serialize output.
    """
    
    serializer_class = ReportedItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filters reports to only include those made by the current user.
        """
        return ItemReport.objects.filter(reporter=self.request.user)

    # override get_serializer_context to include the request
    def get_serializer_context(self):
        """
        Ensures the request object is passed into the serializer context.
        Useful for serializers that need access to request.user or request data.
        """

        context = super().get_serializer_context()
        context["request"] = self.request
        return context
