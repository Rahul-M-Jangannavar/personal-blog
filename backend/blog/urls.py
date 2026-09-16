from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ContactMessageViewSet, PostViewSet, ProfileViewSet, TagViewSet

router = DefaultRouter()
router.register("profile", ProfileViewSet, basename="profile")
router.register("posts", PostViewSet, basename="post")
router.register("tags", TagViewSet, basename="tag")
router.register("contact", ContactMessageViewSet, basename="contact")

urlpatterns = [
    path("", include(router.urls)),
]
