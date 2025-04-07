from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from purchase_requests.models import PurchaseRequest
from purchase_requests.serializers import PurchaseRequestSerializer
from rest_framework.response import Response


class PurchaseRequestViewSet(viewsets.ModelViewSet):
    """
    PurchaseRequestViewSet class
    Contains some actions for users (i.e. retrieves the information for "sent" or "received")
    """
    queryset = PurchaseRequest.objects.all()
    serializer_class = PurchaseRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Returns the queryset of purchase requests based on the action.

        If the action is 'sent', returns requests made by the current user.
        If the action is 'received', returns requests for listings owned by the current user.
        Otherwise, defaults to returning requests made by the current user.

        Returns:
            QuerySet[PurchaseRequest]: The filtered queryset.
        """
        user = self.request.user  # this uses the built-in django User
        if self.action == "sent":
            return PurchaseRequest.objects.filter(requester=user)
        elif self.action == "received":
            return PurchaseRequest.objects.filter(listing__seller=user)
        else:
            return PurchaseRequest.objects.filter(requester=user)

    def perform_create(self, serializer):
        # Save the requester as the user sending the request
        serializer.save(requester=self.request.user)

    @action(detail=False, methods=["get"])
    def sent(self, request):
        """
        Returns the purchase requests sent by the current user.

        Args:
            request (Request): The request object.

        Returns:
            Response: A response containing the serialized purchase requests.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def received(self, request):
        """
        Returns the purchase requests received by the current user (as a seller).

        Args:
            request (Request): The request object.

        Returns:
            Response: A response containing the serialized purchase requests.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """
        Cancels a purchase request by deleting it.

        Args:
            request (Request): The request object.
            pk (int, optional): The primary key of the purchase request. Defaults to None.

        Returns:
            Response: A response indicating the cancellation status.
        """
        purchase_request = self.get_object()
        if purchase_request.requester != request.user:
            return Response(
                {"detail": "You cannot cancel someone else's purchase request"},
                status=status.HTTP_403_FORBIDDEN,
            )
        purchase_request.delete()  # delete the purchase request from the database
        return Response({"detail": "Purchase request cancelled."})