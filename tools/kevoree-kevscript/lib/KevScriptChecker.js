var Class = require('pseudoclass');

var KevScriptChecker = Class({
  toString: 'KevScriptChecker',

  /**
   * Checks if parsedModel from KevScript source-code is valid or not
   * @param parsedModel
   * @throws Error on model invalidity
   */
  check: function (parsedModel) {
    return true;
  }
});

module.exports = KevScriptChecker;