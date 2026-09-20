/**
 * Phase 0 · Worked examples — read this when 01-basics.js has you stuck.
 *
 * Run:  node practice/js/00-worked-examples.js
 *
 * Every pattern from 01-basics.js is demonstrated here on a DIFFERENT dataset
 * (books, not posts). Nothing here can be copy-pasted into the exercises — you
 * have to understand the shape and rewrite it. That is the point.
 *
 * Read a section, run the file, then go do the matching exercise.
 */

const books = [
  { title: "Dune", author: "Herbert", year: 1965, pages: 412, genres: ["scifi"] },
  { title: "Emma", author: "Austen", year: 1815, pages: 474, genres: ["classic", "romance"] },
  { title: "Neuromancer", author: "Gibson", year: 1984, pages: 271, genres: ["scifi", "cyberpunk"] },
  { title: "Untitled", author: null, year: 2026, pages: 12, genres: [] },
];

console.log("=== 1. .filter() — keep some items, drop the rest ===");
// filter() walks the array and calls your function once per item. Return true to
// keep the item, false to drop it. It hands you a NEW array; `books` is untouched.
const oldBooks = books.filter((book) => book.year < 1900);
console.log(oldBooks);
// The parameter name `book` is yours to choose. These three lines are identical:
//   books.filter((book) => book.year < 1900)
//   books.filter((b) => b.year < 1900)
//   books.filter(function (book) { return book.year < 1900; })
// An arrow function with no { } braces returns its expression automatically.

console.log("\n=== 2. .map() — transform every item, keep the count the same ===");
// map() calls your function once per item and collects whatever you return.
// 4 books in, 4 strings out.
const titles = books.map((book) => book.title);
console.log(titles);

console.log("\n=== 3. Chaining filter then map ===");
// filter() returns an array, so you can call .map() straight on the result.
// Read it left to right: take the books, keep the scifi ones, then take their titles.
const scifiTitles = books.filter((book) => book.genres.includes("scifi")).map((book) => book.title);
console.log(scifiTitles);
// -> exercise 1 in 01-basics.js is exactly this shape.

console.log("\n=== 4. .reduce() — squash an array down to one value ===");
// reduce() is the confusing one, so go slowly. It takes TWO arguments:
//   1. a function receiving (runningTotal, currentItem)
//   2. the starting value for runningTotal
// Whatever the function returns becomes the runningTotal for the next item.
const totalPages = books.reduce((runningTotal, book) => runningTotal + book.pages, 0);
console.log(totalPages);

// Step by step, so it stops being magic:
let trace = 0;
for (const book of books) {
  const before = trace;
  trace = trace + book.pages;
  console.log(`  ${before} + ${book.pages} (${book.title}) = ${trace}`);
}
// -> exercise 2 does this with `words` instead of `pages`.

console.log("\n=== 5. .find() — the FIRST matching item, not an array ===");
// Same callback style as filter, but it stops at the first true and hands you
// the item itself. Returns undefined when nothing matches.
const firstShort = books.find((book) => book.pages < 300);
console.log(firstShort);
console.log(books.find((book) => book.pages > 9999)); // undefined

console.log("\n=== 6. Sorting WITHOUT mutating the original ===");
// .sort() rearranges the array you call it on, which is a problem in React:
// mutating state means the screen does not re-render. So copy first with [...].
// The comparator gets two items and must return:
//   negative -> a comes first,  0 -> tie,  positive -> b comes first.
const newestFirst = [...books].sort((a, b) => b.year - a.year);
console.log(newestFirst.map((book) => `${book.title}(${book.year})`));
console.log("original order is intact:", books.map((book) => book.title));

// `b.year - a.year` only works for numbers. For strings — including ISO dates
// like "2026-03-02", which sort correctly as plain text — use localeCompare:
const byAuthor = [...books].sort((a, b) => (a.author ?? "").localeCompare(b.author ?? ""));
console.log(byAuthor.map((book) => book.author));
// -> exercise 4 sorts on a date string, so localeCompare is the tool.

console.log("\n=== 7. Template literals — build a string from values ===");
// Backticks, not quotes. ${...} drops any expression into the text.
const book = books[0];
console.log(`${book.title} by ${book.author}, ${book.pages} pages`);
console.log(`Half of it is ${book.pages / 2} pages`); // any expression works

console.log("\n=== 8. Destructuring — pull fields out by name ===");
// Instead of repeating `book.` everywhere, unpack what you need.
const { title, year } = book;
console.log(title, year);

// You can do it right in the parameter list, which is how React components
// receive props. These two functions behave identically:
function describeLong(someBook) {
  return `${someBook.title} (${someBook.year})`;
}
function describeShort({ title, year }) {
  return `${title} (${year})`;
}
console.log(describeLong(book), "|", describeShort(book));

// Arrays destructure by POSITION rather than by name:
const [firstGenre] = books[1].genres;
console.log("first genre:", firstGenre);
// An empty array gives you undefined rather than an error:
const [missingGenre] = books[3].genres;
console.log("first genre of a book with none:", missingGenre);
// -> exercises 5 and 8.

console.log("\n=== 9. Spread — copy an object and change part of it ===");
// ...book copies every field of book into the new object. Fields listed AFTER
// the spread overwrite what came from it.
const reissued = { ...book, year: 2020 };
console.log(reissued);
console.log("the original is unchanged:", book.year);

// Adding a brand new field works the same way:
const withRating = { ...book, rating: 5 };
console.log(withRating.rating, "| original has:", book.rating); // undefined
// -> exercise 6.

console.log("\n=== 10. ?. and ?? — surviving missing data ===");
// Reading a field of null crashes. Uncomment to see it:
//   console.log(books[3].author.length);   // TypeError
// ?. stops and gives undefined instead of throwing:
console.log(books[3].author?.length); // undefined, no crash

// ?? supplies a fallback, but ONLY for null and undefined:
console.log(books[3].author ?? "Anonymous"); // "Anonymous"
console.log(books[0].author ?? "Anonymous"); // "Herbert"

// They combine, and that combination is everywhere in real React code:
console.log(books[3].author?.toUpperCase() ?? "ANONYMOUS");

// Careful: || falls back on ANY falsy value, so 0 and "" trigger it too.
console.log("with ?? ->", 0 ?? 99, " with || ->", 0 || 99);
// -> exercise 7.

console.log("\nNow go back to 01-basics.js and fix one TODO at a time.");
