/**
 * Phase 0 · Promises and async/await — the machinery behind every React data fetch.
 *
 * Run:  node practice/js/02-async.js
 * Goal: replace each TODO until every check prints PASS.
 *
 * No network required. `fakeApi` behaves like `fetch` against your future Django
 * API: it is slow, it can fail, and it hands you data only after you await it.
 */

const DB = {
  "/api/profile/": { name: "Rahul Jangannavar", headline: "Backend-leaning full stack" },
  "/api/posts/": [
    { slug: "hello-world", title: "Hello world" },
    { slug: "why-django", title: "Why I chose Django" },
    { slug: "react-in-one-week", title: "React in one week" },
  ],
  "/api/posts/hello-world/": { slug: "hello-world", title: "Hello world" },
  "/api/posts/why-django/": { slug: "why-django", title: "Why I chose Django" },
  "/api/posts/react-in-one-week/": { slug: "react-in-one-week", title: "React in one week" },
};

function fakeApi(path) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (path in DB) {
        resolve(DB[path]);
      } else {
        reject(new Error(`404 Not Found: ${path}`));
      }
    }, 120);
  });
}

// 1. Return just the profile's name. Mark the function `async` and `await` fakeApi.
async function getProfileName() {
  // TODO
}

// 2. Return how many posts the API reports.
async function getPostCount() {
  // TODO
}

// 3. Return the data on success, or the object { error: <message> } on failure.
//    Wrap the await in try/catch. Every React screen needs this shape:
//    something to render, or something to apologise with.
async function safeGet(path) {
  // TODO
}

// 4. Fetch the profile and the post list AT THE SAME TIME with Promise.all,
//    then return { name, count }. Two sequential awaits would take twice as long.
async function loadHomePage() {
  // TODO
}

// 5. Fetch each slug one after another with a for...of loop and return the titles
//    in the same order. Sometimes sequential is what you actually want.
//    A single post lives at `/api/posts/<slug>/` — mind the trailing slash, Django cares.
async function titlesInOrder(slugs) {
  // TODO
  return [];
}

// ---------------------------------------------------------------------------
// Checks. Leave everything below alone.
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

// Takes a function rather than a value so an unfinished exercise reports a FAIL
// instead of aborting the whole run with an unhandled rejection.
async function check(label, produceActual, expected) {
  let actual;
  try {
    actual = await produceActual();
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

async function main() {
  await check("1. getProfileName", () => getProfileName(), "Rahul Jangannavar");

  await check("2. getPostCount", () => getPostCount(), 3);

  await check("3. safeGet on a good path", () => safeGet("/api/profile/"), DB["/api/profile/"]);

  await check("3. safeGet on a bad path", () => safeGet("/api/nope/"), {
    error: "404 Not Found: /api/nope/",
  });

  const started = Date.now();
  const home = await Promise.resolve(loadHomePage()).catch(
    (error) => `<threw ${error.message}>`,
  );
  const elapsed = Date.now() - started;

  await check("4. loadHomePage", () => home, { name: "Rahul Jangannavar", count: 3 });

  // Each fakeApi call sleeps 120ms, so both in parallel land near 130ms while two
  // sequential awaits land near 250ms.
  await check(
    `4. loadHomePage ran both requests in parallel (took ${elapsed}ms, must land between 100 and 190ms)`,
    () => elapsed >= 100 && elapsed < 190,
    true,
  );

  await check("5. titlesInOrder", () => titlesInOrder(["why-django", "hello-world"]), [
    "Why I chose Django",
    "Hello world",
  ]);

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log("JavaScript side done. Now run practice/python/01_basics.py.");
  }
}

main();
