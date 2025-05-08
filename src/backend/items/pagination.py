from rest_framework.pagination import PageNumberPagination


class HttpsPageNumberPagination(PageNumberPagination):
    def get_next_link(self):
        url = super().get_next_link()
        return url.replace("http://", "https://") if url else None

    def get_previous_link(self):
        url = super().get_previous_link()
        return url.replace("http://", "https://") if url else None
