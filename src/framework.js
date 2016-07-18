/*
 * Copyright 2014-2015 Workiva Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var glob = require('glob');
var path = require('path');
var fs = require('fs');
var filePattern = require('./helpers/file');
var pkgJson = require('./helpers/packageJsonParse');


function flatten(structure) {
    return [].concat.apply([], structure);
}

function initJspm(files, basePath, jspm, client, emitter) {

    // Initialize jspm config if it wasn't specified in karma.conf.js
    if(!jspm)
        jspm = {};
    if(!jspm.config)
        jspm.config = pkgJson.getJspmPackageJson().configFile || 'jspm.config.js';
    if(!jspm.loadFiles)
        jspm.loadFiles = [];
    if(!jspm.serveFiles)
        jspm.serveFiles = [];
    if(!jspm.packages)
        jspm.packages = pkgJson.getJspmPackageJson().directories.packages || 'jspm_packages/';
    if(!client.jspm)
        client.jspm = {};
    if(jspm.paths !== undefined && typeof jspm.paths === 'object')
        client.jspm.paths = jspm.paths;
    if(jspm.meta !== undefined && typeof jspm.meta === 'object')
        client.jspm.meta = jspm.meta;
    if(jspm.testWrapperFunctionName !== undefined || jspm.testWrapperFunctionName !== null) {
        client.jspm.testWrapperFunctionName = jspm.testWrapperFunctionName;
    } else {
        client.jspm.testWrapperFunctionName = false;
    }

    // Pass on options to client
    client.jspm.useBundles = jspm.useBundles;
    client.jspm.stripExtension = jspm.stripExtension;
    client.jspm.preloadBySystemJS = [];

    // Adapters
    // -------
    if(jspm.adapter !== undefined) {

        if (jspm.adapter === 'angular2') {

            if (jspm.preloadBySystemJS) {
                client.jspm.preloadBySystemJS = jspm.preloadBySystemJS;
            } else {
                client.jspm.preloadBySystemJS = require('./adapters/angular2-preload-files');
            }

            /**
             * Angular test files may wrap tests in a function named 'main'
             */
            if(!client.jspm.testWrapperFunctionName) {
                client.jspm.testWrapperFunctionName = 'main';
            }

        } else {
            jspm.adapter = path.normalize(basePath + '/' + jspm.adapter);
        }
    } else {
        jspm.adapter = __dirname + '/adapters/default-adapter.js';
    }


    client.jspm.adapter = jspm.adapter;

    var packagesPath = path.normalize(basePath + '/' + jspm.packages + '/');
    var browserPath = path.normalize(basePath + '/' + jspm.browserConfig);
    var devPath = path.normalize(basePath + '/' + jspm.dev);
    var nodePath = path.normalize(basePath + '/' + jspm.node);
    var configFiles = Array.isArray(jspm.config) ? jspm.config : [jspm.config];
    var configPaths = configFiles.map(function(config) {
        return path.normalize(basePath + '/' + config);
    });

    // Add SystemJS loader and jspm config
    function getLoaderPath(fileName){
        var exists = glob.sync(packagesPath + fileName + '@*.js');
        if(exists && exists.length != 0){
            return packagesPath + fileName + '@*.js';
        } else {
            return packagesPath + fileName + '.js';
        }
    }

    // Needed for JSPM 0.17 beta
    if(jspm.nodeConfig) {
        files.unshift(filePattern.createPattern(nodePath));
    }

    if(jspm.devConfig) {
        files.unshift(filePattern.createPattern(devPath));
    }

    if(jspm.browserConfig) {
        files.unshift(filePattern.createPattern(browserPath));
    }


    Array.prototype.unshift.apply(files,
      configPaths.map(function(configPath) {
          return filePattern.createPattern(configPath)
      })
    );

    files.unshift(filePattern.createPattern(jspm.adapter));

    // Coverage
    files.unshift(filePattern.createPattern(__dirname + '/files/hookSystemJS.js'));
    files.unshift(filePattern.createPattern(__dirname + '/files/instrumenter.js'));

    // SystemJS
    files.unshift(filePattern.createPattern(__dirname + '/files/systemjsKarmaFix.js'));
    files.unshift(filePattern.createPattern(getLoaderPath('system-polyfills.src')));
    files.unshift(filePattern.createPattern(getLoaderPath('system.src')));

    // Loop through all of jspm.load_files and do two things
    // 1. Add all the files as "served" files to the files array
    // 2. Expand out and globs to end up with actual files for jspm to load.
    //    Store that in client.jspm.expandedFiles
    function addExpandedFiles() {
        client.jspm.expandedFiles = flatten(jspm.loadFiles.map(function (file) {
            files.push(filePattern.createServedPattern(basePath + '/' + (file.pattern || file), typeof file !== 'string' ? file : null));
            return filePattern.expandGlob(file, basePath);
        }));
    }
    addExpandedFiles();

    emitter.on('file_list_modified', addExpandedFiles);

    // Add served files to files array
    jspm.serveFiles.map(function(file){
        files.push(filePattern.createServedPattern(basePath + '/' + (file.pattern || file)));
    });

    // Allow Karma to serve all files within jspm_packages.
    // This allows jspm/SystemJS to load them
    var jspmPattern = filePattern.createServedPattern(
        packagesPath + '!(system-polyfills.src.js|system.src.js)/**', {nocache: jspm.cachePackages !== true}
    );
    jspmPattern.watched = false;
    files.push(jspmPattern);
}

initJspm.$inject = [
    'config.files',
    'config.basePath',
    'config.jspm',
    'config.client',
    'emitter'];

module.exports = initJspm;
