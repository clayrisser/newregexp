export default function newRegExp(regexString) {
  let expression = regexString;
  let flags = '';
  if (/^\/((\\\/)|[^\/])*\//.test(regexString)) {
    expression = (regexString.match(/^\/((\\\/)|[^\/])*/g) || [])
      .join('')
      .substr(1);
    flags = (regexString.match(/[^\/]*$/g) || []).join('');
  }
  return new RegExp(expression, flags);
}
