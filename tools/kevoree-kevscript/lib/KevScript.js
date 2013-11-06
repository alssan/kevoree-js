var Class              = require('pseudoclass'),
    KevScriptParser    = require('./../parser/kevscript-parser'),
    KevScriptChecker   = require('./KevScriptChecker'),
    KevScriptGenerator = require('./KevScriptGenerator');

var KevScript = Class({
  toString: 'KevScript',

  construct: function () {
    this.checker = new KevScriptChecker();
    this.generator = new KevScriptGenerator();
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
      return this.generator.gen(parsedModel);
    } else return null;
  }
});

module.exports = KevScript;