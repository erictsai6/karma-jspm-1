(function() {
  var slice = [].slice;

  describe('reporter', function() {
    var Browser, Collection, Collector, _, events, helper, istanbul, sinon,
      loadFile, m, mockAdd, mockCollector, mockCoverageMap, mockDefaultWatermarks,
      mockDispose, mockFs, mockGetFinalCoverage, mockHelper, mockMkdir, mockReportCreate,
      mockStore, mockSummarizeCoverage, mockWriteReport, mocks, nodeMocks, path, resolve;

    _ = require('lodash');
    sinon = require('sinon');
    events = require('events');
    path = require('path');
    istanbul = require('istanbul');
    helper = require('../node_modules/karma/lib/helper');
    Browser = require('../node_modules/karma/lib/browser');
    Collection = require('../node_modules/karma/lib/browser_collection');
    require('../node_modules/karma/lib/logger').setup('INFO', false, []);

    resolve = function() {
      var v;
      v = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return helper.normalizeWinPath(path.resolve.apply(path, v));
    };

    nodeMocks = require('mocks');
    loadFile = nodeMocks.loadFile;
    m = null;

    mockFs = {
      writeFile: sinon.spy()
    };

    mockStore = sinon.spy();
    mockStore.mix = function(fn, obj) {
      return istanbul.Store.mix(fn, obj);
    };

    mockAdd = sinon.spy();
    mockDispose = sinon.spy();
    mockGetFinalCoverage = sinon.stub().returns({});
    mockCollector = Collector = (function() {
      function Collector() {}

      Collector.prototype.add = mockAdd;

      Collector.prototype.dispose = mockDispose;

      Collector.prototype.getFinalCoverage = mockGetFinalCoverage;

      return Collector;

    })();
    mockWriteReport = sinon.spy();
    mockReportCreate = sinon.stub().returns({
      writeReport: mockWriteReport
    });
    mockMkdir = sinon.spy();
    mockHelper = {
      _: helper._,
      isDefined: function(v) {
        return helper.isDefined(v);
      },
      merge: function() {
        var v;
        v = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return helper.merge.apply(helper, v);
      },
      mkdirIfNotExists: mockMkdir,
      normalizeWinPath: function(path) {
        return helper.normalizeWinPath(path);
      }
    };

    mockCoverageMap = {
      add: sinon.spy(),
      get: sinon.spy()
    };

    mockDefaultWatermarks = {
      statements: [50, 80],
      branches: [50, 80],
      functions: [50, 80],
      lines: [50, 80]
    };

    mockSummarizeCoverage = sinon.stub().returns({
      lines: {
        total: 5,
        covered: 1,
        skipped: 0,
        pct: 20
      },
      statements: {
        total: 5,
        covered: 1,
        skipped: 0,
        pct: 20
      },
      functions: {
        total: 5,
        covered: 1,
        skipped: 0,
        pct: 20
      },
      branches: {
        total: 5,
        covered: 1,
        skipped: 0,
        pct: 20
      }
    });

    mocks = {
      fs: mockFs,
      istanbul: {
        Store: mockStore,
        Collector: mockCollector,
        Report: {
          create: mockReportCreate
        },
        config: {
          defaultConfig: sinon.stub().returns({
            reporting: {
              watermarks: mockDefaultWatermarks
            }
          })
        },
        utils: {
          summarizeCoverage: mockSummarizeCoverage,
          summarizeFileCoverage: mockSummarizeCoverage
        }
      },
      dateformat: require('dateformat'),
      './coverage-map': mockCoverageMap
    };

    beforeEach(function() {
      return m = loadFile(__dirname + '/../src/reporter.js', mocks);
    });

    describe('SourceCacheStore', function() {
      var options, store;
      options = store = null;
      beforeEach(function() {
        options = {
          sourceCache: {
            './foo': 'TEST_SRC_DATA'
          }
        };
        return store = new m.SourceCacheStore(options);
      });

      fit('should fail on call to keys', function() {
        return expect(function() {
          return store.keys();
        }).to["throw"]();
      });

      it('should call get and check cache data', function() {
        return expect(store.get('./foo')).toEqual('TEST_SRC_DATA');
      });

      it('should call hasKey and check cache data', function() {
        expect(store.hasKey('./foo')).to.be["true"];
        return expect(store.hasKey('./bar')).to.be["false"];
      });
      return it('should fail on call to set', function() {
        return expect(function() {
          return store.set();
        }).to["throw"]();
      });
    });

    return describe('CoverageReporter', function() {

      var browsers, emitter, fakeChrome, fakeOpera, mockLogger, reporter, rootConfig;
      rootConfig = emitter = reporter = null;
      browsers = fakeChrome = fakeOpera = null;
      mockLogger = {
        create: function(name) {
          return {
            debug: function() {
              return null;
            },
            info: function() {
              return null;
            },
            warn: function() {
              return null;
            },
            error: function() {
              return null;
            }
          };
        }
      };

      beforeEach(function() {
        rootConfig = {
          basePath: '/base',
          coverageReporter: {
            dir: 'path/to/coverage/'
          }
        };

        emitter = new events.EventEmitter;
        reporter = new m.CoverageReporter(rootConfig, mockHelper, mockLogger, emitter);
        browsers = new Collection(emitter);
        fakeChrome = new Browser('aaa', 'Windows NT 6.1 Chrome/16.0.912.75', browsers, emitter);
        fakeOpera = new Browser('bbb', 'Opera/9.80 Mac OS X Version/12.00', browsers, emitter);
        browsers.add(fakeChrome);
        browsers.add(fakeOpera);
        reporter.onRunStart();
        browsers.forEach(function(b) {
          return reporter.onBrowserStart(b);
        });
        return mockMkdir.reset();
      });

      it('has no pending file writings', function() {
        var done;
        done = sinon.spy();
        reporter.onExit(done);
        return expect(done).to.have.been.called;
      });

      it('has no coverage', function() {
        var result;
        result = {
          coverage: null
        };
        reporter.onBrowserComplete(fakeChrome, result);
        return expect(mockAdd).not.to.have.been.called;
      });

      it('should handle no result', function() {
        reporter.onBrowserComplete(fakeChrome, void 0);
        return expect(mockAdd).not.to.have.been.called;
      });

      it('should make reports', function() {
        var createArgs, dir;
        reporter.onRunComplete(browsers);
        expect(mockMkdir).to.have.been.calledTwice;
        dir = rootConfig.coverageReporter.dir;
        expect(mockMkdir.getCall(0).args[0]).to.deep.equal(resolve('/base', dir, fakeChrome.name));
        expect(mockMkdir.getCall(1).args[0]).to.deep.equal(resolve('/base', dir, fakeOpera.name));
        mockMkdir.getCall(0).args[1]();
        expect(mockReportCreate).to.have.been.called;
        expect(mockWriteReport).to.have.been.called;
        createArgs = mockReportCreate.getCall(0).args;
        expect(createArgs[0]).to.be.equal('html');
        expect(createArgs[1].browser).to.be.equal(fakeChrome);
        return expect(createArgs[1].emitter).to.be.equal(emitter);
      });

      it('should support a string for the subdir option', function() {
        var customConfig, dir, subdir;
        customConfig = _.merge({}, rootConfig, {
          coverageReporter: {
            subdir: 'test'
          }
        });
        reporter = new m.CoverageReporter(customConfig, mockHelper, mockLogger);
        reporter.onRunStart();
        browsers.forEach(function(b) {
          return reporter.onBrowserStart(b);
        });
        reporter.onRunComplete(browsers);
        expect(mockMkdir).to.have.been.calledTwice;
        dir = customConfig.coverageReporter.dir;
        subdir = customConfig.coverageReporter.subdir;
        expect(mockMkdir.getCall(0).args[0]).to.deep.equal(resolve('/base', dir, subdir));
        expect(mockMkdir.getCall(1).args[0]).to.deep.equal(resolve('/base', dir, subdir));
        mockMkdir.getCall(0).args[1]();
        expect(mockReportCreate).to.have.been.called;
        return expect(mockWriteReport).to.have.been.called;
      });

      it('should support a function for the subdir option', function() {
        var customConfig, dir;
        customConfig = _.merge({}, rootConfig, {
          coverageReporter: {
            subdir: function(browserName) {
              return browserName.toLowerCase().split(/[ \/-]/)[0];
            }
          }
        });
        reporter = new m.CoverageReporter(customConfig, mockHelper, mockLogger);
        reporter.onRunStart();
        browsers.forEach(function(b) {
          return reporter.onBrowserStart(b);
        });
        reporter.onRunComplete(browsers);
        expect(mockMkdir).to.have.been.calledTwice;
        dir = customConfig.coverageReporter.dir;
        expect(mockMkdir.getCall(0).args[0]).to.deep.equal(resolve('/base', dir, 'chrome'));
        expect(mockMkdir.getCall(1).args[0]).to.deep.equal(resolve('/base', dir, 'opera'));
        mockMkdir.getCall(0).args[1]();
        expect(mockReportCreate).to.have.been.called;
        return expect(mockWriteReport).to.have.been.called;
      });

      it('should support a specific dir and subdir per reporter', function() {
        var customConfig;
        customConfig = _.merge({}, rootConfig, {
          coverageReporter: {
            dir: 'useless',
            subdir: 'useless',
            reporters: [
              {
                dir: 'reporter1',
                subdir: function(browserName) {
                  return browserName.toLowerCase().split(/[ \/-]/)[0];
                }
              }, {
                dir: 'reporter2',
                subdir: function(browserName) {
                  return browserName.toUpperCase().split(/[ \/-]/)[0];
                }
              }
            ]
          }
        });

        reporter = new m.CoverageReporter(customConfig, mockHelper, mockLogger);
        reporter.onRunStart();
        browsers.forEach(function(b) {
          return reporter.onBrowserStart(b);
        });
        reporter.onRunComplete(browsers);
        expect(mockMkdir.callCount).toEqual(4);
        expect(mockMkdir.getCall(0).args[0]).to.deep.equal(resolve('/base', 'reporter1', 'chrome'));
        expect(mockMkdir.getCall(1).args[0]).to.deep.equal(resolve('/base', 'reporter1', 'opera'));
        expect(mockMkdir.getCall(2).args[0]).to.deep.equal(resolve('/base', 'reporter2', 'CHROME'));
        expect(mockMkdir.getCall(3).args[0]).to.deep.equal(resolve('/base', 'reporter2', 'OPERA'));
        mockMkdir.getCall(0).args[1]();
        expect(mockReportCreate).to.have.been.called;
        return expect(mockWriteReport).to.have.been.called;
      });

      it('should fallback to the default dir/subdir if not provided', function() {
        var customConfig;
        customConfig = _.merge({}, rootConfig, {
          coverageReporter: {
            dir: 'defaultdir',
            subdir: 'defaultsubdir',
            reporters: [
              {
                dir: 'reporter1'
              }, {
                subdir: function(browserName) {
                  return browserName.toUpperCase().split(/[ \/-]/)[0];
                }
              }
            ]
          }
        });

        reporter = new m.CoverageReporter(customConfig, mockHelper, mockLogger);
        reporter.onRunStart();
        browsers.forEach(function(b) {
          return reporter.onBrowserStart(b);
        });
        reporter.onRunComplete(browsers);
        expect(mockMkdir.callCount).toEqual(4);
        expect(mockMkdir.getCall(0).args[0]).to.deep.equal(resolve('/base', 'reporter1', 'defaultsubdir'));
        expect(mockMkdir.getCall(1).args[0]).to.deep.equal(resolve('/base', 'reporter1', 'defaultsubdir'));
        expect(mockMkdir.getCall(2).args[0]).to.deep.equal(resolve('/base', 'defaultdir', 'CHROME'));
        expect(mockMkdir.getCall(3).args[0]).to.deep.equal(resolve('/base', 'defaultdir', 'OPERA'));
        mockMkdir.getCall(0).args[1]();
        expect(mockReportCreate).to.have.been.called;
        return expect(mockWriteReport).to.have.been.called;
      });

      it('should not create directory if reporting text* to console', function() {
        var run;
        run = function() {
          reporter = new m.CoverageReporter(rootConfig, mockHelper, mockLogger);
          reporter.onRunStart();
          browsers.forEach(function(b) {
            return reporter.onBrowserStart(b);
          });
          return reporter.onRunComplete(browsers);
        };
        rootConfig.coverageReporter.reporters = [
          {
            type: 'text'
          }, {
            type: 'text-summary'
          }
        ];
        run();
        return expect(mockMkdir).not.to.have.been.called;
      });

      it('should create directory if reporting text* to file', function() {
        var run;
        run = function() {
          reporter = new m.CoverageReporter(rootConfig, mockHelper, mockLogger);
          reporter.onRunStart();
          browsers.forEach(function(b) {
            return reporter.onBrowserStart(b);
          });
          return reporter.onRunComplete(browsers);
        };
        rootConfig.coverageReporter.reporters = [
          {
            type: 'text',
            file: 'file'
          }
        ];
        run();
        expect(mockMkdir).to.have.been.calledTwice;
        mockMkdir.reset();
        rootConfig.coverageReporter.reporters = [
          {
            type: 'text-summary',
            file: 'file'
          }
        ];
        run();
        return expect(mockMkdir).to.have.been.calledTwice;
      });

      it('should support including all sources', function() {
        var customConfig;
        customConfig = _.merge({}, rootConfig, {
          coverageReporter: {
            dir: 'defaultdir',
            includeAllSources: true
          }
        });
        mockCoverageMap.get.reset();
        mockAdd.reset();
        reporter = new m.CoverageReporter(customConfig, mockHelper, mockLogger);
        reporter.onRunStart();
        browsers.forEach(function(b) {
          return reporter.onBrowserStart(b);
        });
        expect(mockCoverageMap.get).to.have.been.called;
        return expect(mockAdd).to.have.been.calledWith(mockCoverageMap.get.returnValues[0]);
      });

      it('should not retrieve the coverageMap if we aren\'t including all sources', function() {
        var customConfig;
        customConfig = _.merge({}, rootConfig, {
          coverageReporter: {
            dir: 'defaultdir',
            includeAllSources: false
          }
        });
        mockCoverageMap.get.reset();
        reporter = new m.CoverageReporter(customConfig, mockHelper, mockLogger);
        reporter.onRunStart();
        browsers.forEach(function(b) {
          return reporter.onBrowserStart(b);
        });
        return expect(mockCoverageMap.get).not.to.have.been.called;
      });

      it('should default to not including all sources', function() {
        var customConfig;
        customConfig = _.merge({}, rootConfig, {
          coverageReporter: {
            dir: 'defaultdir'
          }
        });
        mockCoverageMap.get.reset();
        reporter = new m.CoverageReporter(customConfig, mockHelper, mockLogger);
        reporter.onRunStart();
        browsers.forEach(function(b) {
          return reporter.onBrowserStart(b);
        });
        return expect(mockCoverageMap.get).not.to.have.been.called;
      });

      it('should pass watermarks to istanbul', function() {
        var customConfig, options, watermarks;
        watermarks = {
          statements: [10, 20],
          branches: [30, 40],
          functions: [50, 60],
          lines: [70, 80]
        };
        customConfig = _.merge({}, rootConfig, {
          coverageReporter: {
            reporters: [
              {
                dir: 'reporter1'
              }
            ],
            watermarks: watermarks
          }
        });

        mockReportCreate.reset();
        reporter = new m.CoverageReporter(customConfig, mockHelper, mockLogger);
        reporter.onRunStart();
        browsers.forEach(function(b) {
          return reporter.onBrowserStart(b);
        });
        reporter.onRunComplete(browsers);
        expect(mockReportCreate).to.have.been.called;
        options = mockReportCreate.getCall(0);
        return expect(options.args[1].watermarks).to.deep.equal(watermarks);
      });

      it('should merge with istanbul default watermarks', function() {
        var customConfig, options, watermarks;
        watermarks = {
          statements: [10, 20],
          lines: [70, 80]
        };
        customConfig = _.merge({}, rootConfig, {
          coverageReporter: {
            reporters: [
              {
                dir: 'reporter1'
              }
            ],
            watermarks: watermarks
          }
        });

        mockReportCreate.reset();
        reporter = new m.CoverageReporter(customConfig, mockHelper, mockLogger);
        reporter.onRunStart();
        browsers.forEach(function(b) {
          return reporter.onBrowserStart(b);
        });
        reporter.onRunComplete(browsers);
        expect(mockReportCreate).to.have.been.called;
        options = mockReportCreate.getCall(0);
        expect(options.args[1].watermarks.statements).to.deep.equal(watermarks.statements);
        expect(options.args[1].watermarks.branches).to.deep.equal(mockDefaultWatermarks.branches);
        expect(options.args[1].watermarks.functions).to.deep.equal(mockDefaultWatermarks.functions);
        return expect(options.args[1].watermarks.lines).to.deep.equal(watermarks.lines);
      });

      it('should not write reports after disposing the collector', function() {
        var run;
        run = function() {
          reporter = new m.CoverageReporter(rootConfig, mockHelper, mockLogger);
          reporter.onRunStart();
          browsers.forEach(function(b) {
            return reporter.onBrowserStart(b);
          });
          return reporter.onRunComplete(browsers);
        };
        rootConfig.coverageReporter.reporters = [
          {
            type: 'text'
          }, {
            type: 'html'
          }
        ];
        mockDispose.reset();
        mockWriteReport.reset();
        mockMkdir.reset();
        run();
        mockMkdir.getCall(0).args[1]();
        return expect(mockDispose).not.to.have.been.calledBefore(mockWriteReport);
      });

      it('should log errors on low coverage and fail the build', function() {
        var customConfig, customLogger, results, spy1;
        customConfig = _.merge({}, rootConfig, {
          coverageReporter: {
            check: {
              each: {
                statements: 50
              }
            }
          }
        });

        mockGetFinalCoverage.returns({
          './foo/bar.js': {},
          './foo/baz.js': {}
        });

        spy1 = sinon.spy();
        customLogger = {
          create: function(name) {
            return {
              debug: function() {
                return null;
              },
              info: function() {
                return null;
              },
              warn: function() {
                return null;
              },
              error: spy1
            };
          }
        };

        results = {
          exitCode: 0
        };

        reporter = new m.CoverageReporter(customConfig, mockHelper, customLogger);
        reporter.onRunStart();
        browsers.forEach(function(b) {
          return reporter.onBrowserStart(b);
        });

        reporter.onRunComplete(browsers, results);
        expect(spy1).to.have.been.called;
        return expect(results.exitCode).to.not.equal(0);
      });

      return it('should not log errors on sufficient coverage and not fail the build', function() {
        var customConfig, customLogger, results, spy1;
        customConfig = _.merge({}, rootConfig, {
          coverageReporter: {
            check: {
              each: {
                statements: 10
              }
            }
          }
        });

        mockGetFinalCoverage.returns({
          './foo/bar.js': {},
          './foo/baz.js': {}
        });

        spy1 = sinon.spy();
        customLogger = {
          create: function(name) {
            return {
              debug: function() {
                return null;
              },
              info: function() {
                return null;
              },
              warn: function() {
                return null;
              },
              error: spy1
            };
          }
        };

        results = {
          exitCode: 0
        };

        reporter = new m.CoverageReporter(customConfig, mockHelper, customLogger);
        reporter.onRunStart();
        browsers.forEach(function(b) {
          return reporter.onBrowserStart(b);
        });

        reporter.onRunComplete(browsers, results);
        expect(spy1).to.not.have.been.called;
        return expect(results.exitCode).toEqual(0);

      });
    });
  });

}).call(this);
