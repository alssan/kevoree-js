var Class            = require('pseudoclass'),
    KevScriptParser  = require('./../parser/kevscript-parser'),
    KevScriptChecker = require('./KevScriptChecker');

var KevScript = Class({
  toString: 'KevScript',

  construct: function () {
    this.checker = new KevScriptChecker();
  },

  /**
   * Parses given KevScript source-code in parameter 'data' and returns a ContainerRoot.
   * @param data string
   * @return {ContainerRoot}
   * @throws Error on SyntaxError and on source code validity and such
   */
  parse: function (data) {
    var parsedModel = KevScriptParser.parse(data);
    if (this.checker.check(parsedModel)) {

    } else return null;
  }
});

module.exports = KevScript;