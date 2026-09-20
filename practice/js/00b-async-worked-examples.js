/**
 * Phase 0 · Worked examples for promises and async/await.
 *
 * Run:  node practice/js/00b-async-worked-examples.js
 *
 * Read this before (or alongside) 02-async.js. It uses a fake LIBRARY api, not the
 * blog api, so nothing here drops straight into an answer.
 *
 * Watch the printed timings as much as the values — with async code, HOW LONG
 * something took is usually the thing that tells you whether you got it right.
 */

// A stand-in for a slow server. Resolving means "success, here is your data";
// rejecting means "failure, here is why".
function libraryApi(path) {
  const DATA = {
    "/books/dune/": { title: "Dune", author: "Herbert", pages: 412 },
    "/books/emma/": { title: "Emma", author: "Austen", pages: 474 },
    "/authors/": ["Herbert", "Austen", "Gibson"],
  };

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (path in DATA) {
        resolve(DATA[path]);
      } else {
        reject(new Error(`404 Not Found: ${path}`));
      }
    }, 80);
  });
}

const since = (startedAt) => `${Date.now() - startedAt}ms`;

async function main() {
  console.log("=== 1. A promise is a receipt, not the goods ===");
  // Calling libraryApi does NOT give you the book. It gives you an object that
  // promises to hold a book about 80ms from now.
  const receipt = libraryApi("/books/dune/");
  console.log(receipt);
  console.log("is it a promise?", receipt instanceof Promise);

  console.log("\n=== 2. `await` waits for the receipt to be filled ===");
  // `await` pauses this function until the promise settles, then unwraps the value.
  let startedAt = Date.now();
  const dune = await libraryApi("/books/dune/");
  console.log(dune, "took", since(startedAt));
  // You can only use `await` inside a function marked `async` — which is why every
  // exercise in 02-async.js already has `async` in front of it.

  console.log("\n=== 3. The mistake you will make at least once ===");
  // Forget the await and you are holding the receipt, not the book. Every field
  // reads as undefined, and nothing errors, which makes it confusing to spot.
  const notAwaited = libraryApi("/books/emma/");
  console.log("title without await:", notAwaited.title); // undefined
  console.log("title with await:   ", (await libraryApi("/books/emma/")).title);

  console.log("\n=== 4. An async function ALWAYS hands back a promise ===");
  async function getAuthorOf(slug) {
    const book = await libraryApi(`/books/${slug}/`);
    return book.author; // looks like a plain string...
  }
  const promised = getAuthorOf("dune");
  console.log("what the caller receives:", promised); // ...but it is wrapped
  console.log("after awaiting it:", await promised);
  // So callers of your exercise functions must await them too. The checker does.

  console.log("\n=== 5. Building a path from a variable ===");
  // Template literals are how you slot a slug into a url. Mind the trailing slash:
  // Django treats /books/dune and /books/dune/ as different urls.
  const slug = "emma";
  console.log(`/books/${slug}/`);

  console.log("\n=== 6. Failure: a rejected promise throws where you await it ===");
  // Without protection, an await on a rejected promise crashes the function.
  try {
    await libraryApi("/books/nope/");
    console.log("this line never runs");
  } catch (error) {
    // `error` is the Error object that was rejected. .message is the text.
    console.log("caught:", error.message);
  }

  console.log("\n=== 7. Returning a result OR an error, never crashing ===");
  // Real screens need something to render either way, so the usual shape is
  // "give me the data, or give me an object describing what went wrong".
  async function safeLookup(path) {
    try {
      const data = await libraryApi(path);
      return data;
    } catch (error) {
      return { error: error.message };
    }
  }
  console.log("good path:", await safeLookup("/authors/"));
  console.log("bad path: ", await safeLookup("/books/missing/"));
  // Note both branches RETURN. A catch block that only console.logs returns
  // undefined, which is the most common way this exercise fails.

  console.log("\n=== 8. Sequential vs parallel — the same work, half the time ===");
  // Two awaits on separate lines means: finish the first, THEN start the second.
  startedAt = Date.now();
  const first = await libraryApi("/books/dune/");
  const second = await libraryApi("/books/emma/");
  console.log(`sequential: ${first.title} + ${second.title} took ${since(startedAt)}`);

  // Promise.all starts both immediately and waits for the slower one. It takes an
  // ARRAY of promises and resolves to an ARRAY of results, in the same order.
  startedAt = Date.now();
  const [a, b] = await Promise.all([libraryApi("/books/dune/"), libraryApi("/books/emma/")]);
  console.log(`Promise.all: ${a.title} + ${b.title} took ${since(startedAt)}`);
  // Notice there is no `await` inside the brackets — you hand Promise.all the
  // unfinished promises and await the whole group once.
  // If any one of them rejects, the whole Promise.all rejects.

  console.log("\n=== 9. When you DO want them one at a time ===");
  // A for...of loop with an await inside runs strictly in order. Slower, but the
  // results land in a predictable sequence, and each call can depend on the last.
  startedAt = Date.now();
  const wanted = ["emma", "dune"];
  const titles = [];
  for (const each of wanted) {
    const book = await libraryApi(`/books/${each}/`);
    titles.push(book.title); // build the array up as you go
  }
  console.log(titles, "took", since(startedAt));

  console.log("\n=== 10. Why .map() with async surprises people ===");
  // An async callback returns a promise, so .map() gives you an array OF PROMISES,
  // not an array of books.
  const promises = wanted.map((each) => libraryApi(`/books/${each}/`));
  console.log("what .map gave back:", promises);
  // Feed that array to Promise.all to unwrap it. This is the idiomatic "fetch many
  // things at once" line you will write in React constantly.
  const books = await Promise.all(promises);
  console.log(
    "after Promise.all:",
    books.map((eachBook) => eachBook.title),
  );

  console.log("\n=== 11. What real fetch() looks like ===");
  // The real thing needs TWO awaits: one for the response headers to arrive, and
  // one for the body to finish downloading and be parsed as JSON.
  //
  //   const response = await fetch("http://127.0.0.1:8000/api/posts/");
  //   if (!response.ok) throw new Error(`HTTP ${response.status}`);
  //   const data = await response.json();
  //
  // Two things worth knowing now, because they cause real bugs in Phase 4:
  //   - fetch does NOT reject on 404 or 500. It resolves with ok === false, so you
  //     have to check response.ok yourself. It only rejects if the network failed.
  //   - response.json() is itself async, which is why it needs its own await.
  //
  // Written as one line, that is the expression from your Phase 0 goal:
  //   const data = await (await fetch(url)).json();

  console.log("\nNow open 02-async.js and fix one TODO at a time.");
}

main();
