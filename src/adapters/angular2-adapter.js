if (!Object.hasOwnProperty('name')) {
  Object.defineProperty(Function.prototype, 'name', {
    get: function() {
      var matches = this.toString().match(/^\s*function\s*(\S*)\s*\(/);
      var name = matches && matches.length > 1 ? matches[1] : "";
      Object.defineProperty(this, 'name', {value: name});
      return name;
    }
  });
}

(function(karma, System) {

  // ========================================
  // Port from karma-jspm adapter
  // See https://github.com/Workiva/karma-jspm/blob/master/src/adapter.js
  // ========================================


  if (!System) {
    throw new Error("SystemJS was not found. Please make sure you have " +
      "initialized jspm via installing a dependency with jspm, " +
      "or by running 'jspm dl-loader'.");
  }

  System.config({ baseURL: 'base' });

  var stripExtension = typeof karma.config.jspm.stripExtension === 'boolean' ? karma.config.jspm.stripExtension : true;

  // Prevent immediately starting tests.
  karma.loaded = function() {


    // ========================================
    // kamra-jspm requirements
    // ========================================

    if(karma.config.jspm.paths !== undefined &&
      typeof karma.config.jspm.paths === 'object') {
      System.config({
        paths: karma.config.jspm.paths
      });
    }

    if(karma.config.jspm.meta !== undefined &&
      typeof karma.config.jspm.meta === 'object') {
      System.config({
        meta: karma.config.jspm.meta
      });
    }

    // Exclude bundle configurations if useBundles option is not specified
    if(!karma.config.jspm.useBundles){
      System.bundles = [];
    }

    // ========================================
    // Custom implementation for angular2
    // ========================================

    // hook coverage into SystemJS
    window.hookSystemJS(System, function exclude(address) {
      // files to ignore coverage
      // return !address.match(/example-app|example-tests/);
      return false;
    });

    var angularTestingProvider;
    var angularPlatformBrowserProvider;

    var proloadPromiseChain = Promise.resolve();
    for (var i = 0; i <  karma.config.jspm.preloadBySystemJS.length; i++) {
      proloadPromiseChain = proloadPromiseChain.then((function (moduleName) {
        return function () {

          return System['import'](moduleName).then(function(module) {

            if (module.hasOwnProperty('setBaseTestProviders')) {
              angularTestingProvider = module;
            }

            if (module.hasOwnProperty('TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS')) {
              angularPlatformBrowserProvider = module;
            }

          });

        };
      })(extractModuleName(karma.config.jspm.preloadBySystemJS[i])));
    }

    proloadPromiseChain.then(function() {

      if (angularTestingProvider, angularPlatformBrowserProvider) {
        angularTestingProvider.setBaseTestProviders(angularPlatformBrowserProvider.TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
          angularPlatformBrowserProvider.TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS);
      }

      // Load everything specified in loadFiles in the specified order
      var promiseChain = Promise.resolve();
      for (var j = 0; j < karma.config.jspm.expandedFiles.length; j++) {
        promiseChain = promiseChain.then((function (moduleName) {
          return function () {

            /**
             * Test files require special handling. See wrapper method implementation below.
             */
            if (/[\.|_]spec\.ts$/.test(moduleName) || /[\.|_]spec\.js$/.test(moduleName)) {
              return System['import'](moduleName).then(function(module) {

                if (module.hasOwnProperty('main')) {

                  /**
                   * Test files have a wrapper method 'main' around their describe blocks.
                   * Trigger tests by calling the wrapper method.
                   */
                  module.main();
                  return true;
                } else {
                  throw new Error('Module ' + moduleName + ' does not implement main() method.');
                }
              });
            } else {

              /**
               * Load non-test files normally.
               */
              return System['import'](moduleName);
            }


          };
        })(extractModuleName(karma.config.jspm.expandedFiles[j])));
      }

      promiseChain.then(function () {

        if (window.__coverage__) {
          window.__coverage__._originalSources = _originalSources;
        }


        karma.start();
      }, function (e) {
        karma.error(e.name + ": " + e.message);
      });
    })
    // });
  };

  function extractModuleName(fileName) {

    if (karma.config.jspm.prefix) {
      // fileName = karma.config.jspm.prefix + fileName;
    }

    if (stripExtension) {
      return fileName.replace(/\.js$/, "");
    }
    return fileName;
  }
})(window.__karma__, window.SystemJS);
