var _hasOwn = Object.prototype.hasOwnProperty

function hasOwn(obj, key) {
  return _hasOwn.call(obj, key)
}


/**
 * Gets objects keys based on type.
 * Retrival and array order not garanteed.
 */ // getOwnPropertyKeys
function getOwnKeys(obj, type, incSymbols, sort) {
  if (type === "keys" || type === "enum" || type === undefined)
    return Object.keys(obj)
  if (type === "stringed")
    return getOwnStringedKeys(obj)
  if (type === "non-enum")
    return getOwnNonEnumerableKeys(obj)
  if (type === "symbols-enum")
    return getOwnEnumerableAndSymbolKeys(obj)
  if (type === "symbols-non-enum")
    return getAllSymbolsAndNonEnumerableKeys(obj)
  if (type === "symbols")
    return getOwnSymbols(obj)
  if (type === "all")
    return getAllOwnKeys(obj)
  return []
}

function getOwnNonEnumerableKeys(obj) {
  var enumKeys = Object.keys(obj)
  var stringedKeys = Object.getOwnPropertyNames(obj)
  return stringedKeys.filter(stringedKey => !enumKeys.includes(stringedKey))
}

function getOwnStringedKeys(obj) {
  return Object.getOwnPropertyNames(obj)
}

function getOwnSymbolKeys(obj) {
  return Object.getOwnPropertySymbols(obj)
}

function getOwnEnumerableAndSymbolKeys(obj) {
  return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj))
}

function getOwnNonEnumerableAndSymbolKeys(obj) {
  return getOwnNonEnumerableKeys(obj).concat(Object.getOwnPropertySymbols(obj))
}

/**
 * Gets all stringed keys and symbol keys.
 * Order not guaranteed.
 */
function getAllOwnKeys(obj) {
  return Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj))
}


/**
 * Has all in list, AND no more.
 */
function hasOwnExactStringedEnumKeys(obj, list) {
  // only do propertyNames? sinc eof obj, not list/scehma (aka nonenum matters)
  var keys = getAllOwnKeys(obj)
  if (keys.length !== list.length) return false
  for (var key of keys)
    if (!list.includes(key))
      return false
  return true
}


/**
 * Only have keys found in keys/list,
 * but not necessary all keys in list.
 */
function hasOwnStringedEnumKeys(obj, keys) {
  var keys = getAllOwnKeys(obj)
  for (var key of keys) // if Array.isArray, do this, else do Object.keys()
    if (!keys.includes(key))
      return false
  return true
}


 /**
  * Gets an objects _first_ symbol key that matches the string description.
  * Symbols with no descripton is undefined (not "").
  * Use when dont have symbol reference.
  * "" or undefined will not match descriptionless symbols.
  * Returns undefined if no symbol matches desc.
  * Returns first symbol otherwise.
  */
function getOwnSymbolKeyByDesc(obj, desc) {
  var symbols = Object.getOwnPropertySymbols(obj)
  for (var symbol of symbols)
    if (symbol.description && desc === symbol.description)
      return symbol
}


/**
 * Gets all symbols that matches desc.
 * If no matches returns [].
 */
function getOwnSymbolKeysByDesc(obj, desc) {
  var symbols = Object.getOwnPropertySymbols(obj)
  var matches = []

  for (var symbol of symbols)
    if (symbol.description && desc === symbol.description)
      matches.push(symbol)
  return matches
}


/**
 * Assumes string or symbol.
 * Both returns undefined if not found.
 */
function getSymbolValue(symOrDesc) {
  return isString(symOrDesc) ? getOwnSymbolKey(symOrDesc) : obj[symOrDesc]
}


/**
 * True if obj has keys not
 * present in whitelist (allowed).
 */
function hasAnyOther(obj, whitelist) {
  var keys = Object.keys(obj)
  if (keys.length !== whitelist.length) return true
  for (var key of keys)
    if (!whitelist.includes(key)) return true
  return false
}


/**
 * True if obj only has owned stringed
 * enumerable keys found in the list.
 */
function hasOnlyFrom(obj, list) {
  // direct in loop surely faster
  var keys = Object.keys(obj)
  for (var key of keys)
    if (!key.includes(key))
      return false
  return true
}


module.exports = {
  getAllOwnKeys,
  hasOwn,
  hasOwnStringedEnumKeys,
  hasOwnExactStringedEnumKeys
}
