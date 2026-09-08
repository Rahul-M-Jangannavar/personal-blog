/**
 * Phase 0 · The JavaScript you will use in every React component.
 *
 * Run:  node practice/js/01-basics.js
 * Goal: replace each TODO until every check prints PASS.
 *
 * The `posts` array below is deliberately shaped like the JSON your Django API
 * will return in Phase 2, so the practice transfers directly.
 */

const posts = [
  {
    id: 1,
    title: "Hello world",
    status: "published",
    words: 320,
    tags: ["intro"],
    publishedAt: "2026-01-10",
    author: { name: "Rahul" },
  },
  {
    id: 2,
    title: "Why I chose Django",
    status: "published",
    words: 780,
    tags: ["django", "python"],
    publishedAt: "2026-03-02",
    author: { name: "Rahul" },
  },
  {
    id: 3,
    title: "Half-finished idea",
    status: "draft",
    words: 90,
    tags: [],
    publishedAt: null,
    author: null,
  },
  {
    id: 4,
    title: "React in one week",
    status: "published",
    words: 1450,
    tags: ["react", "intro"],
    publishedAt: "2026-02-14",
    author: { name: "Rahul" },
  },
];

// 1. Titles of the published posts only, in their original order.
//    Chain .filter() then .map() — this is the single most common line in React.
function publishedTitles(all) {
  // TODO
  return [];
}

// 2. Total word count across every post, using .reduce().
function totalWords(all) {
  // TODO
  return 0;
}

// 3. The first post still in draft, using .find().
function firstDraft(all) {
  // TODO
}

// 4. Published posts sorted newest first, WITHOUT changing `all`.
//    .sort() mutates the array it is called on, so copy it first with [...all].
//    React re-renders based on new arrays, so never mutating is a habit worth building.
function newestFirst(all) {
  // TODO
  return [];
}

// 5. A one-line summary like "React in one week — 1450 words".
//    Destructure `title` and `words` in the parameter list, and use a template literal.
function summarize(post) {
  // TODO
  return "";
}

// 6. A NEW post object with an `excerpt` field added, leaving the original untouched.
//    Use the spread operator.
function withExcerpt(post, excerpt) {
  // TODO
  return post;
}

// 7. The author's name, falling back to "Anonymous" when there is no author.
//    Use optional chaining (?.) with nullish coalescing (??).
function authorName(post) {
  // TODO
  return "";
}

// 8. The post's first tag, or "untagged" when it has none.
//    Destructure the first element out of the tags array.
function firstTag(post) {
  // TODO
  return "";
}

// ---------------------------------------------------------------------------
// Checks. Leave everything below alone.
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

// Takes a function rather than a value so an unfinished exercise reports a FAIL
// instead of aborting the whole run with a stack trace.
function check(label, produceActual, expected) {
  let actual;
  try {
    actual = produceActual();
  } catch (error) {
    actual = `<threw ${error.name}: ${error.message}>`;
  }

  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    passed += 1;
    console.log(`PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`FAIL  ${label}`);
    console.log(`      expected ${JSON.stringify(expected)}`);
    console.log(`      got      ${JSON.stringify(actual)}`);
  }
}

check("1. publishedTitles", () => publishedTitles(posts), [
  "Hello world",
  "Why I chose Django",
  "React in one week",
]);

check("2. totalWords", () => totalWords(posts), 2640);

check("3. firstDraft", () => firstDraft(posts)?.title, "Half-finished idea");

check(
  "4. newestFirst",
  () => newestFirst(posts).map((post) => post.title),
  ["Why I chose Django", "React in one week", "Hello world"],
);

check(
  "4. (guard) newestFirst left the original array alone",
  () => posts.map((post) => post.id),
  [1, 2, 3, 4],
);

check("5. summarize", () => summarize(posts[3]), "React in one week — 1450 words");

check(
  "6. withExcerpt adds the field",
  () => withExcerpt(posts[0], "A short hello.").excerpt,
  "A short hello.",
);

check("6. (guard) withExcerpt did not touch the original", () => posts[0].excerpt, undefined);

check("7. authorName with an author", () => authorName(posts[0]), "Rahul");

check("7. authorName without an author", () => authorName(posts[2]), "Anonymous");

check("8. firstTag with tags", () => firstTag(posts[1]), "django");

check("8. firstTag without tags", () => firstTag(posts[2]), "untagged");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log("Now move on to 02-async.js.");
}
