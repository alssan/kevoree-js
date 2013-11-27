var Resolver = require('kevoree-commons').Resolver;
var KevoreeLogger = require('kevoree-commons').KevoreeLogger;
var kevoree = require('kevoree-library').org.kevoree;
var npm = require('npm');
var path = require('path');

var FileResolver = Resolver.extend({
  toString: 'FileResolver',

  construct: function (modulesPath, logger) {
    this.modulesPath = modulesPath || '';
    this.log = logger || new KevoreeLogger(this.toString());
    this.loader = new kevoree.loader.JSONModelLoader();
  },

  resolve: function (deployUnit, callback) {
    var doResolve = function() {
      var Clazz = require(path.resolve(this.modulesPath, 'node_modules', deployUnit.name));
      var model = require(path.resolve(this.modulesPath, 'node_modules', deployUnit.name, 'kevlib.json'));
      return callback(null, Clazz, this.loader.loadModelFromString(JSON.stringify(model)).get(0));
    }.bind(this);

    try {
      // try to use library without installing it: maybe it has already been done
      doResolve();

    } catch (err) {
      // loading library without installing it failed: install it then !
      npm.load({}, function (err) {
        if (err) return callback(new Error('Unable to load npm module'));

        npm.commands.install(this.modulesPath, [deployUnit.url], function (err) {
          if (err) return callback(new Error('Unable to install "'+deployUnit.name+'" (deployUnit.url: "'+deployUnit.url+'")'));

          doResolve();

        }.bind(this));
      }.bind(this));
    }
  },

  uninstall: function (deployUnit, callback) {
    npm.load({}, function (err) {
      if (err) return callback(new Error('Unable to load npm module'));

      npm.commands.uninstall(this.modulesPath, [deployUnit.url], function (err) {
        if (err) return callback(new Error('Unable to uninstall "'+deployUnit.name+'" (deployUnit.url: "'+deployUnit.url+'")'));

        return callback();
      });
    });
  }
});

module.exports = FileResolver;