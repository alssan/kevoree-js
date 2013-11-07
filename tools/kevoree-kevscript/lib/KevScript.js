var Class     = require('pseudoclass'),
    kevs      = require('./../parser/kevscript-parser'),
    validator = require('./validator'),
    generator = require('./generator');

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

    var parsedModel = kevs.parse(data);
    generator(parsedModel, ctxModel, function (err, model) {
      if (err) return callback(err);

      validator(model, function (err) {
        if (err) return callback(err);

        // validation ok :)
        callback(null, model);
      });
    });
  }
});

module.exports = KevScript;