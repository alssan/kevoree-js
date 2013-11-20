var Class       = require('pseudoclass'),
    kevs        = require('./parser'),
    interpreter = require('./interpreter'),
    NPMResolver = require('./NPMResolver');

var KevScript = Class({
  toString: 'KevScript',

  construct: function (options) {
    this.options = options || {};

    // if no resolver given during construction, give a default NPMResolver
    var resolversCount = 0;
    for (var i in this.options.resolvers) { resolversCount++ };
    if (resolversCount == 0) this.options.resolvers = {npm: new NPMResolver()};
  },

  /**
   * Parses given KevScript source-code in parameter 'data' and returns a ContainerRoot.
   * @param data string
   * @param callback function (Error, ContainerRoot)
   * @throws Error on SyntaxError and on source code validity and such
   */
  parse: function (data, ctxModel, callback) {
    if (typeof(callback) == 'undefined') {
      callback = ctxModel;
      ctxModel = null;

    }

    var parser = new kevs.Parser();
    var ast = parser.parse(data);
    if (ast.type != 'kevScript') {
      return callback(new Error(ast.toString()));
    } else {
      interpreter(ast, ctxModel, this.options.resolvers, function (err, model) {
        if (err) return callback(err);

        return callback(null, model);
      });
    }
  }
});

module.exports = KevScript;