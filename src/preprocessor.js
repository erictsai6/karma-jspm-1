// Coverage Preprocessor
// =====================
//
// Depends on the the reporter to generate an actual report

// Dependencies
// ------------
var preprocessList = require('./coverage/preprocess-list.js');


// Regexes
// -------

// Preprocessor creator function
function createCoveragePreprocessor (logger, helper, basePath, reporters, coverageReporter) {
  var _ = helper._
  var log = logger.create('preprocessor.coverage')

  basePath += '/';

  // Options
  // -------

  return function (content, file, done) {
    log.debug('Processing "%s".', file.originalPath)
    preprocessList.add(file.originalPath.replace(basePath, ''));
    done(content);
  }
}

createCoveragePreprocessor.$inject = [
  'logger',
  'helper',
  'config.basePath',
  'config.reporters',
  'config.coverageReporter'
]

module.exports = createCoveragePreprocessor
