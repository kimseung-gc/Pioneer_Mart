from rest_framework import viewsets
from categories.serializers import CategorySerializer
from .models import Listing
from purchase_requests.models import PurchaseRequest
from purchase_requests.serializers import PurchaseRequestSerializer
from .serializers import ItemSerializer
from .permissions import IsSellerOrReadOnly
from rest_framework.decorators import action, api_view, parser_classes
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
)  # parse form content + media files
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, filters
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q  # for searching stuff
from django_filters.rest_framework import DjangoFilterBackend


class ItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Listing objects.

    Provides CRUD operations for listings, as well as custom actions for favorites,
    searching, and purchase requests.

    Attributes:
        queryset (QuerySet): The queryset of Listing objects.
        serializer_class (Serializer): The serializer class for Listing objects.
        authentication_classes (list): Authentication classes used (JWT).
        permission_classes (list): Permission classes used (IsAuthenticated, IsSellerOrReadOnly).
        filter_backends (list): Filter backends used for filtering and searching.
        filterset_fields (list): Fields used for filtering.
        search_fields (list): Fields used for searching.
        ordering_fields (list): Fields used for ordering.
        ordering (list): Default ordering.
        parser_classes (list): Parser classes used for file uploads.

    Methods:
        perform_create(serializer): Sets the seller to the current user when creating a listing.
        get_serializer_context(): Adds the request to the serializer context.
        toggle_favorite(request, pk=None): Toggles a listing as a favorite for the user.
        favorites(request): Returns all favorite listings for the user.
        search_favorites(request): Searches favorite listings for the user.
        search_items(request, pk=None): Searches all listings based on a query.
        my_items(request): Returns the logged-in user's listings.
        search_my_items(request): Searches the logged-in user's listings.
        request_purchase(request, pk=None): Creates a purchase request for a listing.
    """

    queryset = Listing.objects.all()  # get all listing objects
    serializer_class = ItemSerializer  # specify the serializer to use for converting Listing objects to and from JSON
    authentication_classes = [
        JWTAuthentication
    ]  # JWT authentication requiring users to provide valid JWT to access API
    permission_classes = [
        IsAuthenticated,  # ensure only authenticated users can access ViewSet
        IsSellerOrReadOnly,  # ensure only seller of a listing can update/delete it...any authenticated user can view the listing
    ]
    filter_backends = [  # TODO: Documentation
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["category", "seller"]
    search_fields = ["title", "description", "category__name"]  # fields to search by
    ordering_fields = ["created_at", "price", "title"]
    ordering = ["-created_at"]  # order by creation date in descending order
    parser_classes = [MultiPartParser, FormParser]  # media files are handled

    def perform_create(self, serializer):
        """Set seller to current user when creating listing."""
        serializer.save(seller=self.request.user)

    def get_serializer_context(self):
        """Add request to serializer context to check if item is favorited by user."""
        context = super().get_serializer_context()
        return context

    @action(
        detail=True, methods=["POST"], permission_classes=[IsAuthenticated]
    )  # detail True cause we're doing smth to one single instance of the model
    def toggle_favorite(self, request, pk=None):
        """
        Toggles a listing as a favorite for the user.

        Args:
            request (Request): The request object.
            pk (int, optional): The primary key of the listing. Defaults to None.

        Returns:
            Response: A response indicating whether the listing was added or removed from favorites.
        """
        try:
            user_profile = (
                request.user.profile
            )  # this uses the custom UserProfile model
            listing = (
                self.get_object()
            )  # retrieve the listing based on pk provided in URL

            if user_profile.favorites.filter(pk=listing.pk).exists():
                user_profile.favorites.remove(
                    listing
                )  # if item is already in favorites, remove it
                return Response({"message": "Listing removed from favorites."})
            else:
                user_profile.favorites.add(
                    listing
                )  # if item is not in favorites, add it
                return Response({"message": "Listing added to favorites."})
        except Listing.DoesNotExist:
            return Response({"error": "Listing not found."}, status=404)

    @action(detail=False, methods=["GET"], permission_classes=[IsAuthenticated])
    def favorites(self, request):
        """
        Returns all favorite listings for the user.

        Args:
            request (Request): The request object.

        Returns:
            Response: A response containing the user's favorite listings.
        """
        # get instance of currently logged in user
        user_profile = request.user.profile
        favorites = user_profile.favorites.all()  # get all the user's favorites

        # Paginate stuff
        page = self.paginate_queryset(favorites)  # method provided by DRF
        if page is not None:

            # Serialize the paginated subset of favorites
            serializer = self.get_serializer(page, many=True)

            # Return the DRF paginated response which includes serialized data and pagination metadata
            return self.get_paginated_response(serializer.data)

        # serialize a queryset of Listing objects into JSON...many=True iterates over queryset to serialize each Listing object, without many=True seriealizer expects single Listing instance
        serializer = self.get_serializer(favorites, many=True)
        return Response(serializer.data)  # create response to be sent back to client

    @action(detail=False, methods=["GET"], permission_classes=[IsAuthenticated])
    def search_favorites(self, request):
        """
        Searches favorite listings for the user.

        Args:
            request (Request): The request object.

        Returns:
            Response: A response containing the search results.
        """
        query = request.query_params.get("q", "")
        user_profile = request.user.profile
        favorites = user_profile.favorites.all()
        if query:
            items = favorites.filter(
                Q(title__icontains=query)
                | Q(description__icontains=query)
                | Q(
                    category__name__icontains=query
                )  # search in title, description, and category name
            )
        else:
            items = favorites
        page = self.paginate_queryset(items)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)  # create response to be sent back to client

    @action(detail=False, methods=["GET"], permission_classes=[IsAuthenticated])
    def search_items(self, request, pk=None):
        """
        Searches all listings based on a query.

        Args:
            request (Request): The request object.
            pk (int, optional): The primary key of the listing. Defaults to None.

        Returns:
            Response: A response containing the search results.
        """
        query = request.query_params.get("q", "")
        if query:
            items = self.queryset.filter(
                Q(title__icontains=query)
                | Q(description__icontains=query)
                | Q(
                    category__name__icontains=query
                )  # search in title, description, and category name
            )
        else:
            items = self.queryset
        return self.get_paginated_response(
            self.get_serializer(self.paginate_queryset(items), many=True).data
        )

    @action(detail=False, methods=["GET"], permission_classes=[IsAuthenticated])
    def my_items(self, request):
        """
        Returns the logged-in user's listings.

        Args:
            request (Request): The request object.

        Returns:
            Response: A response containing the user's listings.
        """
        items = self.queryset.filter(seller=request.user)
        page = self.paginate_queryset(items)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(
            items, many=True
        )  # serialize the data to return in a Response
        return Response(serializer.data)

    @action(detail=False, methods=["GET"], permission_classes=[IsAuthenticated])
    def search_my_items(self, request):
        """
        Searches the logged-in user's listings.

        Args:
            request (Request): The request object.

        Returns:
            Response: A response containing the search results.
        """
        query = request.query_params.get("q", "")
        base_queryset = self.queryset.filter(seller=request.user)
        if query:
            items = base_queryset.filter(
                Q(title__icontains=query)
                | Q(description__icontains=query)
                | Q(category__name__icontains=query)
            )  # Get only their listings
        else:
            items = base_queryset
        page = self.paginate_queryset(items)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["POST"], permission_classes=[IsAuthenticated])
    def request_purchase(self, request, pk=None):
        """
        Creates a purchase request for a listing.

        Args:
            request (Request): The request object.
            pk (int, optional): The primary key of the listing. Defaults to None.

        Returns:
            Response: A response containing the purchase request data.
        """
        listing = self.get_object()
        user = request.user
        # Check if the listing is already sold
        if listing.is_sold:
            return Response(
                {"detail": "This item has already been sold."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if the user is trying to buy their own listing
        if listing.seller == user:
            return Response(
                {"detail": "You cannot purchase your own item."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if PurchaseRequest.objects.filter(
            listing=listing, requester=user, is_active=True
        ).exists():
            return Response(
                {"detail": "You have already requested to purchase this item."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create the purchase request
        purchase_request = PurchaseRequest.objects.create(
            listing=listing, requester=user, is_active=True
        )

        serializer = PurchaseRequestSerializer(purchase_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
