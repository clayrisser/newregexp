export default function newRegExp(regexString) {
  if (Object.prototype.toString.call(regexString) === '[object RegExp]') {
    return regexString;
  }
  let expression = regexString;
  let flags = '';
  if (/^\/.*\/[a-z]*$/.test(regexString)) {
    let matches = regexString.match(/\/[a-z]*$/) || [];
    flags = (matches.length ? matches[0] : '/').substr(1);
    matches = regexString.match(/^\/.*\//) || [];
    const match = matches.length ? matches[0] : '//';
    expression = match.substr(1, match.length - 2);
  }
  return new RegExp(expression, flags);
}
