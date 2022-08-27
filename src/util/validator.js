const { hasProto } = require('./proto.js')
const { countBoxedPrimAsPrimValue: countBoxed, strictTagCheck: strict } = require('../config.js')
const { capitalize } = require('./string.js')

var _isArray = Array.isArray
var isNaN = Number.isNaN
var isSafeInteger = Number.isSafeInteger

function isArray(v) {
  return strict
    ? _isArray(v) && isTagType(v, "Array")
    : _isArray(v)
  // return isArray(v) && (!strict || isTagType(v, "Array"))
}

// Array.isArray dont work for TypedArray
function isAnyArray(val) {
  return isArray(val) || isTypedArray(val)
}

function isTypedArray(val) {
  return ArrayBuffer.isView(val)
}

function isObjectOrFn(val) {
  return typeof val === "object" || typeof val === "function"
}

function isPlainObject(val) {
  return typeof val === "object" && !isAnyArray(val) && val !== null // "Object"  // if we changed toStringTag for our obj literal, this will give false. that isnt desired?
}

function isObject(val) {
  return typeof val === "object" && val !== null
}

function isFunction(val) {
  return typeof val === "function" // strict?
}

var _toString = Object.prototype.toString

function isTagType(v, type) {
  return _toString.call(v) === "[object "+type+"]" //capitalize force caps, safe since dont decaps
}

// countBottom, countUnitTypes - isUndefined()
function isPrimitive(value) {
  var prims = ['string', 'symbol', 'boolean', 'number', 'bigint']
  return strict
  ? prims.includes(typeof value) && isTagType(value, capitalize(typeof value))
  : prims.includes(typeof value)
}

function isString(v) {
  var _isString = typeof v === "string" || (countBoxed && isBoxedString(v)) // works? how to compare the valueof with the obj value?
  return strict ? _isString && isTagType(v, "String") : _isString
}

// this is also a reason why we reuse the fns in other fns, so can pass along these args
// Returns true if the value is a boolean object, e.g. created by new Boolean().
function isBoolean(v) { // countObjectVersion, countObjectWrapped, allowObjectWrappedPrim
  var isBool = typeof v === "boolean" || (countBoxed && isBoxedBool(v))
  return strict ? isBool && isTagType(v, "Boolean") : isBool
}

function isSymbol(v) {
  var isSym = typeof v === "symbol" || (countBoxed && isBoxedSymbol(v))
  return strict ? isSym && isTagType(v, "Symbol") : isSym
}

function isNumber(v) {
  var isNum = typeof v === "number" || (countBoxed && isBoxedNumber(v))
  return strict ? isNum && isTagType(v, "Number") : isNum
}

// is number on format: 30n.
function isBigInt(v) {
  var isBigInt = typeof v === "bigint" || (countBoxed && isBoxedBigInt(v))
  return strict ? isBigInt && isTagType(v, "BigInt") : isBigInt
}

function isValidNumber(v) {
  return Number.isFinite(v)
}

function isInfinite(v) {
  return v === Infinity || v === -Infinity
}

function isInt(val) {
  return Number.isInteger(val)
}

function isFloat(val) {
  return !isInt(val)
}

function isDefined(val) {
  return val !== null || typeof val !== "undefined"
}

function isNotDefined(val) {
  return !isDefined(val)
}

/**
 * Is object and is an empty object.
 * if noProto is true, need to have no
 * proto to be considered empty.
 */
function isEmptyObj(val, noProto, ignoreSet) {
  if (!isObject(val)) return false
  if (noProto && hasProto(val)) return false

  if (isAnyArray(val))
    return !val.length
  if (isSet(val) || isMap(val))
    return !val.size
  else
    return !Object.keys(val).length // Object.getPropertyNames - inc/checkEnum
    // if no length prop
  // didnt req type? or return false (assume its not empty). since we filter object...
}

function isEmptyArr(arr) {
  return !arr.length
}

/**
 * True for falsy values (NaN, undefined, null, -0, 0, "", false),
 * but also includes empty objects (num of own stringed enum keys).
 */
function isEmptyVal(val, noProto) {
  return isFalsy(val) && isEmptyObj(val, noProto)
}

function isTrue(v) {
  return v === true
}

function isFalse(v) {
  return v === false
}

function isTruthy(v) {
  return !!v
}

/**
 * True for "", 0, -0, NaN, undefined, null, false.
 * So know what our value will be coerced too.
 */
function isFalsy(v) {
  return !v
}

function isSet(val) {
  try {
    Set.prototype.has.call(val)
    return true
  } catch(e) {
    return false
  }
}

function isMap(val) {
  try {
    Map.prototype.has.call(val) // make a object with the has fn, that errs for same val's, even if internal prop,
    // same with toString?
    return true
  } catch(e) {
    return false
  }
}

// pointless when we allow class? remove, or replace with eg ducktype. or call.
// org by: "objects/objetcheck/instanceof"
function isWeakSet(v) {
  return v instanceof WeakSet
}

function isWeakMap(v) {
  return v instanceof WeakMap
}

function isRegExp(val) {
  return val instanceof RegExp
}

// only node
// function isBuffer(val) {
//   return val instanceof Buffer
// }

// Buffer -> node
// isArrayBuffer -> both
// isSharedArrayBuffer -> node

// apply strict and prim to these? can we create anon fn with new Function?
function isAnonymousFunction(fn) {
  return typeof fn === "function" && fn.name === ""
}

// is this proto the same as the proto of another async fn (since we know its async since we declared it)
function isAsyncFunction(fn) {
  return fn.constructor === (async function () {}).constructor
}

function isGeneratorFunction(fn) {
  return fn.constructor === (function* () {}).constructor
}

