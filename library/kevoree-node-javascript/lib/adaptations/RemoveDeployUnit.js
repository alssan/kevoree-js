var AdaptationPrimitive = require('./AdaptationPrimitive'),
    AddDeployUnit       = require('./AddDeployUnit');

/**
 * RemoveDeployUnit Adaptation
 *
 * @type {RemoveDeployUnit} extend AdaptationPrimitive
 */
module.exports = AdaptationPrimitive.extend({
    toString: 'RemoveDeployUnit',

    execute: function (_super, callback) {
        _super.call(this, callback);

        var deployUnit  = this.node.getKevoreeCore().getCurrentModel().findByPath(this.trace.objPath),
            that        = this;

        var bootstrapper = this.node.getKevoreeCore().getBootstrapper();
        bootstrapper.uninstall(deployUnit, function (err) {
            if (err) return callback(err);

            that.mapper.removeEntry(deployUnit.path());
            return callback();
        });
    },

    undo: function (_super, callback) {
        _super.call(this, callback);

        var cmd = new AddDeployUnit(this.node, this.mapper, this.adaptModel, this.trace);
        cmd.execute(callback);

        return;
    }
});