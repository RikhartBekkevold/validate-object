const { isString } = require('./util/validator.js')

function isValidObjectMeta(meta) {
  return isString(meta) && meta === "sealed" || meta === "frozen" || meta === "extensible"
}

module.exports = {
  isValidObjectMeta
}
