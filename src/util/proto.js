function hasProto(obj) {
  return !!Object.getPrototypeOf(obj)
}

function protoIs(obj, proto) {
  return Object.getPrototypeOf(obj) === proto
}

module.exports = {
  hasProto,
  protoIs
}
