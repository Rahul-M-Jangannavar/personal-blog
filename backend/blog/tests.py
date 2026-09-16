from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from .models import Comment, ContactMessage, Post, Profile, Tag


class TagModelTests(TestCase):
    def test_slug_is_generated_from_name(self):
        tag = Tag.objects.create(name="Django REST")
        self.assertEqual(tag.slug, "django-rest")


class PostModelTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="rahul",
            password="unused-in-tests",
        )

    def test_slug_is_generated_from_title(self):
        post = Post.objects.create(
            title="Hello Django World",
            excerpt="A first post.",
            body="Body text.",
            author=self.user,
        )
        self.assertEqual(post.slug, "hello-django-world")
        self.assertEqual(post.status, Post.Status.DRAFT)
        self.assertIsNone(post.published_at)

    def test_publishing_sets_published_at(self):
        post = Post.objects.create(
            title="Going live",
            excerpt="Now public.",
            body="Body text.",
            author=self.user,
            status=Post.Status.PUBLISHED,
        )
        self.assertIsNotNone(post.published_at)

    def test_published_queryset_hides_drafts_and_future_posts(self):
        Post.objects.create(
            title="Draft",
            excerpt="Not ready.",
            body="Body.",
            author=self.user,
            status=Post.Status.DRAFT,
        )
        live = Post.objects.create(
            title="Live post",
            excerpt="Ready.",
            body="Body.",
            author=self.user,
            status=Post.Status.PUBLISHED,
            published_at=timezone.now() - timedelta(hours=1),
        )
        Post.objects.create(
            title="Scheduled",
            excerpt="Tomorrow.",
            body="Body.",
            author=self.user,
            status=Post.Status.PUBLISHED,
            published_at=timezone.now() + timedelta(days=1),
        )

        published = list(Post.objects.published())
        self.assertEqual(published, [live])


class APITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="rahul",
            password="test-pass-123",
        )
        self.profile = Profile.objects.create(
            name="Rahul",
            headline="Learning React and Django",
            bio="Hello.",
            email="rahul@example.com",
            skills="Python, Django, React",
        )
        self.tag = Tag.objects.create(name="Django")
        self.post = Post.objects.create(
            title="First published post",
            excerpt="An excerpt.",
            body=" ".join(["word"] * 400),
            author=self.user,
            status=Post.Status.PUBLISHED,
        )
        self.post.tags.add(self.tag)
        self.draft = Post.objects.create(
            title="Secret draft",
            excerpt="Not ready.",
            body="Draft body.",
            author=self.user,
            status=Post.Status.DRAFT,
        )

    def test_profile_returns_a_single_object(self):
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Rahul")
        self.assertEqual(response.data["skills_list"], ["Python", "Django", "React"])
        self.assertNotIn("results", response.data)

    def test_post_list_hides_drafts_and_is_paginated(self):
        response = self.client.get("/api/posts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = [row["slug"] for row in response.data["results"]]
        self.assertEqual(slugs, ["first-published-post"])
        self.assertIn("count", response.data)
        self.assertNotIn("body", response.data["results"][0])

    def test_post_detail_includes_body_and_reading_time(self):
        response = self.client.get("/api/posts/first-published-post/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("body", response.data)
        self.assertEqual(response.data["reading_time_minutes"], 2)
        self.assertEqual(response.data["tags"][0]["slug"], "django")

    def test_anonymous_cannot_create_a_post(self):
        response = self.client.post(
            "/api/posts/",
            {"title": "Nope", "excerpt": "x", "body": "y"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_jwt_can_create_and_anonymous_cannot_see_drafts(self):
        token = self.client.post(
            "/api/auth/token/",
            {"username": "rahul", "password": "test-pass-123"},
            format="json",
        )
        self.assertEqual(token.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.data['access']}")

        response = self.client.post(
            "/api/posts/",
            {
                "title": "From the studio",
                "excerpt": "Written via API.",
                "body": "Full markdown body.",
                "tag_slugs": ["django"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], Post.Status.DRAFT)
        self.assertEqual(response.data["author"], "rahul")

        self.client.credentials()
        public = self.client.get("/api/posts/from-the-studio/")
        self.assertEqual(public.status_code, status.HTTP_404_NOT_FOUND)

    def test_comment_is_created_unapproved(self):
        response = self.client.post(
            "/api/posts/first-published-post/comments/",
            {
                "author_name": "Ada",
                "email": "ada@example.com",
                "body": "Nice post.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(response.data["approved"])
        comment = Comment.objects.get()
        self.assertFalse(comment.approved)

        detail = self.client.get("/api/posts/first-published-post/")
        self.assertEqual(detail.data["comments"], [])

    def test_contact_creates_a_message(self):
        response = self.client.post(
            "/api/contact/",
            {
                "name": "Ada",
                "email": "ada@example.com",
                "subject": "Hello",
                "message": "Loved the blog.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 1)
        self.assertEqual(
            self.client.get("/api/contact/").status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def test_search_and_tag_query_params(self):
        tagged = self.client.get("/api/posts/?tag=django")
        self.assertEqual(tagged.data["count"], 1)
        missing = self.client.get("/api/posts/?tag=react")
        self.assertEqual(missing.data["count"], 0)
        search = self.client.get("/api/posts/?search=published")
        self.assertEqual(search.data["count"], 1)
