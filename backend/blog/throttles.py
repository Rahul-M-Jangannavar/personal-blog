from rest_framework.throttling import AnonRateThrottle


class CommentRateThrottle(AnonRateThrottle):
    scope = "comment"


class ContactRateThrottle(AnonRateThrottle):
    scope = "contact"
