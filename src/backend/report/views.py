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
    serializer_class = ReportedItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ItemReport.objects.filter(reporter=self.request.user)

    # override get_serializer_context to include the request
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
