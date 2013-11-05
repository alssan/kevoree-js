var Resolver    = require('kevoree-commons').Resolver,
  npm         = require('npm'),
  path        = require('path');

var NPMResolver = Resolver.extend({
  toString: 'NPMResolver',

  construct: function (modulesPath, logger) {
    this.modulesPath = modulesPath;
    this.log = logger;
  },

  resolve: function (deployUnit, callback) {
    var resolver = this;

    var packageName    = deployUnit.name,
        packageVersion = deployUnit.version;

    try {
      var KClass = require(path.resolve(resolver.modulesPath, 'node_modules', packageName));
      return callback(null, KClass);

    } catch (err) {
      this.log.info(this.toString(), "DeployUnit ("+packageName+"@"+packageVersion+") is not installed yet: downloading & installing it...");
      npm.load({}, function (err) {
        if (err) {
          return callback(new Error('Unable to load npm module'));
        }

        // load success
        npm.commands.install(resolver.modulesPath, [packageName+'@'+packageVersion], function installCallback(err) {
          if (err) {
            resolver.log.error(resolver.toString(), 'npm failed to install package \''+ packageName+':'+packageVersion+'\'');
            return callback(new Error("Bootstrap failure"));
          }

          // install sucess
          var KClass = require(path.resolve(resolver.modulesPath, 'node_modules', packageName));
          return callback(null, KClass);
        });
      });
    }
  },

  uninstall: function (deployUnit, callback) {
    var resolver = this;

    npm.load({}, function (err) {
      if (err) {
        // npm load error
        return callback(new Error('NPMResolver error: unable to load npm module'));
      }

      var packageName     = deployUnit.name,
        packageVersion  = deployUnit.version;

      // load success
      npm.commands.uninstall(resolver.modulesPath, [packageName+'@'+packageVersion], function uninstallCallback(er) {
        if (er) {
          // failed to load package:version
          return callback(new Error('NPMResolver failed to uninstall '+packageName+':'+packageVersion));
        }

        callback(null);
        return;
      });
    });
  }
});

module.exports = NPMResolver;