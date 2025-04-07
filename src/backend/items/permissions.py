from rest_framework import permissions


class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow sellers of a listing to edit or delete it.
    This is an object level permission ONLY
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request (GET)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the seller (e.g. PUT, PATCH, DELETE)
        return obj.seller == request.user
