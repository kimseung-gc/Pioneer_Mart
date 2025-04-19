from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Listing, ItemReport
from django.shortcuts import get_object_or_404


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_report(request, item_id):
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
