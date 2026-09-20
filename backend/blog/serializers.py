from rest_framework import serializers

from .models import Comment, ContactMessage, Post, Profile, Tag


class ProfileSerializer(serializers.ModelSerializer):
    """One row, read-mostly. skills_list is a convenience for the About page.

    avatar becomes an absolute URL because the view passes request in context.
    """

    skills_list = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = (
            "id",
            "name",
            "headline",
            "bio",
            "about",
            "avatar",
            "location",
            "email",
            "github_url",
            "linkedin_url",
            "website_url",
            "skills",
            "skills_list",
        )

    def get_skills_list(self, obj):
        if not obj.skills:
            return []
        return [part.strip() for part in obj.skills.split(",") if part.strip()]


class TagSerializer(serializers.ModelSerializer):
    """Tiny nested object. Nested on posts so React never has to join by id."""

    class Meta:
        model = Tag
        fields = ("id", "name", "slug")
        read_only_fields = ("slug",)


class CommentSerializer(serializers.ModelSerializer):
    """Public read shape: email is omitted so it never leaks to the blog page."""

    class Meta:
        model = Comment
        fields = ("id", "author_name", "body", "created_at")
        read_only_fields = fields


class CommentCreateSerializer(serializers.ModelSerializer):
    """Write shape for POST /api/posts/{slug}/comments/.

    approved is read-only so a client cannot self-approve. post is set in the
    view from the URL slug, not from the request body.
    """

    class Meta:
        model = Comment
        fields = ("id", "author_name", "email", "body", "approved", "created_at")
        read_only_fields = ("id", "approved", "created_at")

    def validate_body(self, value):
        if not value.strip():
            raise serializers.ValidationError("This field may not be blank.")
        return value


class PostListSerializer(serializers.ModelSerializer):
    """Card on Home / Blog list: excerpt, not the full Markdown body."""

    tags = TagSerializer(many=True, read_only=True)
    author = serializers.CharField(source="author.username", read_only=True)
    reading_time_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "cover_image",
            "status",
            "published_at",
            "tags",
            "author",
            "reading_time_minutes",
        )

    def get_reading_time_minutes(self, obj):
        return _reading_time_minutes(obj.body)


class PostSerializer(serializers.ModelSerializer):
    """Detail + write serializer.

    tags is nested and read-only (the JSON React renders).
    tag_slugs is write-only: send ["django", "react"] to set the M2M.
    comments only appear on retrieve, and only approved ones.
    """

    tags = TagSerializer(many=True, read_only=True)
    tag_slugs = serializers.SlugRelatedField(
        many=True,
        slug_field="slug",
        queryset=Tag.objects.all(),
        source="tags",
        required=False,
        write_only=True,
    )
    author = serializers.CharField(source="author.username", read_only=True)
    comments = serializers.SerializerMethodField()
    reading_time_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "body",
            "cover_image",
            "status",
            "published_at",
            "tags",
            "tag_slugs",
            "author",
            "comments",
            "reading_time_minutes",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "published_at",
            "created_at",
            "updated_at",
        )
        extra_kwargs = {
            "slug": {"required": False},
        }

    def get_comments(self, obj):
        # Prefetched as approved_comments on retrieve; fall back to a filter.
        comments = getattr(obj, "approved_comments", None)
        if comments is None:
            comments = obj.comments.filter(approved=True)
        return CommentSerializer(comments, many=True).data

    def get_reading_time_minutes(self, obj):
        return _reading_time_minutes(obj.body)

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be only whitespace.")
        return value.strip()

    def validate_body(self, value):
        if not value.strip():
            raise serializers.ValidationError("Body cannot be empty.")
        return value


class ContactMessageSerializer(serializers.ModelSerializer):
    """Write-only public form. created_at is assigned by the model."""

    class Meta:
        model = ContactMessage
        fields = ("id", "name", "email", "subject", "message", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty.")
        return value


def _reading_time_minutes(body: str) -> int:
    words = len(body.split())
    return max(1, round(words / 200))
