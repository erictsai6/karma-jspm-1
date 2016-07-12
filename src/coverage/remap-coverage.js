/*
 * Simple SystemJS hook for Istanbul
 */
var istanbul = require('istanbul');
var remapIstanbul = require('remap-istanbul/lib/remap.js');
var fs = require('fs');
var path = require('path');


function fromFileURL(url) {
  if (url.substr(0, 7) == 'file:///')
    return url.substr(6 + process.platform.match(/^win/));
  return url;
}


exports.remapCoverage = function(coverage, originalSources) {
  var collector = remapIstanbul(coverage, {
    readFile: function(name) {
      return originalSources[name].source +
        (originalSources[name] && originalSources[name].sourceMap ? '\n//# sourceMappingURL=' + name.split('/').pop() + '.map' : '');
    },
    readJSON: function(name) {
      var originalSourcesObj = originalSources[name.substr(0, name.length - 4)];

      // non transpilation-created source map -> load the source map file directly
      if (!originalSourcesObj || !originalSourcesObj.sourceMap)
        return JSON.parse(fs.readFileSync(fromFileURL(name.substr(0, name.length - 4))));

      var sourceMap = originalSourcesObj.sourceMap;
      if (typeof sourceMap == 'string')
        sourceMap = JSON.parse(sourceMap);

      sourceMap.sourcesContent = sourceMap.sourcesContent || [];

      sourceMap.sources = sourceMap.sources.map((src, index) => {
        var sourcePath = path.relative(process.cwd(), path.resolve(path.dirname(name), sourceMap.sourceRoot || '.', src));
        if (originalSources[sourcePath] && !sourceMap.sourcesContent[index])
          sourceMap.sourcesContent[index] = originalSources[sourcePath].source;
        return sourcePath;
      });

      return sourceMap;
    },
    warn: function(msg) {
      if (msg.toString().indexOf('Could not find source map for') != -1)
        return;
    }
  });
  var coverage = collector.getFinalCoverage();
  Object.keys(coverage).forEach(function(key) {
    coverage[key].code = [coverage[key].code || originalSources[key].source];
  });
  return coverage;
};
