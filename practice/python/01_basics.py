"""Phase 0 · The Python you will use in every Django model.

Run:  py practice/python/01_basics.py
Goal: replace each TODO until every check prints PASS.

Every exercise here reappears in Phase 1: Django models are classes, `slug` fields
are generated from titles, `reading_time` is a property, and querysets are built out
of the same comprehension thinking.
"""

import math
import re

POSTS = [
    {"title": "Hello world", "status": "published", "tags": ["intro"]},
    {"title": "Why I chose Django", "status": "published", "tags": ["django", "python"]},
    {"title": "Half-finished idea", "status": "draft", "tags": []},
    {"title": "React in one week", "status": "published", "tags": ["react", "intro"]},
]


# 1. Turn a title into a URL-safe slug: lowercase, non-alphanumeric runs collapsed
#    into single hyphens, no hyphen at either end.
#      "Why I Chose Django!"  ->  "why-i-chose-django"
#    Django ships `django.utils.text.slugify`, but write it once yourself so you know
#    what it does. `re.sub` and `str.strip` are all you need.
def slugify(title: str) -> str:
    # TODO
    return ""


# 2. A Post class. Give it:
#      - __init__(self, title, body, status="draft") that also sets self.slug
#        from the title using slugify()
#      - __str__ returning the title, so printing a Post is readable
#      - a `word_count` property: how many whitespace-separated words are in the body
#      - a `reading_time` property: minutes at 200 words per minute, rounded UP,
#        never less than 1
#      - is_published(): True only when status == "published"
class Post:
    def __init__(self, title: str, body: str, status: str = "draft") -> None:
        # TODO
        pass


# 3. A decorator that upper-cases whatever string the function it wraps returns.
#    Decorators are everywhere in Django (@property, @login_required, @receiver),
#    so it is worth writing one by hand exactly once.
def shout(func):
    # TODO: return a wrapper function that calls func and upper-cases the result
    return func


# 4. Titles of the published posts, using a list comprehension (no for-loop body).
def published_titles(posts: list[dict]) -> list[str]:
    # TODO
    return []


# 5. How many posts carry each tag, using a dict comprehension.
#      -> {"intro": 2, "django": 1, "python": 1, "react": 1}
#    Hint: build the set of all tags first, then count with sum(...) inside the comprehension.
def tag_counts(posts: list[dict]) -> dict[str, int]:
    # TODO
    return {}


# ---------------------------------------------------------------------------
# Checks. Leave everything below alone.
# ---------------------------------------------------------------------------

PASSED = 0
FAILED = 0


def check(label: str, produce_actual, expected: object) -> None:
    """Run `produce_actual()` and compare it to `expected`.

    Takes a callable rather than a value so an unfinished exercise reports a FAIL
    instead of aborting the whole run with a traceback.
    """
    global PASSED, FAILED
    try:
        actual = produce_actual()
    except Exception as exc:
        actual = f"<raised {type(exc).__name__}: {exc}>"

    if actual == expected:
        PASSED += 1
        print(f"PASS  {label}")
    else:
        FAILED += 1
        print(f"FAIL  {label}")
        print(f"      expected {expected!r}")
        print(f"      got      {actual!r}")


@shout
def greet(name: str) -> str:
    return f"hi {name}"


def main() -> None:
    check("1. slugify a plain title", lambda: slugify("Hello world"), "hello-world")
    check("1. slugify punctuation", lambda: slugify("Why I Chose Django!"), "why-i-chose-django")
    check("1. slugify messy spacing", lambda: slugify("  React --- in one week  "), "react-in-one-week")

    body = " ".join(["word"] * 450)

    def published_post() -> Post:
        return Post("React in one week", body, status="published")

    check("2. Post sets a slug from the title", lambda: published_post().slug, "react-in-one-week")
    check("2. Post prints as its title", lambda: str(published_post()), "React in one week")
    check("2. Post.word_count", lambda: published_post().word_count, 450)
    check("2. Post.reading_time rounds up", lambda: published_post().reading_time, 3)
    check("2. Post.reading_time is never zero", lambda: Post("Tiny", "one word").reading_time, 1)
    check("2. Post.is_published when published", lambda: published_post().is_published(), True)
    check("2. Post.is_published on a draft", lambda: Post("Draft", "text").is_published(), False)

    check("3. shout decorator", lambda: greet("rahul"), "HI RAHUL")

    check(
        "4. published_titles",
        lambda: published_titles(POSTS),
        ["Hello world", "Why I chose Django", "React in one week"],
    )

    check(
        "5. tag_counts",
        lambda: tag_counts(POSTS),
        {"intro": 2, "django": 1, "python": 1, "react": 1},
    )

    print(f"\n{PASSED} passed, {FAILED} failed")
    if FAILED == 0:
        print("Phase 0 practice complete. You are ready for Phase 1: the real Django project.")


if __name__ == "__main__":
    main()
