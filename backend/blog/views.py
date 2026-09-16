from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from .models import Comment, ContactMessage, Post, Profile, Tag
from .permissions import IsAuthor
from .serializers import (
    CommentCreateSerializer,
    ContactMessageSerializer,
    PostListSerializer,
    PostSerializer,
    ProfileSerializer,
    TagSerializer,
)
from .throttles import CommentRateThrottle, ContactRateThrottle


class ProfileViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Singleton: GET /api/profile/ returns one object, not a paginated list.

    ReadOnlyModelViewSet would also expose /api/profile/{pk}/, which this
    blog does not need. ListModelMixin + GenericViewSet keeps the router
    happy and we override list() to unwrap the single row.
    """

    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    queryset = Profile.objects.all()

    def list(self, request, *args, **kwargs):
        profile = Profile.objects.first()
        if profile is None:
            raise NotFound("Create a Profile in /admin/ first.")
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/tags/ and /api/tags/{slug}/. No writes — tags are curated in admin."""

    serializer_class = TagSerializer
    permission_classes = [AllowAny]
    queryset = Tag.objects.all()
    lookup_field = "slug"
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


class PostViewSet(viewsets.ModelViewSet):
    """Full CRUD. lookup_field=slug so URLs read /api/posts/my-first-post/.

    Anonymous readers see Post.objects.published(). A JWT owner sees drafts
    too, which is what the studio UI in Phase 4 needs.
    """

    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthor]
    lookup_field = "slug"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["status"]
    search_fields = ["title", "excerpt", "body"]
    ordering_fields = ["published_at", "created_at"]

    def get_queryset(self):
        qs = Post.objects.select_related("author").prefetch_related("tags")
        if self.action == "retrieve":
            qs = qs.prefetch_related(
                Prefetch(
                    "comments",
                    queryset=Comment.objects.filter(approved=True),
                    to_attr="approved_comments",
                )
            )
        if self.request.user.is_authenticated:
            return qs
        return qs.published()

    def get_serializer_class(self):
        if self.action == "list":
            return PostListSerializer
        return PostSerializer

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        tag = self.request.query_params.get("tag")
        if tag:
            queryset = queryset.filter(tags__slug=tag).distinct()
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[AllowAny],
        throttle_classes=[CommentRateThrottle],
        url_path="comments",
    )
    def comments(self, request, slug=None):
        """POST /api/posts/{slug}/comments/ — always saved with approved=False."""
        post = self.get_object()
        serializer = CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(post=post, approved=False)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ContactMessageViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """POST /api/contact/ only. No list/retrieve — you read these in admin."""

    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ContactRateThrottle]
    queryset = ContactMessage.objects.all()
