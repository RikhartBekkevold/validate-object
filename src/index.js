const predicates = require('./preds.js')
const config = require('./config.js')
const { isPlainObject, isObject, isString, isArray, isObjectOrFn, isFunction, isBoolean, isAnonymousFunction } = require('./util/validator.js')
const { hasOwn, hasOwnStringedEnumKeys, hasOwnExactStringedEnumKeys } = require('./util/object.js')
const { protoIs, hasProto } = require('./util/proto.js')
const { normalizeString, capitalize, getType } = require('./util/string.js')
const { validateDescriptor } = require('./util/meta.js')
const { mergeKeyOverlap } = require('./util/options.js')
const { isValidObjectMeta } = require("./schema.js")


function validateObject(obj, schema, userConfig) {
  if (!isPlainObject(schema))
    throw new TypeError("The 'schema' argument needs to be an object, not " + schema + " (" + getType(schema) + ").")

  if (!isPlainObject(obj))
    return false

  if (userConfig)
    setOptions(config, userConfig)

  var iterations = 0

  return (function checkObject(obj, schema, schemaKey) {
    iterations++
    var checkExactKeys = isBoolean(schema.exactKeys) ? schema.exactKeys : config.exactKeys

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
              var found = false
              for (var type of schema.keys[schemaKey]) {
                if (validateDataType(obj[schemaKey], type)) {
                  found = true
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
    var type = normalizeString(type)
    if (predicates.has(type))
      return predicates.get(type)(val)
    else {
      throw new TypeError("Invalid string value '"+type+"'. Allowed types (upper or lowercase):\n" + predicates.toString(true) + "\n")
    }
  }

  if (isArray(type)) {
    // validate, and perma normalize
    for (var [i, str] of type.entries()) {
      type[i] = normalizeString(str)
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
        predicates.set(alias, predicates.get(existingType))
    return true
  }
  if (isString(aliases) && (forceOverride || !predicates.has(aliases)))
    predicates.set(aliases, predicates.get(existingType))
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
        var newKey = pred ? normalizeString(pred(key)) : normalizeString(key)
        predicates.set(newKey || normalizeString(key), name[key])
      }
    })
  }
  // override
  var exists = !isString(name) || !isFunction(pred) || predicates.has(normalizeString(name))
  if (exists) return false
  predicates.set(normalizeString(name), pred)
  return true
}


module.exports = Object.freeze({
  validateObject,
  setOptions,
  addAlias,
  addValidator
})
