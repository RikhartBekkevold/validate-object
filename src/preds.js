const {
  isFunction,
  isPlainObject,
  isString,
  isBoolean,
  isSymbol,
  isNumber,
  isValidNumber,
  isInt,
  isFloat,
  isBigInt,
  isNaN,
  isInfinite,
  isDefined,
  isNotDefined,
  isFalsy,
  isTruthy,
  isSet,
  isMap,
  isWeakMap,
  isWeakSet,
  isObjectOrFn,
  isArray,
  isTypedArray,
  isAnyArray,
  isRegExp,
  isEmptyVal,
  isEmptyObj,
  isPrimArray,
  isArrayOfPrimType,
  isSafeInteger,
  isAsyncFunction,
  isGeneratorFunction,
  isAsyncGeneratorFunction,
  isPlainFunction
} = require('./util/validator.js')


var preds = new Map([
  ["function",      isFunction],
  ["asyncfunction", isAsyncFunction],
  ["generatorfunction", isGeneratorFunction],
  ["asyncgeneratorfunction", isAsyncGeneratorFunction],
  ["plainfunction", isPlainFunction],
  ["string",        isString],
  ["number",        isNumber],
  ["num",           isNumber],
  ["validnumber",   isValidNumber],
  ["validnum",      isValidNumber],
  ["integer",       isInt],
  ["safeinteger",   isSafeInteger],
  ["int",           isInt],
  ["float",         isFloat],
  ["bigint",        isBigInt],
  ["nan",           isNaN],
  ["infinity",      isInfinite],
  ["infinite",      isInfinite],
  ["boolean",       isBoolean],
  ["bool",          isBoolean],
  ["symbol",        isSymbol],
  ["object",        isPlainObject],
  ["array",         isArray],
  // merge these to bottom? or isUndefined? unittype
  ["null",          (val) => val === null],
  ["undefined",     (val) => val === undefined],
  // "nullOrUndefined"|"bottomvalue"
  ["defined",       isDefined],
  ["not defined",   isNotDefined],
  ["bottomtype",    isNotDefined],
  ["empty",         (val) => !isDefined(val)],
  ["falsy",         isFalsy], // true for undefind, 0
  ["truthy",        isTruthy], // is any valye NOT undeinfed, 0
  ["set",           isSet],
  ["map",           isMap], // dont use instanceof, so OK?
  ["weakset",       isWeakSet],
  ["weakmap",       isWeakMap],
  ["emptyobject",   isEmptyObj],
  ["empty protoless object", (val) => isEmptyObj(val, true)],
  ["emptyvalue",    isEmptyVal], // (val, strict)
  ["empty",         isEmptyVal],
  ["typedarray",    isTypedArray],
  ["anyarray",      isAnyArray],
  ["regexp",        isRegExp],
  ["regex",         isRegExp],
  ["regular expression", isRegExp],
  // isDate - compare date by the time we get returned - getTime - or object
  // "" for any? "Any" // any JS value - better to not just test it then? same as "exists", which we need array for? or ""/shorthand prop def
  // val instanceof Math - makes sense becasuse...
  // "Exists" - same as any? return hasOwn/in
  ["numberarray", function(val) { return isArrayOfPrimType(val, "Number") }],
  ["stringarray", function(val) { return isArrayOfPrimType(val, "String") }],
  ["primarray", function(val) { return isPrimArray(val) }]
  // ["2dArray", function(val) { return isArrayOfType(val, "Array") }],
  // ["matrix", function(val) { return isArrayOfType(val, "Array") }]
  // diff type of matrices - diff values in them etc
  // isSingleTypeArray // use first, for subsequent checks - how to deal with complex preds for array valus?
])


/**
 * Prints everything in lowercase. doesnt restore back
 * to orgname pushed by user. save original/pushed name.
 */
Map.prototype.toString = function(alphabetically, expanded) {
  var delim = expanded ? "\n" : ", "
  var str = ""
  var keys = Array.from(this.keys())

  if (alphabetically)
    keys.sort((a, b) => a.localeCompare(b))

  for (var key of keys)
    str += "'" + key + "'" + delim
  return expanded ? str : str.slice(0, str.length - 2)
}


module.exports = preds
