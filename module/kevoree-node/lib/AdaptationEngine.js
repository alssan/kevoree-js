;(function () {
    var Class           = require('pseudoclass'),
        kLib            = require('kevoree-library'),
        InstanceManager = require('./InstanceManager');

    // CONSTANTS
    var ADD_INSTANCE_TRACE  = [
            'org.kevoree.Group',
            'org.kevoree.Node',
            'org.kevoree.ComponentInstance',
            'org.kevoree.Channel'
        ],
        ADD_DEPLOY_UNIT     = [
            'org.kevoree.DeployUnit'
        ];

    /**
     * AdaptationEngine knows each AdaptationPrimitive command available
     * for JavascriptNode.
     * Plus, it handles instances and deploy units references
     *
     * @type {AdaptationEngine}
     */
    var AdaptationEngine = Class({
        toString: 'AdaptationEngine',

        construct: function (node) {
            this.node = node;
            this.instanceManager = new InstanceManager();

            // cache commands once loaded to prevent using require() multiple times
            this.commandsCache = {};
        },

        /**
         * Process traces to find the right adaptation primitive command
         * Returns a command to execute in order to do the adaptation logic
         * @param traces
         * @param model
         * @returns {Array}
         */
        processTraces: function (traces, model) {
            var cmdList = [];
            for (var i=0; i < traces.size(); i++) {
                var trace = JSON.parse(traces.get(i));
                cmdList.push(this.processTrace(trace, model));
            }

            return this.sortCommands(cmdList);
        },

        /**
         *
         * @param trace
         * @returns {AdaptationPrimitive}
         */
        processTrace: function (trace, model) {
            var cmd = null;

            switch (trace.traceType) {
                case kLib.org.kevoree.modeling.api.util.ActionType.$ADD:
                    if (trace.typename) {

                        if (ADD_INSTANCE_TRACE.indexOf(trace.typename) != -1) {
                            AdaptationPrimitive = this.getCommand('AddInstance');
                            cmd = new AdaptationPrimitive(this.node, this.instanceManager);
                            var instance = model.findByPath(trace.previouspath);
                            cmd.setInstance(instance);
                            return cmd;

                        } else if (ADD_DEPLOY_UNIT.indexOf(trace.typename) != -1) {
                            AdaptationPrimitive = this.getCommand('AddDeployUnit');
                            cmd = new AdaptationPrimitive(this.node, this.instanceManager);
                            var deployUnit  = model.findByPath(trace.previouspath);
                            cmd.setDeployUnit(deployUnit);
                            return cmd;
                        }
                    }

                case kLib.org.kevoree.modeling.api.util.ActionType.$SET:
                case kLib.org.kevoree.modeling.api.util.ActionType.$REMOVE:
                case kLib.org.kevoree.modeling.api.util.ActionType.$ADD_ALL:
                case kLib.org.kevoree.modeling.api.util.ActionType.$REMOVE_ALL:
                case kLib.org.kevoree.modeling.api.util.ActionType.$RENEW_INDEX:
                default:
                    //console.log(JSON.stringify(trace, null, 2));
                    var AdaptationPrimitive = this.getCommand('Noop');
                    cmd = new AdaptationPrimitive(this.node, this.instanceManager);
                    return cmd;
            }
        },

        sortCommands: function (list) {
            var noops           = [],
                addInstances    = [],
                addDeployUnits  = [],
                removeInstances = [],
                unknowns        = [];

            for (var i in list) {
                if (list[i] instanceof this.getCommand('Noop')) {
                    noops.push(list[i]);

                } else if (list[i] instanceof this.getCommand('AddInstance')) {
                    addInstances.push(list[i]);

                } else if (list[i] instanceof this.getCommand('AddDeployUnit')) {
                    addDeployUnits.push(list[i]);

                } else if (list[i] instanceof this.getCommand('RemoveInstance')) {
                    removeInstances.push(list[i]);

                } else {
                    unknowns.push(list[i]);
                }
            }

            return (((removeInstances
                        .concat(addDeployUnits))
                            .concat(addInstances))
                                .concat(noops))
                                    .concat(unknowns);
        },

        /**
         * Load or retrieve from cache command by name
         * @param name
         * @returns {AdaptationPrimitive}
         */
        getCommand: function (name) {
            if (this.commandsCache[name]) return this.commandsCache[name];

            this.commandsCache[name] = require('./adaptations/'+name+'.js');
            return this.commandsCache[name];
        }
    });

    module.exports = AdaptationEngine;
})();