function isAsyncGeneratorFunction(fn) {
  return fn.constructor === (async function* () {}).constructor
}

function isPlainFunction(fn) {
  return (
    isFunction(fn) &&
    !isAsyncFunction(fn) &&
    !isGeneratorFunction(fn) &&
    !isAsyncGeneratorFunction(fn)
  )
}

// or dont return a promise? isPromiseFunction? isPromise(returned value)
function isDucktypedPromise(val) { // hasPromiseProperties - isPromiseByPropsSignature - shape
  return (
    isDefined(val) &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  )
}

function isPromise(v) {
  return v instanceof Promise
}


/**
 * True if the object is created with e.g. new String()|Object().
 * True if is an object wrapping around a primitive value.
 * only constructor works for both "" and new String("").
 * instanceof just for new String("").
 */
// isObjectWrappedPrim
function isBoxedPrim(obj) {
  return typeof obj === "object" &&
  obj.constructor === String ||
  obj.constructor === Number ||
  obj.constructor === BigInt ||
  obj.constructor === Symbol ||
  obj.constructor === Boolean
}


/**
 * must check that is obj, else can be non-boxed prim
 * this can also be fooled (like constructor): any obj can have a valueOf prop that returns a value
 */
// makeObjectPrimValidator
function makeBoxedValidator(type) {
  return function (obj) {
    return typeof obj === "object" && typeof obj.valueOf() === type
  }
}


// isStringObject, isObjectWrappedString
var isBoxedString = makeBoxedValidator("string")
var isBoxedNumber = makeBoxedValidator("number")
var isBoxedBoolean = makeBoxedValidator("boolean")
var isBoxedBigInt = makeBoxedValidator("bigint")
var isBoxedSymbol = makeBoxedValidator("symbol")


function isFloat32Array(val) {
  return isTypedArray(val) && val[Symbol.toStringTag] === "Float32Array"
}
function Int8Array(val) {
  return val[Symbol.toStringTag] === "Int8Array"
}
function Int32Array(val) {
  return val[Symbol.toStringTag] === "Int32Array"
}
function Uint8Array(val) {
  return val[Symbol.toStringTag] === "Uint8Array"
}
function Uint16Array(val) {
  return val[Symbol.toStringTag] === "Uint16Array"
}
function isUint8ClampedArray(val) {
  return val[Symbol.toStringTag] === "Uint8ClampedArray"
}

// function isUint32Array(val) {
//   return isTypedArray(val) &&
//   val[Symbol.toStringTag] === "Uint32Array" &&
//   val.constructor === Uint32Array &&
//   val instanceof Uint32Array
// }

// isUint32Array(new Uint32Array(), Uint32Array)
function isUint32Array(val, fnobj) {
  return isTypedArray(val) &&
  val[Symbol.toStringTag] === fnobj.name &&
  val.constructor === fnobj &&
  val instanceof fnobj
}


/**
 * True for any value that implements
 * the iterable protocol (correctly?).
 * Natively, array and string?
 */
function isIterable(obj) {
  // null and undefined will err. they cant have properties. primitives can, eg ((10).toFixed).
  if (!isDefined(obj)) return false
  return typeof obj[Symbol.iterator] === 'function'
}


/**
 * Test every array item against a provided test function.
 * Returns false if ANY value does not satisfy the function.
 */
function eachValueIs(arr, test) {
  if (!isArray(arr)) return false
  for (var val of arr)
    if (!test(val))
      return false
  return true
}

var isNumberArray = (arr) => eachValueIs(arr, isNumber)
var isStringArray = (arr) => eachValueIs(arr, isString)
var isSymbolArray = (arr) => eachValueIs(arr, isSymbol)
var isBigIntArray = (arr) => eachValueIs(arr, isBigInt)
var isBooleanArray = (arr) => eachValueIs(arr, isBoolean)
var isPrimArray = (arr) => eachValueIs(arr, isPrimitive)
var isFloatArray = (arr) => eachValueIs(arr, isFloat)
var isArrayOfPrimType = (arr) => eachValueIs(arr, (val) => typeof val)


/**
 * Does the array only contains one type.
 * If empty, or if not same type in ALL slots return false,
 * else return true. Valid methods: "typeof", "instanceof", "constructor" (future "tostring"?).
 * constructor to instanceof useless? always false?
 * sol: get all constructors/__proto__.constructors from chain? "in", loop
 */
function isSingleTypeArray(arr, compareMethod) {
  if (!isArray(arr) || isEmptyArr(arr)) return false
  var type = compareMethod === "typeof" ? typeof arr[0] : arr[0].constructor
  var isType = compareMethod === "typeof" ?
    (val) => typeof val === type :
    compareMethod === "instanceof" ? (val) => val instanceof type : (val) => val.constructor === type

  for (var val of arr)
    if (!isType(val))
      return false
  return true
}


module.exports = {
  isPlainObject,
  isObject,
  isObjectOrFn,
  isFunction,
  isBoolean,
  isSymbol,
  isNumber,
  isValidNumber,
  isInfinite,
  isString,
  isBigInt,
  isInt,
  isFloat,
  isArray,
  isNaN,
  isNotDefined,
  isFalsy,
  isSet,
  isWeakSet,
  isMap,
  isWeakMap,
  isEmptyObj,
  isEmptyVal,
  isTypedArray,
  isAnyArray,
  isRegExp,
  isAnonymousFunction,
  isAsyncFunction,
  isGeneratorFunction,
  isAsyncGeneratorFunction,
  isPrimitive,
  isSafeInteger,
  isArrayOfPrimType,
  isPrimArray,
  isPlainFunction,
  isDefined,
  isTruthy
}
