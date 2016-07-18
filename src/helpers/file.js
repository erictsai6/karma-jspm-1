var glob = require('glob');

function expandGlob(file, cwd) {
  return glob.sync(file.pattern || file, {cwd: cwd});
}

var createPattern = function (path) {
  return {pattern: path, included: true, served: true, watched: false};
};

var createServedPattern = function(path, file){
  return {
    pattern: path,
    included: file && 'included' in file ? file.included : false,
    served: file && 'served' in file ? file.served : true,
    nocache: file && 'nocache' in file ? file.nocache : false,
    watched: file && 'watched' in file ? file.watched : true
  };
};

module.exports = {
  expandGlob: expandGlob,
  createPattern: createPattern,
  createServedPattern: createServedPattern
};
