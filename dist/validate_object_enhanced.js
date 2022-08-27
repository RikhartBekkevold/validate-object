/* validate_object_enhanced.js - copyright Rikhart Bekkevold. MIT license. Version 1.0.0. */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.validate_object_enhanced = factory());
})(this, (function () { 'use strict';

  var isArray$2 = Array.isArray;
  var isNaN$1 = Number.isNaN;


  function isObjectOrFn$2(val) {
    return typeof val === "object" || typeof val === "function"
  }

  function isPlainObject$2(val) {
    return typeof val === "object" && !Array.isArray(val) && val !== null // && !isRegExp(val)
  }

  function isFunction$2(val) {
    return typeof val === "function"
  }

  var _toString$1 = Object.prototype.toString;

  function isTagType(v, type) {
    return _toString$1.call(v) === "[object "+type+"]"
  }

  // only apply strict to objects?
  function isString$3(v, strict) { // makeStrict(isString) - can just do it outside though, in calling context - aslong as we have the name - can we map - if map has?
    return strict
      ? typeof v === "string" && isTagType(v, "String")
      : typeof v === "string"
  }

  function isBoolean$1(v) {
    return typeof v === "boolean"
  }

  // generate these fns? must pass name? isType(val, "symbol")
  function isSymbol$1(v) {
    return typeof v === "symbol"
  }

  function isNumber$1(v) {
    return typeof v === "number"
  }

  // Number.isFinite already checks if value is Number too!
  function isValidNumber$1(v) {
    return Number.isFinite(v)
  }

  function isInfinite$1(v) {
    return v === Infinity || v === -Infinity
  }

  // is number on format: 30n.
  function isBigInt$1(v) {
    return typeof val === "bigint"
  }

  function isInt$1(val) {
    // dont know if we ever call? so better not to assing at start?
    return Number.isInteger(val)
  }

  function isFloat$1(val) {
    return !isInt$1(val)
  }

  function isDefined$1(val) {
    return val !== null || val !== "undefined"
  }

  function isNotDefined$1(val) {
    return !isDefined$1(val)
  }

  function isFalsy$1(v) {
    return !!v === false
    // return !v
    // coonvert with bool, and check if false?
    // "", 0, NaN, undefined, null
  }





  function isSet$1(v) {
    return v instanceof Set
  }

  // validating _schema_ I can use toString?! 

  // module.exports.validators = { }
  // i need to have unik namesspaces for each file. export a unik name for each. else samny files export isString. its not about import then?
  var validator = {
    isPlainObject: isPlainObject$2,
    isFunction: isFunction$2,
    isObjectOrFn: isObjectOrFn$2,
    isBoolean: isBoolean$1,
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
    isSet: isSet$1
  };

  const {
    isFunction: isFunction$1,
    isPlainObject: isPlainObject$1,
    isNumber,
    isString: isString$2,
    isValidNumber,
    isInt,
    isFloat,
    isBigInt,
    isInfinite,
    isBoolean,
    isSymbol,
    isObjectOrFn: isObjectOrFn$1,
    isArray: isArray$1,
    isNaN,
    isDefined,
    isNotDefined,
    isFalsy,
    isTruthy,
    isSet
  } = validator;


  var preds = new Map([
    ["function",      isFunction$1],
    ["string",        isString$2],
    ["number",        isNumber],
    ["num",           isNumber],
    ["validnumber",   isValidNumber],
    ["validnum",      isValidNumber],
    ["integer",       isInt],
    ["int",           isInt],
    ["float",         isFloat],
    ["bigint",        isBigInt],
    ["nan",           isNaN],
    ["infinity",      isInfinite],
    ["infinite",      isInfinite],
    ["boolean",       isBoolean],
    ["bool",          isBoolean],
    ["symbol",        isSymbol],
    ["object",        isPlainObject$1],
    ["array",         isArray$1],
    ["null",          () => val === null],
    ["undefined",     () => val === undefined],
    ["defined",       isDefined],
    ["not defined",   isNotDefined],
    ["bottomtype",    isNotDefined],
    ["empty",         () => !isDefined],
    ["falsy",         isFalsy],
    ["truthy",        isTruthy],
    ["set",           isSet]
  ]);


  Map.prototype.toString = function(expanded, alphabetical) { // desc, asc
    var delim = expanded ? "\n" : ", ";
    var str = "";

    console.log(Array.from(this.keys()));
    // if (alphabetical)
      // var a = Array.from(this.keys()).sort((a, b) => a.localeCompare(b)); // wont update map?
      // console.log(a);
      // console.log(this.keys());

    for (var key of this.values())
      str += "'" + key + "'" + delim;
    return expanded ? str : str.slice(0, str.length - 2)

    // sort map? cant? can entries?
    // this.entries().sort(a-b) sort locale
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
   * Has all in list, but no more.
   */
  function hasOwnExactStringedEnumKeys$1(obj, list) {
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

  function hasProto$1(obj) {
    return !!Object.getPrototypeOf(obj)
  }

  function protoIs$1(obj, proto) {
    return Object.getPrototypeOf(obj) === proto
  }

  var proto = {
    hasProto: hasProto$1,
    protoIs: protoIs$1
  };

  var string = {};

  var _toString = Object.prototype.toString;

  string.normalizeString = function normalizeString(str) {
    return str.toLowerCase()
  };

  string.capitalize = function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  };

  string.getType = function getType(val) {
    return _toString.call(val).slice(8, -1).toLowerCase()
  };

  const { hasOwn: hasOwn$2 } = object;

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

  // , "'Set'", "'math'", "'Empty'" - obj|array, but also null? "empty object"
  // // when use Object treats
  // Definity need class - if not string


  // Set, WeakSet, Map, WeakMap,
  // Math, Object, Array, Date, Function, String,
  // "TypedArray"
  // "Uint8array"
  // clamped is a thing?



    // "Uniform Array" // any value, first determines
    // "Number array"
    // "float array"


  // loopOptions - processOptions (lower level option objects override higher level always)
  var config$1 = {
    followNestedObjects: true  // validateNestedObjects!
    // all tests require that tag type is not altered
    // treats object wrappers around prims as prims. eg String creted with new String return true for "string" - "", String("") and new String("") all return true for "string"
  };

  var config_1 = {
    config: config$1
  };

  const { isString: isString$1 } = validator;

  function isValidObjectMeta$1(meta) {
    return isString$1(meta) && meta === "sealed" || meta === "frozen" || meta === "extensible"
  }

  var schema = {
    isValidObjectMeta: isValidObjectMeta$1
  };

  const predicates = preds_1;
  const { isPlainObject, isString, isArray, isObjectOrFn, isFunction } = validator;
  const { hasOwn, hasOwnStringedEnumKeys, hasOwnExactStringedEnumKeys } = object;
  const { protoIs, hasProto } = proto;
  const { normalizeString, capitalize, getType } = string;
  const { validateDescriptor } = meta;
  const { mergeKeyOverlap } = options;
  const { config } = config_1;
  const { isValidObjectMeta } = schema;


  function validateObject(obj, schema, userConfig) {
    if (!isPlainObject(schema))
      throw new TypeError("The 'schema' argument needs to be an object, not " + schema + " (" + getType(schema) + ").")

    if (!isPlainObject(obj))
      return false

    if (userConfig)
      setOptions(config, userConfig);


    return (function checkObject(obj, schema, schemaKey) {
      // shouldnt be forced to have keys? since we sometime only want to check an objects proto? or meta. keys should be optional.
      // but IF HAS keys, we should eval the dt
      // only check here to skip? or let each dt check do it - so: if dont have prop ignore, of have. validate its dt
      // check if has OTHER props not those 3 and warn? "did u mean, or schema only accepts", that way we can detect misspellings
      if (!hasOwn(schema, "keys")) {
        throw new Error("Missing 'keys' property for object in schema object.")
      }
      // validate an objects keys/props based on its keys schema type
      // print surrounding
      // validate proto and meta props - dont need them, should be optional except keys, but should validate dt?

      // validate custom Class

      // validate object exact too. should be able to add the prop and it working even if not array.
      // allow duplicate types? and if or
      // define a list of types it can be
      else if (isPlainObject(schema.keys)) {
        // by default it is not exact
        for (var schemaKey in schema.keys) { // checks that all in keys - can do of with getAllOwn?
          // validate that each key in schema, exists in the object (at that level)
          if (!validateKey(obj, schemaKey))
            return false

          // check if key in obj is a sub object, follow it if so
          if (isPlainObject(obj[schemaKey]) && config.followNestedObjects) {
            if (!checkObject(obj[schemaKey], schema.keys[schemaKey]))
              return false
          }
          // else validate the prop; based on its schema type. do follow OR validate, never anything else
          else {
            // if object, validate each prop in object
            if (isPlainObject(schema.keys[schemaKey])) {
              if (validateProperty(obj, schemaKey, schema.keys[schemaKey]))
                return false
            }
            // if string, validate dt only
            else if (isString(schema.keys[schemaKey])) {
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
      // do first, so we can do isObject instead? also more logical?
      else if (isArray(schema.keys)) {
        if (schema.exact) {
          if (!hasOwnExactStringedEnumKeys(obj, schema.keys))
            return false
        }
        else {
          if (!hasOwnStringedEnumKeys(obj, schema.keys))
            return false
        }
      }
      else {
        throw new Error("Schema 'keys' property needs to be either array or object. Recieved " + schema.keys + " (" + getType(schema.keys) + ").")
      }

      if (!validateProto(obj, schema)) return false
      if (!validateMeta(obj, schema)) return false

      return true
    }(obj, schema))
  }



  function validateMeta(obj, schema) {
    if (schema.meta) { // hasOwn?
      if (!isValidObjectMeta(schema.meta))
        throw new TypeError("The meta property only accepts the values: 'frozen', 'sealed' or 'extensible' when used to validate an object.")
        // + obj - key - need to pass prev name
      if (!Object["is"+capitalize(schema.meta)](obj)) return false
    }
    return true
  }


  function validateProto(obj, schema) {
    if (isObjectOrFn(schema.proto))
      if (!protoIs(obj, schema.proto)) return false
    if (schema.proto === true)
      if (!hasProto(obj)) return false
    return true // any values other than this, or if dont exists, we return true for. so even if schema.proto: 49 - last else that throws if incorrec value/missing?
  }


  function validateProperty(obj, schemaKey, schemaProperty) {
    return (
      (hasOwn(schemaProperty, "type") && !validateDataType(obj[schemaKey], schemaProperty.type))   ||
      (hasOwn(schemaProperty, "meta") && !validateDescriptor(obj, schemaKey, schemaProperty.meta)) ||
      (hasOwn(schemaProperty, "value") && !validateValue(obj[schemaKey], schemaProperty.value))
    )
  }


  // validate if is string, enum, or symbol? we type it in schema, but requires diff test?
  // validate key, AND that it is symbol vs string. or we just let schema
  // isSymbol?
  function validateKey(obj, schemaKey) {
    return hasOwn(obj, schemaKey)
  }


  function validateDataType(val, type) {
    if (isFunction(type))
      return type(val)

    if (isString(type)) {
      var type = normalizeString(type);
      if (predicates.has(type))
        return predicates.get(type)(val)
      else {
        throw new TypeError("Invalid string value '"+type+"'. Allowed types (upper or lowercase):\n" + predicates.toString(true, true) + "\n")
      }
    }

    if (isArray(type)) {
      // validate, and perma normalize
      for (var [i, str] of type.entries()) {
        type[i] = normalizeString(str);
        if (!predicates.has(type[i]))
          throw new TypeError("Invalid string value '"+type[i]+"'. Allowed types (upper or lowercase):\n" + predicates.toString() + "\n")
      }

      for (var str of type) {
        if (predicates.has(str)) {
          if (predicates.get(str)(val)) {
            return true
          }
        }
      }

      return false
    }

    // if (fn)
    //   obj instanceof val // Person

    throw new TypeError("Schema 'type' properties needs to be either function or string. Received " + getType(type) + ".")
  }


  function validateValue(objValue, schemaValue) {
    return isFunction(schemaValue)
      ? schemaValue(objValue)
      : objValue === schemaValue // == useLooseCompare? strictCompare. looslyCompare. defualt strictCompare. coerce values when compare
  }


  function setOptions(obj, opts) {
    return mergeKeyOverlap(obj, isPlainObject(opts) ? opts : {})
  }


  function addAlias(orgTypeName, alias) {
    if (!isString(orgTypeName) || !isString(alias) || predicates.has(alias))
      return false
    predicates.set(alias, predicates.get(orgTypeName));
    return true
  }


  function addValidator(name, pred) {
    if (!isString(name) || !isFunction(pred) || predicates.has(name))
      return false

    // if object -
      // loop and call set for each

    predicates.set(name, pred);
    return true
  }


  var src = {
    validateObject,
    setOptions,
    addAlias,
    addValidator
  };

  return src;

}));
