module.exports = {
  'framework:jspm': ['factory', require('./src/framework')],
  'reporter:jspm': ['type', require('./src/reporter')],
  'preprocessor:jspm': ['factory', require('./src/preprocessor')]
};
