from rest_framework import permissions


class IsAuthor(permissions.BasePermission):
    """Object-level: anyone may read; only the post's author may write.

    Pair this with IsAuthenticatedOrReadOnly. The class-level permission
    handles anonymous POST (401). This class handles "logged in as someone
    else" PATCH/DELETE (403).
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author_id == request.user.id
