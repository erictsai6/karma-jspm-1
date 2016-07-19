(function() {

  var helper, path, util, vm;

  vm = require('vm');

  util = require('util');

  path = require('path');

  helper = {
    _: require('lodash')
  };

  describe('preprocessor', function() {
    var File, ORIGINAL_CODE, createPreprocessor, mockLogger, preprocessList;

    beforeEach(function() {

      createPreprocessor = require('../src/preprocessor');

      preprocessList = require('../src/coverage/preprocess-list');

      ORIGINAL_CODE = 'if (a) {\n  something();\n} else {\n  other();\n}';

      preprocessList.reset();

      mockLogger = {
        create: function() {
          return {
            error: function() {
              throw new Error(util.format.apply(util, arguments));
            },
            warn: function() {
              return null;
            },
            info: function() {
              return null;
            },
            debug: function() {
              return null;
            }
          };
        }
      };

      File = function(path, mtime) {
        this.path = path;
        this.originalPath = path;
        this.contentPath = path;
        this.mtime = mtime;
        return this.isUrl = false;
      };
    });

    afterEach(function() {
      File = null;
      ORIGINAL_CODE = null;
      createPreprocessor = null;
      mockLogger = null;
      preprocessList = null;
    });

    it('should not do anything if coverage reporter is not used', function(done) {
      var file, process;

      process = createPreprocessor(mockLogger, helper, null, ['dots', 'progress'], {});
      file = new File('/base/path/file.js');

      return process(ORIGINAL_CODE, file, function(preprocessedCode) {
        expect(preprocessedCode).toEqual(ORIGINAL_CODE);
        expect(file.path).toEqual('/base/path/file.js');
        expect(preprocessList.get().length).toEqual(0);
        return done();
      });

    });


    it('should preprocess the code', function() {
      var file, process;

      process = createPreprocessor(mockLogger, helper, '/base/path', ['jspm', 'progress'], {});
      file = new File('/base/path/file.js');
      process(ORIGINAL_CODE, file, function(preprocessedCode) {});

      var preprocessedCached = preprocessList.get();

      expect(preprocessedCached.length).toEqual(1);
      expect(preprocessedCached[0]).toEqual(file.originalPath.replace('/base/path/', ''))

    });
  });

}).call(this);
