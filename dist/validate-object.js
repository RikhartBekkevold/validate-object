/* validate-object.js - copyright Rikhart Bekkevold. MIT license. Version 1.0.0. */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.validateObject = factory());
})(this, (function () { 'use strict';

  function hasProto$2(obj) {
    return !!Object.getPrototypeOf(obj)
  }

  function protoIs$1(obj, proto) {
    return Object.getPrototypeOf(obj) === proto
  }

  var proto = {
    hasProto: hasProto$2,
    protoIs: protoIs$1
  };

  var config$1 = {
    validateNestedObjects: true,
    exactKeys: false,
    recursionLimit: Infinity,
    useLooseValueCompare: false,
    countBoxedPrimAsPrimValue: false,
    validateObjectByConstructor: false,
    strictTagCheck: false
  };

  var string = {};

  var _toString$1 = Object.prototype.toString;

  string.normalizeString = function normalizeString(str) {
    return typeof str === "string" ? str.toLowerCase() : str
  };

  string.capitalize = function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  };

  string.getType = function getType(val) {
    return _toString$1.call(val).slice(8, -1).toLowerCase()
  };

  const { hasProto: hasProto$1 } = proto;
  const { countBoxedPrimAsPrimValue: countBoxed, strictTagCheck: strict } = config$1;
  const { capitalize: capitalize$1 } = string;

  var _isArray = Array.isArray;
  var isNaN$1 = Number.isNaN;
  var isSafeInteger$1 = Number.isSafeInteger;

  function isArray$2(v) {
    return strict
      ? _isArray(v) && isTagType(v, "Array")
      : _isArray(v)
    // return isArray(v) && (!strict || isTagType(v, "Array"))
  }

  // Array.isArray dont work for TypedArray
  function isAnyArray$1(val) {
    return isArray$2(val) || isTypedArray$1(val)
  }

  function isTypedArray$1(val) {
    return ArrayBuffer.isView(val)
  }

  function isObjectOrFn$2(val) {
    return typeof val === "object" || typeof val === "function"
  }

  function isPlainObject$2(val) {
    return typeof val === "object" && !isAnyArray$1(val) && val !== null // "Object"  // if we changed toStringTag for our obj literal, this will give false. that isnt desired?
  }

  function isObject$1(val) {
    return typeof val === "object" && val !== null
  }

  function isFunction$2(val) {
    return typeof val === "function" // strict?
  }

  var _toString = Object.prototype.toString;

  function isTagType(v, type) {
    return _toString.call(v) === "[object "+type+"]" //capitalize force caps, safe since dont decaps
  }

  // countBottom, countUnitTypes - isUndefined()
  function isPrimitive(value) {
    var prims = ['string', 'symbol', 'boolean', 'number', 'bigint'];
    return strict
    ? prims.includes(typeof value) && isTagType(value, capitalize$1(typeof value))
    : prims.includes(typeof value)
  }

  function isString$3(v) {
    var _isString = typeof v === "string" || (countBoxed && isBoxedString(v)); // works? how to compare the valueof with the obj value?
    return strict ? _isString && isTagType(v, "String") : _isString
  }

  // this is also a reason why we reuse the fns in other fns, so can pass along these args
  // Returns true if the value is a boolean object, e.g. created by new Boolean().
  function isBoolean$2(v) { // countObjectVersion, countObjectWrapped, allowObjectWrappedPrim
    var isBool = typeof v === "boolean" || (countBoxed && isBoxedBool(v));
    return strict ? isBool && isTagType(v, "Boolean") : isBool
  }

  function isSymbol$1(v) {
    var isSym = typeof v === "symbol" || (countBoxed && isBoxedSymbol(v));
    return strict ? isSym && isTagType(v, "Symbol") : isSym
  }

  function isNumber$1(v) {
    var isNum = typeof v === "number" || (countBoxed && isBoxedNumber(v));
    return strict ? isNum && isTagType(v, "Number") : isNum
  }

  // is number on format: 30n.
  function isBigInt$1(v) {
    var isBigInt = typeof v === "bigint" || (countBoxed && isBoxedBigInt(v));
    return strict ? isBigInt && isTagType(v, "BigInt") : isBigInt
  }

  function isValidNumber$1(v) {
    return Number.isFinite(v)
  }

  function isInfinite$1(v) {
    return v === Infinity || v === -Infinity
  }

  function isInt$1(val) {
    return Number.isInteger(val)
  }

  function isFloat$1(val) {
    return !isInt$1(val)
  }

  function isDefined$1(val) {
    return val !== null || typeof val !== "undefined"
  }

  function isNotDefined$1(val) {
    return !isDefined$1(val)
  }

  /**
   * Is object and is an empty object.
   * if noProto is true, need to have no
   * proto to be considered empty.
   */
  function isEmptyObj$1(val, noProto, ignoreSet) {
    if (!isObject$1(val)) return false
    if (noProto && hasProto$1(val)) return false

    if (isAnyArray$1(val))
      return !val.length
    if (isSet$1(val) || isMap$1(val))
      return !val.size
    else
      return !Object.keys(val).length // Object.getPropertyNames - inc/checkEnum
      // if no length prop
    // didnt req type? or return false (assume its not empty). since we filter object...
  }

  /**
   * True for falsy values (NaN, undefined, null, -0, 0, "", false),
   * but also includes empty objects (num of own stringed enum keys).
   */
  function isEmptyVal$1(val, noProto) {
    return isFalsy$1(val) && isEmptyObj$1(val, noProto)
  }

  function isTruthy$1(v) {
    return !!v
  }

  /**
   * True for "", 0, -0, NaN, undefined, null, false.
   * So know what our value will be coerced too.
   */
  function isFalsy$1(v) {
    return !v
  }

  function isSet$1(val) {
    try {
      Set.prototype.has.call(val);
      return true
    } catch(e) {
      return false
    }
  }

  function isMap$1(val) {
    try {
      Map.prototype.has.call(val); // make a object with the has fn, that errs for same val's, even if internal prop,
      // same with toString?
      return true
    } catch(e) {
      return false
    }
  }

  // pointless when we allow class? remove, or replace with eg ducktype. or call.
  // org by: "objects/objetcheck/instanceof"
  function isWeakSet$1(v) {
    return v instanceof WeakSet
  }

  function isWeakMap$1(v) {
    return v instanceof WeakMap
  }

  function isRegExp$1(val) {
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
  function isAnonymousFunction$1(fn) {
    return typeof fn === "function" && fn.name === ""
  }

  // is this proto the same as the proto of another async fn (since we know its async since we declared it)
  function isAsyncFunction$1(fn) {
    return fn.constructor === (async function () {}).constructor
  }

  function isGeneratorFunction$1(fn) {
    return fn.constructor === (function* () {}).constructor
  }

  function isAsyncGeneratorFunction$1(fn) {
    return fn.constructor === (async function* () {}).constructor
  }

  function isPlainFunction$1(fn) {
    return (
      isFunction$2(fn) &&
      !isAsyncFunction$1(fn) &&
      !isGeneratorFunction$1(fn) &&
      !isAsyncGeneratorFunction$1(fn)
    )
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
  var isBoxedString = makeBoxedValidator("string");
  var isBoxedNumber = makeBoxedValidator("number");
  var isBoxedBigInt = makeBoxedValidator("bigint");
  var isBoxedSymbol = makeBoxedValidator("symbol");


  /**
   * Test every array item against a provided test function.
   * Returns false if ANY value does not satisfy the function.
   */
  function eachValueIs(arr, test) {
    if (!isArray$2(arr)) return false
    for (var val of arr)
      if (!test(val))
        return false
    return true
  }
  var isPrimArray$1 = (arr) => eachValueIs(arr, isPrimitive);
  var isArrayOfPrimType$1 = (arr) => eachValueIs(arr, (val) => typeof val);


  var validator = {
    isPlainObject: isPlainObject$2,
    isObject: isObject$1,
    isObjectOrFn: isObjectOrFn$2,
    isFunction: isFunction$2,
    isBoolean: isBoolean$2,
    isSymbol: isSymbol$1,
    isNumber: isNumber$1,
    isValidNumber: isValidNumber$1,
    isInfinite: isInfinite$1,
    isString: isString$3,
    isBigInt: isBigInt$1,
    isInt: isInt$1,
    isFloat: isFloat$1,
    isArray: isArray$2,
    isNaN: isNaN$1,
    isNotDefined: isNotDefined$1,
    isFalsy: isFalsy$1,
    isSet: isSet$1,
    isWeakSet: isWeakSet$1,
    isMap: isMap$1,
    isWeakMap: isWeakMap$1,
    isEmptyObj: isEmptyObj$1,
    isEmptyVal: isEmptyVal$1,
    isTypedArray: isTypedArray$1,
    isAnyArray: isAnyArray$1,
    isRegExp: isRegExp$1,
    isAnonymousFunction: isAnonymousFunction$1,
    isAsyncFunction: isAsyncFunction$1,
    isGeneratorFunction: isGeneratorFunction$1,
    isAsyncGeneratorFunction: isAsyncGeneratorFunction$1,
    isPrimitive,
    isSafeInteger: isSafeInteger$1,
    isArrayOfPrimType: isArrayOfPrimType$1,
    isPrimArray: isPrimArray$1,
    isPlainFunction: isPlainFunction$1,
    isDefined: isDefined$1,
    isTruthy: isTruthy$1
  };

  const {
    isFunction: isFunction$1,
    isPlainObject: isPlainObject$1,
    isString: isString$2,
    isBoolean: isBoolean$1,
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
    isObjectOrFn: isObjectOrFn$1,
    isArray: isArray$1,
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
  } = validator;


  var preds = new Map([
    ["function",      isFunction$1],
    ["asyncfunction", isAsyncFunction],
    ["generatorfunction", isGeneratorFunction],
    ["asyncgeneratorfunction", isAsyncGeneratorFunction],
    ["plainfunction", isPlainFunction],
    ["string",        isString$2],
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
    ["boolean",       isBoolean$1],
    ["bool",          isBoolean$1],
    ["symbol",        isSymbol],
    ["object",        isPlainObject$1],
    ["array",         isArray$1],
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
  ]);


  /**
   * Prints everything in lowercase. doesnt restore back
   * to orgname pushed by user. save original/pushed name.
   */
  Map.prototype.toString = function(alphabetically, expanded) {
    var delim = expanded ? "\n" : ", ";
    var str = "";
    var keys = Array.from(this.keys());

    if (alphabetically)
      keys.sort((a, b) => a.localeCompare(b));

    for (var key of keys)
      str += "'" + key + "'" + delim;
    return expanded ? str : str.slice(0, str.length - 2)
  };


  var preds_1 = preds;

  var _hasOwn = Object.prototype.hasOwnProperty;

  function hasOwn$3(obj, key) {
    return _hasOwn.call(obj, key)
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
  function hasOwnExactStringedEnumKeys$1(obj, list) {
    // only do propertyNames? sinc eof obj, not list/scehma (aka nonenum matters)
    var keys = getAllOwnKeys(obj);
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
  function hasOwnStringedEnumKeys$1(obj, keys) {
    var keys = getAllOwnKeys(obj);
    for (var key of keys) // if Array.isArray, do this, else do Object.keys()
      if (!keys.includes(key))
        return false
    return true
  }


  var object = {
    getAllOwnKeys,
    hasOwn: hasOwn$3,
    hasOwnStringedEnumKeys: hasOwnStringedEnumKeys$1,
    hasOwnExactStringedEnumKeys: hasOwnExactStringedEnumKeys$1
  };

  const { hasOwn: hasOwn$2 } = object;

  // isEmpty(descriptor) "did u mean {} - these are ok: " - dont print if 1 arg atleast - log not
  // if isEmpty, reverse/use defineProp defualts?
  // add to outside meta? standalone?   
  function validateDescriptor$1(obj, key, descriptor) {
    var obj = Object.getOwnPropertyDescriptor(obj, key);
    if ((hasOwn$2(descriptor, "configurable") && obj.configurable !== descriptor.configurable) ||
       (hasOwn$2(descriptor, "enumerable") && obj.enumerable !== descriptor.enumerable) ||
       (hasOwn$2(descriptor, "writable") && obj.writable !== descriptor.writable))
        return false
    return true
  }

  var meta = {
    validateDescriptor: validateDescriptor$1
  };

  const { hasOwn: hasOwn$1 } = object;

  function mergeKeyOverlap$1(obj, opts) {
    for (var key in obj) {
      if (hasOwn$1(obj, key) && hasOwn$1(opts, key)) {
        obj[key] = opts[key];
      }
    }
    return obj
  }

  var options = {
    mergeKeyOverlap: mergeKeyOverlap$1
  };

  const { isString: isString$1 } = validator;

  function isValidObjectMeta$1(meta) {
    return isString$1(meta) && meta === "sealed" || meta === "frozen" || meta === "extensible"
  }

  var schema = {
    isValidObjectMeta: isValidObjectMeta$1
  };

  const predicates = preds_1;
  const config = config$1;
  const { isPlainObject, isObject, isString, isArray, isObjectOrFn, isFunction, isBoolean, isAnonymousFunction } = validator;
  const { hasOwn, hasOwnStringedEnumKeys, hasOwnExactStringedEnumKeys } = object;
  const { protoIs, hasProto } = proto;
  const { normalizeString, capitalize, getType } = string;
  const { validateDescriptor } = meta;
  const { mergeKeyOverlap } = options;
  const { isValidObjectMeta } = schema;


  function validateObject(obj, schema, userConfig) {
    if (!isPlainObject(schema))
      throw new TypeError("The 'schema' argument needs to be an object, not " + schema + " (" + getType(schema) + ").")

    if (!isPlainObject(obj))
      return false

    if (userConfig)
      setOptions(config, userConfig);

    var iterations = 0;

    return (function checkObject(obj, schema, schemaKey) {
      iterations++;
      var checkExactKeys = isBoolean(schema.exactKeys) ? schema.exactKeys : config.exactKeys;

      if (hasOwn(schema, "keys")) {
        // must allow symbols here too?
        if (isArray(schema.keys)) {
          if (checkExactKeys) {
            // already gets symbols, but causes problem/ignores?
            if (!hasOwnExactStringedEnumKeys(obj, schema.keys))
              return false
          }
          else {
            if (!hasOwnStringedEnumKeys(obj, schema.keys))
               return false
          }
        }
        else if (isObject(schema.keys)) {
          if (checkExactKeys) {
            if (!hasOwnExactStringedEnumKeys(obj, Object.keys(schema.keys))) // keys is enough as long as not symbols added
              return false
          }

          // var props =  schema.keys + concat Object.getPropertySymbols(schema.keys) // getAllOwnEnumKeys (str or symbol keyed)
          for (var schemaKey in schema.keys) {
            if (!checkExactKeys)
              if (!validateKey(obj, schemaKey))
                return false

            // var objKey = isSymbol(schemaKey) ? getOwnSymbol(schemaKey) : schemaKey

            if (isPlainObject(obj[schemaKey]) && config.validateNestedObjects && iterations < config.recursionLimit) {
              if (!checkObject(obj[schemaKey], schema.keys[schemaKey]))
                return false
            }
            else {
              if (isPlainObject(schema.keys[schemaKey])) {
                // if we get true, it means its false. consider change internal || - externally its misleading, internally hard to read
                if (validateProperty(obj, schemaKey, schema.keys[schemaKey]))
                  return false
              }
              else if (isString(schema.keys[schemaKey]) || isFunction(schema.keys[schemaKey])) {
                // make sure they not used internally the same. need to know which schemaKey arg to pass!
                if (!validateDataType(obj[schemaKey], schema.keys[schemaKey]))
                  return false
              }
              else if (isArray(schema.keys[schemaKey])) {
                var found = false;
                for (var type of schema.keys[schemaKey]) {
                  if (validateDataType(obj[schemaKey], type)) {
                    found = true;
                    break
                  }
                }
                if (!found)
                  return false
              }
              else {
                throw new TypeError("The schema properties in the 'keys' array/object needs to be either object or string. Recieved " + schema.keys[schemaKey] + ".")
              }
            }
          }
        }
        else {
          throw new Error("Schema 'keys' property needs to be either array or object. Recieved " + schema.keys + " (" + getType(schema.keys) + ").")
        }
      }

      if (!validateProto(obj, schema)) return false
      if (!validateMeta(obj, schema)) return false

      return true
    }(obj, schema))
  }


  function validateMeta(obj, schema) {
    if (hasOwn(schema, "meta")) {
      if (isValidObjectMeta(schema.meta))
        return Object["is"+capitalize(schema.meta.toLowerCase())](obj)
      throw new TypeError("The meta property only accepts a string with the values (upper or lowercase): 'frozen', 'sealed' or 'extensible' when used to validate an object.")
    }
    return true
  }


  function validateProto(obj, schema) {
    if (hasOwn(schema, "proto")) {
      if (isObjectOrFn(schema.proto))
        return protoIs(obj, schema.proto)
      if (schema.proto === "default")
        return protoIs(obj, Object.prototype)
      if (isBoolean(schema.proto))
        return hasProto(obj)
      throw new TypeErrror("Schema has property 'proto', but is wrong datatype (must be boolean, object, function, null or 'default')")
    }
    return true
  }


  function validateProperty(obj, schemaKey, schemaProperty) {
    return (
      (hasOwn(schemaProperty, "type") && !validateDataType(obj[schemaKey], schemaProperty.type))   ||
      (hasOwn(schemaProperty, "meta") && !validateDescriptor(obj, schemaKey, schemaProperty.meta)) ||
      (hasOwn(schemaProperty, "value") && !validateValue(obj[schemaKey], schemaProperty.value))    ||
      (hasOwn(schemaProperty, "validator") && !validateValidator(obj[schemaKey], schemaProperty.validator))  // pass schemaKey also?
    )
  }


  function validateValidator(objVal, schemaVal) {
    if (isFunction(schemaVal)) return schemaVal(objVal) // pass schemaVal too?
    throw new TypeError("Invalid datatype for 'validator' property. Needs to a function. Recieved " + getType(schemaVal) + ".")
  }


  function validateKey(obj, schemaKey) {
    // we dont know if the symbol they wrote in key, should be used, or its desc be used!
    // if (isSymbol(schemaKey)) {
    //  var desc = schemaKey.description // desc can be undefind! check first if string
    //
    //  var symbols = Object.getOwnPropertySymbols(obj)
    //  for (var symbol of symbols) {
    //    if (desc === symbol.description)
    //     return true // and return the symbol too?
    //  }
    //  return false
    // }
    return hasOwn(obj, schemaKey)
  }


  function validateDataType(val, type) {
    if (isAnonymousFunction(type))
      return type(val)

    if (isFunction(type))
      return validateObjectByConstructor ?
        val.constructor === type :
        val instanceof type

    if (isString(type)) {
      var type = normalizeString(type);
      if (predicates.has(type))
        return predicates.get(type)(val)
      else {
        throw new TypeError("Invalid string value '"+type+"'. Allowed types (upper or lowercase):\n" + predicates.toString(true) + "\n")
      }
    }

    if (isArray(type)) {
      // validate, and perma normalize
      for (var [i, str] of type.entries()) {
        type[i] = normalizeString(str);
        if (!predicates.has(type[i]))
          throw new TypeError("Invalid string value '"+type[i]+"'. Allowed types (upper or lowercase):\n" + predicates.toString(true) + "\n")
      }

      for (var str of type) {
        if (predicates.has(str)) {
          if (predicates.get(str)(val)) { // && strict && Object.toString === "[object " + type + "]"
            return true
          }
        }
      }

      return false
    }
    // cant go here on str|fn, since only those will trigger, but can on type
    // how to make it go here for arr,str,fn? aka, no object, nor array
    throw new TypeError("Schema 'type' properties needs to be either (constructor) function or (custom type) string. Received " + getType(type) + ".")
  }


  function validateValue(objValue, schemaValue) {
    return isFunction(schemaValue)
      ? schemaValue(objValue)
      : config.useLooseValueCompare ?
          objValue == schemaValue :
          objValue === schemaValue
  }


  function setOptions(obj, opts) {
    return mergeKeyOverlap(obj, isPlainObject(opts) ? opts : {})
  }


  /**
   * Add either a alias, or an array of aliases. (just use arguments? and single loop for both?)
   * return false if cant add, ignore if object
   */
  function addAlias(existingType, aliases, forceOverride) {
    if (!isString(existingType) || !predicates.has(existingType)) return false
    if (isArray(aliases)) {
      for (var alias of aliases)
        if (isString(alias) && (forceOverride || !predicates.has(alias)))
          predicates.set(alias, predicates.get(existingType));
      return true
    }
    if (isString(aliases) && (forceOverride || !predicates.has(aliases)))
      predicates.set(aliases, predicates.get(existingType));
    else
      return false
    return true
  }


  /**
   * Adds preds to pred map. Only adds conformant arguments.
   * Normalizes names by lowercasing them, preventing names
   * from being separated by casing (isEmail and isemail is seen equal).
   */
  function addValidator(name, pred, override) { // use arguments instead? with aray destructoring? onBeforeAdd
    if (isPlainObject(name)) {
      return !Object.keys(name).forEach((key) => {
        if (isFunction(name[key]) && (override || !predicates.has(normalizeString(key)))) {
          var newKey = pred ? normalizeString(pred(key)) : normalizeString(key);
          predicates.set(newKey || normalizeString(key), name[key]);
        }
      })
    }
    // override
    var exists = !isString(name) || !isFunction(pred) || predicates.has(normalizeString(name));
    if (exists) return false
    predicates.set(normalizeString(name), pred);
    return true
  }


  var src = Object.freeze({
    validateObject,
    setOptions,
    addAlias,
    addValidator
  });

  return src;

}));
