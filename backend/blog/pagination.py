from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """?page=2 — the shape React will read in Phase 4.

    Response is {count, next, previous, results}. page_size is overridable
    with ?page_size= but capped so a client cannot dump the whole table.
    """

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50
