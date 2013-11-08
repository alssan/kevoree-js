var Class     = require('pseudoclass'),
    kevs      = require('./parser'),
    generator = require('./generator');
    waxeye    = require('./waxeye');

var KevScript = Class({
  toString: 'KevScript',

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
    if (ast instanceof waxeye.ParseError) return callback(ast);

    generator(ast, ctxModel, function (err, model) {
      if (err) return callback(err);

      callback(null, model);
    });
  }
});

module.exports = KevScript;