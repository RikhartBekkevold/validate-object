var _toString = Object.prototype.toString

module.exports.normalizeString = function normalizeString(str) {
  return typeof str === "string" ? str.toLowerCase() : str
}

module.exports.capitalize = function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

module.exports.getType = function getType(val) {
  return _toString.call(val).slice(8, -1).toLowerCase()
}
