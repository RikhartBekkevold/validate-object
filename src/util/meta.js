const { hasOwn } = require('./object.js');

// isEmpty(descriptor) "did u mean {} - these are ok: " - dont print if 1 arg atleast - log not
// if isEmpty, reverse/use defineProp defualts?
// add to outside meta? standalone?   
function validateDescriptor(obj, key, descriptor) {
  var obj = Object.getOwnPropertyDescriptor(obj, key)
  if ((hasOwn(descriptor, "configurable") && obj.configurable !== descriptor.configurable) ||
     (hasOwn(descriptor, "enumerable") && obj.enumerable !== descriptor.enumerable) ||
     (hasOwn(descriptor, "writable") && obj.writable !== descriptor.writable))
      return false
  return true
}

module.exports = {
  validateDescriptor
}
