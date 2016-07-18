var path = require('path');
var fs = require('fs');
var CONS = require('./contants');
var _ = require('lodash');

var pjson;

function readPackageJson(pathToPackageJson) {

  pathToPackageJson = (pathToPackageJson) ? pathToPackageJson : 'package.json';

  if (!pjson) {
    try {
      pjson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), pathToPackageJson)));
    }
    catch (e) {
      pjson = {};
    }
  }

  return pjson;
}

function destroy() {
  pjson = null;
}

function getRelativePathToBase(basePath, relativePath) {

  var basePathArray = basePath.split(path.sep);
  var configPathArray = relativePath.split(path.sep);

  if (_.last(basePathArray) === '') {
    basePathArray = _.initial(basePathArray);
  }

  var configRelativePathArray = [];

  _.forEachRight( _.clone(configPathArray), function(lastItem) {
    if (lastItem === _.last(basePathArray)) {
      basePathArray = _.initial(basePathArray);
      configPathArray = _.initial(configPathArray);
    } else {
      configRelativePathArray.unshift(lastItem);
    }
  });

  var finalPath = '';
  if (configRelativePathArray.length) {
    finalPath = _.join(configRelativePathArray, path.sep);
  }

  return finalPath;

}

/**
 * Paths are relative to project root directory
 *
 * @param pathToPackageJson
 * @returns {{}}
 */
function getJspmPackageJson(basePath, pathToPackageJson) {

  var pjson = readPackageJson(pathToPackageJson);
  var jspmConfig = {};

  var hasDirectories = ( pjson.jspm.directories !== undefined );
  var hasPackages = (hasDirectories &&  pjson.jspm.directories.packages);
  var hasConfigFiles = ( pjson.jspm.configFiles !== undefined );
  var hasBaseUrl = false;

  // prevent parse errors
  if (!pjson.jspm) {
    pjson.jspm = {};
  }

  if (pjson.jspm) {
    for (var p in pjson.jspm) {
      jspmConfig[p] = pjson.jspm[p];
    }
  }

  jspmConfig.directories = pjson.jspm.directories || pjson.directories || {};
  jspmConfig.configFiles = pjson.jspm.configFiles || {};

  if ( jspmConfig.directories.baseURL === undefined ) {
    jspmConfig.directories.baseURL = '';
  } else {
    hasBaseUrl = true;
  };

  /**
   * jspm beta 0.17
   * configFile
   */
  if (pjson.jspm.configFiles && pjson.jspm.configFiles.jspm) {

    // Contains the entire path
    jspmConfig.configFile = pjson.jspm.configFiles.jspm;
  } else if (hasBaseUrl) {
    jspmConfig.configFile = path.join(jspmConfig.directories.baseURL, CONS.CONFIG);
  } else {
    jspmConfig.configFile = CONS.CONFIG;
  }

  /**
   * packages
   */
  if (hasDirectories) {

    if (hasPackages) {
      jspmConfig.directories.packages = pjson.directories.packages;
    } else if (hasBaseUrl) {
      jspmConfig.directories.packages = path.join(jspmConfig.directories.baseURL, CONS.PACKAGES);
    } else {
      jspmConfig.directories.packages = CONS.PACKAGES;
    }
  }

  // Normalize Paths
  var configFilePath = jspmConfig.configFile.split(path.sep);
  var configFile = _.last(configFilePath);
  var configFileBasePath = getRelativePathToBase(basePath,  _.join(_.initial(configFilePath), path.sep));
  jspmConfig.directories.baseURL = configFileBasePath;
  jspmConfig.configFile = path.join(configFileBasePath, configFile);

  var jspmPackagesFilePath = jspmConfig.directories.packages.split(path.sep);
  var jspmPackages = _.last(jspmPackagesFilePath);
  var jspmPackagesBasePath = getRelativePathToBase(basePath, _.join(_.initial(jspmPackagesFilePath), path.sep));
  jspmConfig.directories.packages = path.join(jspmPackagesBasePath, jspmPackages);

  return jspmConfig;
}

module.exports = {
  getJspmPackageJson      : getJspmPackageJson,
  getRelativePathToBase   : getRelativePathToBase,
  destroy                 : destroy
};
