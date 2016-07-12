var coverageMap = [];

function add (filePath) {
  coverageMap.push(filePath);
}

function get () {
  return coverageMap
}

function reset () {
  coverageMap = [];
}

module.exports = {
  add: add,
  get: get,
  reset: reset
}
