var Resolver = require('kevoree-commons').Resolver;
var getJSONModel = require('kevoree-model-sync').getJSONModel;

/**
 * Default NPM resolver
 * @type {*}
 */
module.exports = Resolver.extend({
  toString: 'NPMResolver',

  resolve: function (deployUnit, callback) {
    getJSONModel(deployUnit.name, deployUnit.version, callback);
  },

  uninstall: function (deployUnit, callback) {
    // TODO
    callback();
  }
});