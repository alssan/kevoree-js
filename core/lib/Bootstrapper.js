;(function () {
    var Class   = require('pseudoclass'),
        log     = require('npmlog'),
        Util    = require('./../util/Util'),
        npm     = require('npm'),
        path    = require('path'),

        TAG     = 'Bootstrapper';

    /**
     *
     * @type {*}
     */
    module.exports = Class({
        toString: TAG,

        /**
         *
         */
        construct: function (modulesPath) {
            this.modulesPath = modulesPath;
            log.heading = 'kevoree';
        },

        /**
         *
         * @param nodeName
         * @param model
         * @param callback
         */
        bootstrapNodeType: function (nodeName, model, callback) {
            var nodeInstance = model.findNodesByID(nodeName);
            if (nodeInstance != undefined && nodeInstance != null) {
                var deployUnits = nodeInstance.getTypeDefinition().getDeployUnits();
                if (deployUnits.size() > 0) {
                    // TODO OMG THIS IS UGLY
                    // but I'm not sure yet how to handle DU > ask François
                    var packageName = deployUnits.get(0).getUnitName(),
                        packageVersion = deployUnits.get(0).getVersion(),
                        that = this;

                    npm.load({}, function (err) {
                        if (err) {
                            log.error(TAG, 'Unable to load npm module');
                            if (Util.callable(callback)) {
                                callback.call(this, new Error('Bootstrap failure'));
                                return;
                            }
                        }

                        // load success
                        npm.commands.install(that.modulesPath, [packageName+'@'+packageVersion], function (er) {
                            if (er) {
                                log.error(TAG, 'npm failed to install package %s:%s', packageName, packageVersion);
                                if (Util.callable(callback)) {
                                    callback.call(this, new Error("Bootstrap failure"));
                                    return;
                                }
                            }

                            // install sucess
                            if (Util.callable(callback)) {
                                var AbstractNode = require(path.resolve(that.modulesPath, 'node_modules', packageName));
                                callback.call(this, null, AbstractNode);
                                return;
                            }
                        });
                    });

                } else {
                    if (Util.callable(callback)) {
                        callback.call(this, new Error("'"+nodeName+"' NodeType deploy units not found. Have you forgotten to merge nodetype library ?"));
                        return;
                    }
                }
            } else {
                if (Util.callable(callback)) {
                    callback.call(this, new Error("Unable to find '"+nodeName+"' in the given model."));
                    return;
                }
            }
        }
    });
})();