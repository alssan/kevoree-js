var Resolver = require('kevoree-commons').Resolver;
var getJSONModel = require('kevoree-model-sync').getJSONModel;

module.exports = Resolver.extend({
  toString: 'NPMResolver',

  resolve: function (deployUnit, callback) {
    getJSONModel(deployUnit.name, deployUnit.version, callback);
  },

  uninstall: function () {
    // TODO
  }
});