var istanbulGlobal;
var _originalSources = {};

(function(SystemJS, Instrumenter) {

  if (!System) {
    throw new Error("SystemJS was not found. Please make sure you have " +
      "initialized jspm via installing a dependency with jspm, " +
      "or by running 'jspm dl-loader'.");
  }

  if (!Instrumenter) {
    throw new Error("Instrumenter was not found. Please make sure you have" +
      "loaded coverage/instrumenter.js.");
  }

  function hookSystemJS(loader, exclude, coverageGlobal) {
    if (loader.translate.coverageAttached)
      return;

    if (coverageGlobal)
      istanbulGlobal = coverageGlobal;

    // attach istanbul coverage creation
    if (typeof global != 'undefined' && !istanbulGlobal)
      for (var g in global) {
        if (g.match(/\$\$cov_\d+\$\$/)) {
          istanbulGlobal = g;
          break;
        }
      }
    istanbulGlobal = istanbulGlobal || '__coverage__';

    var instrumenter = new Instrumenter({
      coverageVariable: istanbulGlobal
    });

    var loaderTranslate = loader.translate;
    loader.translate = function(load) {
      var originalSource = load.source;
      return loaderTranslate.apply(this, arguments)
        .then(function(source) {
          if (load.metadata.format == 'json' || load.metadata.format == 'defined' || load.metadata.loader && load.metadata.loaderModule.build === false)
            return source;

          var name = load.address.substr(System.baseURL.length);

          // exclude json files ( if load.metadata.format did not catch above
          if (extension(name) == 'json' || extension(name) == 'xmp') {
            return source;
          }

          // excludes
          if (exclude && exclude(load.address))
            return source;

          // automatically exclude sources outside the baseURL
          if (load.address.substr(0, System.baseURL.length) != System.baseURL)
            return source;

          _originalSources[name] = {
            source: originalSource,
            sourceMap: load.metadata.sourceMap
          };

          try {
            return instrumenter.instrumentSync(source, name);
          }
          catch (e) {
            var newErr = new Error('Unable to instrument "' + name + '" for istanbul.\n\t' + e.message);
            newErr.stack = 'Unable to instrument "' + name + '" for istanbul.\n\t' + e.stack;
            newErr.originalErr = e.originalErr || e;
            throw newErr;
          }
        });
    };
    loader.translate.coverageAttached = true;
  }

  function extension(fname) {
    return fname.substr((~-fname.lastIndexOf(".") >>> 0) + 2);
  }

  window.hookSystemJS = hookSystemJS;

})(window.SystemJS, window.Instrumenter);
