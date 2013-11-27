var Class = require('pseudoclass');

/**
 * Bootstrapper API
 * @type {Bootstrapper}
 */
var Bootstrapper = Class({
    toString: 'Bootstrapper',

    /**
     *
     * @param nodeName
     * @param model
     * @param callback
     */
    bootstrapNodeType: function (nodeName, model, callback) {
        callback = callback || function () {};

        var nodeInstance = model.findNodesByID(nodeName);
        if (nodeInstance != undefined && nodeInstance != null) {
            var deployUnits = nodeInstance.typeDefinition.deployUnits;
            if (deployUnits.size() > 0) {
                // bootstrap node deploy unit
                this.bootstrap(deployUnits.get(0), callback); // TODO get(0) on DU => dont do that oO

            } else {
                callback.call(this, new Error("'"+nodeName+"' NodeType deploy units not found. Have you forgotten to merge nodetype library ?"));
                return;
            }
        } else {
            callback.call(this, new Error("Unable to find '"+nodeName+"' in the given model."));
            return;
        }
    },

    /**
     *
     * @param deployUnit
     * @param forceInstall [optional] boolean to indicate whether or not we should force re-installation
     * @param callback(Error, Clazz, ContainerRoot)
     */
    bootstrap: function (deployUnit, forceInstall, callback) {},

    /**
     *
     * @param deployUnit
     * @param callback
     */
    uninstall: function (deployUnit, callback) {}
});

module.exports = Bootstrapper;