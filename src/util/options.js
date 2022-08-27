const { hasOwn } = require('./object.js')

function mergeKeyOverlap(obj, opts) {
  for (var key in obj) {
    if (hasOwn(obj, key) && hasOwn(opts, key)) {
      obj[key] = opts[key]
    }
  }
  return obj
}

module.exports = {
  mergeKeyOverlap
}
