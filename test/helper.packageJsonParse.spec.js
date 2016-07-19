(function() {
  /*global describe, expect, it, beforeEach*/

  var path = require('path');
  var pkg = require('../src/helpers/packageJsonParse');
  var _ = require('lodash');
  var CONS = require('../src/helpers/constants');

  var normalPath = function(path) {
    return path.replace(/\\/g, '/');
  };

  describe('jspm plugin init', function() {

    var pathToTestPackageJson;


    beforeEach(function() {

      pkg.destroy();


      pathToTestPackageJson = function(pkgJson) {
        return 'test/packageJson/' + pkgJson;
      }

    });

    afterEach(function() {
      pathToTestPackageJson = null;

    });

    describe('directories', function() {

      var basePath;

      beforeEach(function() {

      });

      afterEach(function() {
        basePath = null;
      });

      it('should define directories.packages', function() {

        basePath = '/Users/jerryorta-dev/Dev/UIUXEngineering/src/client';
        var karmaJspmConfig = pkg.getJspmPackageJson(basePath, pathToTestPackageJson('jspm.directores.baseURL-package.json'));

        expect(karmaJspmConfig.directories).toBeDefined();
        expect(normalPath(karmaJspmConfig.directories.baseURL)).toEqual('');
        expect(normalPath(karmaJspmConfig.directories.packages)).toEqual('jspm_packages');

      });

      it('should define directories.packages', function() {

        basePath = '/Users/jerryorta-dev/Dev/UIUXEngineering/src/';
        var karmaJspmConfig = pkg.getJspmPackageJson(basePath, pathToTestPackageJson('jspm.directores.baseURL-package.json'));

        expect(karmaJspmConfig.directories).toBeDefined();
        expect(normalPath(karmaJspmConfig.directories.baseURL)).toEqual('client');
        expect(normalPath(karmaJspmConfig.directories.packages)).toEqual('client/jspm_packages');

      });

      it('should return packages path with baseURL', function() {

        basePath = '/Users/jerryorta-dev/Dev/UIUXEngineering/src/client';
        var pjson = pkg.getJspmPackageJson(basePath, pathToTestPackageJson('jspm.directories-package.json'));

        expect(pjson.directories).toBeDefined();
        expect(normalPath(pjson.directories.baseURL)).toBe('');
        expect(normalPath(pjson.directories.packages)).toBe('jspm_packages');

      });
    });

    describe('getRelativePathToBase', function() {

      var basePath;
      var configPath;

      beforeEach(function() {

      });

      afterEach(function() {
        basePath = null;
        configPath = null;
      });

      it('returns only file name', function() {
        basePath = '/Users/jerryorta-dev/Dev/UIUXEngineering/src/client';
        configPath = 'src/client';
        var configFile = pkg.getRelativePathToBase(basePath, configPath);

        expect(normalPath(configFile)).toEqual('');
      });

      it('returns only file name', function() {
        basePath = '/Users/jerryorta-dev/Dev/UIUXEngineering/src/client';
        configPath = 'client';
        var configFile = pkg.getRelativePathToBase(basePath, configPath);

        expect(normalPath(configFile)).toEqual('');
      });

      it('returns path file name', function() {
        basePath = '/Users/jerryorta-dev/Dev/UIUXEngineering/src/client';
        configPath = 'client/app/src';
        var configFile = pkg.getRelativePathToBase(basePath, configPath);

        expect(normalPath(configFile)).toEqual('app/src');
      });

      it('returns path file name', function() {
        basePath = '/Users/jerryorta-dev/Dev/UIUXEngineering/src/client';
        configPath = 'app/src';
        var configFile = pkg.getRelativePathToBase(basePath, configPath);

        expect(normalPath(configFile)).toEqual('app/src');
      });

    });


  });


}).call(this);
