from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Profile(models.Model):
    """The single introduction shown on Home and About. Create one row in admin."""

    name = models.CharField(max_length=120)
    headline = models.CharField(
        max_length=200,
        help_text='Short line under your name, e.g. "Software engineer learning React".',
    )
    bio = models.TextField(help_text="Full introduction. Markdown is fine; React will render it later.")
    about = models.TextField(
        blank=True,
        help_text="About me. Markdown is fine; React will render it later.",
    )
    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        help_text="Optional photo. Files land in MEDIA_ROOT/avatars/.",
    )
    location = models.CharField(max_length=120, blank=True)
    email = models.EmailField()
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(
        max_length=60,
        unique=True,
        blank=True,
        help_text="URL-safe version of the name. Leave blank to generate from the name.",
    )

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class PostQuerySet(models.QuerySet):
    def published(self):
        """Posts the public site should show: published, and not dated in the future."""
        return self.filter(
            status=Post.Status.PUBLISHED,
            published_at__isnull=False,
            published_at__lte=timezone.now(),
        )


class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    title = models.CharField(max_length=200)
    slug = models.SlugField(
        max_length=220,
        unique=True,
        blank=True,
        help_text="Used in /blog/<slug>/. Leave blank to generate from the title.",
    )
    excerpt = models.CharField(
        max_length=300,
        help_text="One or two sentences for cards on Home and the post list.",
    )
    body = models.TextField(help_text="Post content in Markdown.")
    cover_image = models.ImageField(upload_to="covers/", blank=True)
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    published_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this went (or will go) live. Set automatically the first time you publish.",
    )
    tags = models.ManyToManyField(Tag, related_name="posts", blank=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = PostQuerySet.as_manager()

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if self.status == self.Status.PUBLISHED and self.published_at is None:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author_name = models.CharField(max_length=80)
    email = models.EmailField(help_text="Not shown publicly; used if you want to reply.")
    body = models.TextField()
    approved = models.BooleanField(
        default=False,
        help_text="Hidden from the public site until you tick this in admin.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.author_name} on {self.post}"


class ContactMessage(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.subject} from {self.name}"
