# karma-jspm  [![Build Status](https://travis-ci.org/UIUXEngineering/karma-jspm.svg?branch=master)](https://travis-ci.org/UIUXEngineering/karma-jspm)

This plugin is originally a fork of [Workiva/karma-jspm](https://github.com/Workiva/karma-jspm). 
Among the additional features, this version utilizes SystemJS to load, 
transpile, run your tests, and to generate code coverage. Special configurations
allow for angular2 testing.

There is no need to preprocess ( pre-transpile ) your code before 
running tests or to generate a coverage report. Your report may be
remapped to the original TypeScript or ES6 source code.

See a sample implementation of this plugin at [angular2-jspm-typescript-seed](https://github.com/UIUXEngineering/angular2-jspm-typescript-seed).

##Installation

Available in npm: `npm install karma-jspm --save-dev`

**This plugin assumes you are using jspm in your project.** You will 
need to have a `config.js` in the root of your project (though this 
is configurable) as well as a `jspm_packages` directory containing 
systemjs and the es6-module-loader.

**This plugin can now support JSPM 0.17 beta**
##Configuration##
For simple architectures, minimal configuration is needed.

*karma.conf.js*

Include this plugin in your frameworks:

```js
frameworks: ['jspm', 'jasmine'],
```

Because this plugin is published in the npm organization @uiuxengineering,
you will have to require it directly in the plugins property of your
karma config. Unfortunately, this means you will have to name all your
plugins. Suggestions welcome to fix this.

```js
plugins: [
      require('@uiuxengineering/karma-jspm'),
      'karma-jasmine',
      'karma-chrome-launcher'
    ],
```

Set ```basePath``` of your karma config to the the directory where
you will serve the development of your app.
```js
config.set({
    
    basePath: './',
    
    jspm: {
        // Edit this to your needs
        loadFiles: ['src/**/*.js', 'test/**/*.js']
    }
}
```

####loadFiles
Required  
**Default**: *undefined*

The `loadFiles` configuration tells karma-jspm which files should 
be dynamically loaded via systemjs *before* the tests run. Globs 
or regular file paths are acceptable.


**You should not include these in the regular karma files array.** 
karma-jspm takes care of this for you.

```js
config.set({
    
    basePath: './',
    
    jspm: {
        // Edit this to your needs
        loadFiles: ['src/**/*.js', 'test/**/*.js']
    }
}
```

####serveFiles
Optional  
**Default**: *undefined*

You may want to make additional files/a file pattern available for 
jspm to load, but not load it right away. Simply add that to `serveFiles`.
One use case for this is to only put test specs in `loadFiles`, and jspm 
will only load the src files when and if the test files require them. 
Such a config would look like this:

```js
config.set({

    basePath: './src/client',
    jspm: {
        // relative to basePath in karma config
        loadFiles: ['test/**/*.js'],
        serveFiles: ['src/**/*.js']
    }
}
```

For more complex architectures, additional configurations may be necessary.

####config
Optional  
**Default**: *parsed from package.json*

You may have named your jspm `config.js`. The package.json configuration
for jspm beta may change; if you have issues, provide the path to 
your config file.

```js
config.set({

    basePath: './src/client',
    
    jspm: {
        // relative to basePath in karma config
        config: "path/to/myJspmConfig.js"
    }
}    
```

####packages
Optional  
**Default**: *parsed from package.json*

You may have named your `jspm_packages` directory to something else. 
The package.json configuration for jspm beta may change; if you have 
issues, provide the path to your packages directory.

```js
config.set({

    basePath: './src/client',
    
    jspm: {
        // relative to basePath in karma config
        packages: "path/to/my_jspm_modules/"
    }
}    
```

####browserConfig
*JSPM 0.17 Beta*  
Optional  
**Default**: *undefined*

For JSPM 0.17 Beta, you can to specify the `jspm.browser.js`.

```js
config.set({

    basePath: './src/client',
    
    jspm: {
        // relative to basePath in karma config
        browserConfig: "path/to/myJspmBrowser.js"
    }
}    
```

####devConfig
*JSPM 0.17 Beta*  
Optional  
**Default**: *undefined*

For JSPM 0.17 Beta, you can to specify the `jspm.dev.js`.

```js
config.set({

    basePath: './src/client',
    
    jspm: {
        // relative to basePath in karma config
        devConfig: "path/to/myJspmDev.js"
    }
}    
```

####nodeConfig
*JSPM 0.17 Beta*  
Optional  
**Default**: *undefined*

For JSPM 0.17 Beta, you can to specify the `jspm.node.js` file.

```js
config.set({

    basePath: './src/client',
    
    jspm: {
        // relative to basePath in karma config
        nodeConfig: "path/to/myJsonNode.js" 
    }
}    
```

####useBundles
Optional  
**Default**: *false*

By default karma-jspm ignores jspm's bundles configuration. To re-enable 
it, specify the `useBundles` option.

```js
config.set({

    basePath: './src/client',
    
    jspm: {
        useBundles: true
    }
}
```


####paths
Optional  
**Default**: *undefined*

Depending on your framework and project structure it might be necessary 
to override jspm paths for the testing scenario.In order to do so just 
add the `paths` property to the jspm config object in your 
karma-configuration file, along with the overrides:

```js
jspm: {
    paths: {
        '*': 'yourpath/*.js',
        ...
    }
}
```


####stripExtension
Optional  
**Default**: *undefined*

By default the plugin will strip the file extension of the js files. 
To disable that, specify the `stripExtension` option:

```js
jspm: {
    stripExtension: false
}
```

####cachePackages
Optional  
**Default**: *undefined*

Most of the time, you do not want to cache your entire jspm_packages 
directory, but serve it from the disk. This is done by default, but 
can be reversed as follows:

```js
jspm: {
    cachePackages: true
}
```

####adapter
Optional  
**Default**: *undefined*

By default, an adapter implementing ```karma.start()``` is provided to 
launch unit tests. You may use a custom adapter.

```js
jspm: {
    adapter: 'youradapter.js'
}
```

####testWrapperFunction
Optional  
**Default**: *undefined*

Some test implementations require the tests ( describe blocks ) to be 
wrapped in a function. Set the name of the wrapper function.

```js
jspm: {
    testWrapperFunction: 'main'
}
```

####preloadBySystemJS
Optional  
**Default**: *undefined*

SystemJS loads files from the ```jspm_packages``` directory ( or your 
named directory ) by concatenating the file and version number that 
is mapped in the jspm.config.js file. So loading af file with SystemJS 
with the path string "zone.js/dist/zone.js" would actually load with 
the path similar to "jspm_packages/npm/zone.js@0.6.12/dist/zone.js". 

You can use SystemJS to pre-load files before tests are run the same 
as you would in your app, rather than using karma to load the files by 
manually configure the paths.

Provide an array of path strings that are the same as you would import 
them in your app. They will load in same order as your array.

```js
jspm: {
    preloadBySystemJS: [
                         'zone.js/dist/zone.js',
                         '@angular/core/testing',
                         '@angular/platform-browser-dynamic/testing',
                         'zone.js/dist/jasmine-patch.js',
                         'zone.js/dist/async-test.js',
                         'zone.js/dist/fake-async-test.js'
                       ]
}
```

###Code Coverage
A coverage Instrumenter is provided with a SystemJS hook in the browser 
using @guybedford's example from his [blog](http://guybedford.com/systemjs-mocha-istanbul). Similar
to the karma-coverage plugin, you set the preprocessor to 'jspm'. This 
does NOT transpile files, but only selects which files to include in your 
coverage report.

```js
preprocessors: {
    'app/**/!(*.spec).ts': ['jspm']
},
```

The reporter works the same as other karma reporters.
```js
reporters: ['jspm'],
```

####remap
Optional  
**Default**: *false*

Configure the output of the reports using coverageReporter property. Set
```remap``` to true to map the coverage reports to the original typescript 
or es6 files.

```js
coverageReporter: {
      
      // map coverage to source typescript or es6 files.
      remap: true, 
      
      dir: process.cwd() + '/coverage',
      
      reporters: [

        // will generate html report
        {type: 'html'},

        // will generate json report file and this report is loaded to 
        // make sure failed coverage cause gulp to exit non-zero
        {type: 'json', file: 'coverage-final.json'},

        // will generate Icov report file and this report is published to coveralls
        {type: 'lcov'},

        // it does not generate any file but it will print coverage to console
        // a summary of the coverage
        // {type: 'text-summary'}, 

        // it does not generate any file but it will print coverage to console
        // a detail report of every file
        {type: 'text'}
      ]
    }
```

###Angular2 Configurations

####adapter
Required  
**Set to**: *'angular2'*

If you are using angular2, specify 'angular2' as your adapter, and an a 
adapter specific to angular2 tests will be used.


```js
jspm: {
    adapter: 'angular2'
}
```

####testWrapperFunctionName
Optional  
**Default**: *'main'*

Angular2 tests may implement a wrapper function. By default, the 
wrapper function is ```main()```. You can override this with 
either another function name for an empty string if a wrapper 
function is not desired.

```js
jspm: {
    testWrapperFunctionName: 'nameOfFunction'
}
```

####preloadBySystemJS
Optional  
**Default**: *see below*

For Angular2 testing, SystemJS will automatically pre-load the following 
files before tests are run, so they are ot necessary to load in the karma 
config.

```js

[
    'zone.js/dist/zone.js',
    '@angular/core/testing',
    '@angular/platform-browser-dynamic/testing',
    'zone.js/dist/jasmine-patch.js',
    'zone.js/dist/async-test.js',
    'zone.js/dist/fake-async-test.js'
]
```
             
If you want to change the pre-load file list above, you may override 
with the ```preloadBySystemJS``` config.

```js
jspm: {
    preloadBySystemJS: [ 'fileA.js', 'fileB.js']
}
```
