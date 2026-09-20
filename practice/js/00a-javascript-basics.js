/**
 * Phase 0 · JavaScript from zero.
 *
 * Run:  node practice/js/00a-javascript-basics.js
 *
 * Start here if functions and syntax are still fuzzy. Read a section, look at what
 * it printed, then move on. Nothing here is an exercise — there is nothing to fix.
 *
 * The goal is section 9: understanding that a function can be handed to another
 * function. Once that clicks, .filter() and .map() stop being magic.
 */

console.log("=== 1. Storing values ===");
// `const` for a value that never gets reassigned. `let` when it will change.
// Prefer const — if you reassign it by mistake, JS tells you instead of silently
// carrying on. (You will see `var` in old tutorials. Ignore it.)
const name = "Rahul";
let visits = 0;
visits = visits + 1;
visits += 1; // shorthand for the same thing
console.log(name, visits);

console.log("\n=== 2. The types you will actually meet ===");
const text = "a string, in single or double quotes";
const count = 42; // no separate int/float, just numbers
const isPublished = true; // or false
const nothingYet = null; // deliberately empty
let notSetAtAll; // undefined: never given a value
console.log(typeof text, typeof count, typeof isPublished, nothingYet, notSetAtAll);

console.log("\n=== 3. Objects — a labelled bag of values ===");
// Keys on the left, values on the right, commas between pairs.
const post = {
  title: "Hello world",
  words: 320,
  published: true,
};
console.log(post.title); // read a field with a dot
console.log(post["title"]); // same thing, useful when the key is in a variable

post.words = 350; // you can change a field of a const object...
console.log(post.words);
// ...because `const` freezes the VARIABLE, not the contents. This line would fail:
//   post = { title: "Something else" };

console.log(post.missingField); // undefined, not an error

console.log("\n=== 4. Arrays — an ordered list ===");
const tags = ["react", "django", "python"];
console.log(tags[0]); // counting starts at 0
console.log(tags[2], tags.length); // last item is at length - 1
console.log(tags[99]); // undefined, still not an error

// An array of objects is the single most common shape in web work. It is exactly
// what your Django API will hand back.
const posts = [
  { title: "Hello world", words: 320 },
  { title: "Why Django", words: 780 },
];
console.log(posts[1].title); // index into the array, then dot into the object

console.log("\n=== 5. Functions — a named, reusable block ===");
// `function` names it, the ( ) hold the inputs, `return` hands a value back out.
function double(number) {
  return number * 2;
}
console.log(double(5), double(10)); // calling it: the ( ) are what run it
console.log(double); // without ( ) you get the function itself, not a result

// THE most common beginner trap. These two are not the same:
function printsIt(number) {
  console.log(number * 2); // shows it on screen, hands nothing back
}
function returnsIt(number) {
  return number * 2; // hands the value back to whoever called
}
const a = printsIt(5); // prints 10
const b = returnsIt(5); // prints nothing
console.log("printsIt gave back:", a, "| returnsIt gave back:", b);
// The exercises are graded on what you RETURN. A console.log alone always fails.

console.log("\n=== 6. Arrow functions — the same thing, shorter ===");
// React and modern JS are written almost entirely in arrows. All three below
// are the same function:
const doubleLong = function (number) {
  return number * 2;
};
const doubleArrow = (number) => {
  return number * 2;
};
const doubleShort = (number) => number * 2;
console.log(doubleLong(3), doubleArrow(3), doubleShort(3));

// Dropping the braces means "return this expression automatically". Watch out:
const withBraces = (number) => {
  number * 2;
}; // no `return`, so it gives back undefined
console.log("braces but no return:", withBraces(3));

console.log("\n=== 7. Comparing and deciding ===");
console.log(3 === 3, "3" === 3); // true, false — === also compares the type
console.log("3" == 3); // true — == converts types first. Never use it.
console.log(3 !== 4, 3 < 4, 3 >= 3);

function label(words) {
  if (words > 1000) {
    return "long";
  } else if (words > 300) {
    return "medium";
  }
  return "short"; // reaching a `return` exits the function immediately
}
console.log(label(1500), label(500), label(100));

// A ternary is an if/else squeezed into one expression. React uses these
// constantly, because you cannot put an `if` statement inside JSX.
const status = 500 > 300 ? "medium or long" : "short";
console.log(status);

console.log("\n=== 8. Loops — do something for each item ===");
for (const tag of tags) {
  console.log("  tag:", tag);
}
for (const item of posts) {
  console.log(`  ${item.title} has ${item.words} words`);
}

console.log("\n=== 9. Callbacks — handing a function to a function ===");
// This is the idea everything else rests on. A function is just a value, like a
// number or a string, so it can be passed as an argument.

function shout(word) {
  return word.toUpperCase();
}

function applyToEach(list, transform) {
  const output = [];
  for (const item of list) {
    output.push(transform(item)); // call whatever function we were handed
  }
  return output;
}

console.log(applyToEach(tags, shout)); // pass it by name — no ( ) here
console.log(applyToEach(tags, (tag) => tag.length)); // or define it right there

// applyToEach IS .map(). You just wrote it. Proof:
console.log(tags.map(shout));

// And filter is the same idea, keeping items instead of transforming them:
function keepIf(list, test) {
  const output = [];
  for (const item of list) {
    if (test(item)) {
      output.push(item);
    }
  }
  return output;
}
console.log(keepIf(tags, (tag) => tag.length > 5));
console.log(tags.filter((tag) => tag.length > 5)); // identical result

// So when you write:
//     posts.filter((post) => post.words > 500)
// you are handing filter a small function, and filter runs it once per post.
// You never call that function yourself — filter does, behind the scenes.
// The name `post` is just the parameter name you chose for "the current item".

console.log("\n=== 10. Prove the callback really runs, once per item ===");
posts.filter((item) => {
  console.log(`  filter is now looking at: ${item.title}`);
  return item.words > 500;
});

console.log("\nNext: node practice/js/00-worked-examples.js");
