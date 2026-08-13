/**
 * A regex-literal-shaped string: `/pattern/flags`.
 *
 * The pattern group is greedy, so the *last* slash is the closing delimiter.
 * That is what makes a slash inside the pattern work — `/a/b/g` is the pattern
 * `a/b` with flag `g`, not the pattern `a` with flags `b`.
 *
 * `.` does not match a newline, so a string whose pattern spans one is not
 * recognised as a literal and is used verbatim instead. That is a quirk rather
 * than a design, but it is what 1.x did and changing it would quietly hand
 * existing callers a different regex.
 */
const literal = /^\/(.*)\/([a-z]*)$/;

/**
 * Build a `RegExp` from a `"/pattern/flags"` string.
 *
 * A string that is not literal-shaped becomes the pattern itself, with no
 * flags — `newRegExp("hello")` is `/hello/`. A `RegExp` is returned as-is.
 *
 * @throws {SyntaxError} if the pattern or the flags are invalid — whatever the
 *   `RegExp` constructor itself throws.
 */
export default function newRegExp(input: string | RegExp): RegExp {
  // Not `instanceof`: a RegExp from another realm — a vm context, an iframe, a
  // worker — has a different prototype and fails that check while still being
  // a RegExp.
  if (Object.prototype.toString.call(input) === "[object RegExp]") {
    return input as RegExp;
  }
  if (!literal.test(input as string)) return new RegExp(input as string);
  const [, pattern, flags] = (input as string).match(literal) as RegExpMatchArray;
  return new RegExp(pattern as string, flags as string);
}
