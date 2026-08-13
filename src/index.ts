/**
 * A regex-literal-shaped string: `/pattern/flags`.
 *
 * The pattern group is greedy, so the *last* slash is the closing delimiter.
 * That is what makes a slash inside the pattern work — `/a/b/g` is the pattern
 * `a/b` with flag `g`, not the pattern `a` with flags `b`.
 *
 * `[\s\S]` rather than `.` because `.` does not match a newline: 1.x failed to
 * recognise `"/a\nb/m"` as a literal at all and quietly returned a regex
 * matching that text verbatim.
 */
const literal = /^\/([\s\S]*)\/([a-z]*)$/;

/**
 * Build a `RegExp` from a `"/pattern/flags"` string.
 *
 * A string that is not literal-shaped becomes the pattern itself, with no
 * flags — `newRegExp("hello")` is `/hello/`. A `RegExp` is returned as-is,
 * including one from another realm.
 *
 * @throws {TypeError} if given anything other than a string or a `RegExp`.
 * @throws {SyntaxError} if the pattern or the flags are invalid — whatever the
 *   `RegExp` constructor itself throws.
 */
export function newRegExp(input: string | RegExp): RegExp {
  // Not `instanceof`: a RegExp from another realm — a vm context, an iframe, a
  // worker — has a different RegExp.prototype and fails that check while still
  // being a RegExp.
  if (Object.prototype.toString.call(input) === "[object RegExp]") {
    return input as RegExp;
  }
  if (typeof input !== "string") {
    throw new TypeError(
      `newRegExp expected a string or a RegExp, received ${input === null ? "null" : typeof input}`,
    );
  }
  const match = input.match(literal);
  if (!match) return new RegExp(input);
  const [, pattern = "", flags = ""] = match;
  return new RegExp(pattern, flags);
}

export default newRegExp;
