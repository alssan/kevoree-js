var AdaptationPrimitive = require('./AdaptationPrimitive'),
  AddBinding          = require('./AddBinding');

module.exports = AdaptationPrimitive.extend({
  toString: 'RemoveBinding',

  execute: function (_super, callback) {
    _super.call(this, callback);

    var mBinding = this.node.getKevoreeCore().getCurrentModel().findByPath(this.trace.objPath);

    if (mBinding.port.eContainer().eContainer().name == this.node.getName()) {
      // this binding is related to the current node platform
      var chanInstance = this.mapper.getObject(mBinding.hub.path()),
          compInstance = this.mapper.getObject(mBinding.port.eContainer().path());

      if (chanInstance && compInstance) {
        try {
          var provided = mBinding.port.eContainer().provided;
          for (var i=0; i < provided.size(); i++) {
            var portInstance = this.mapper.getObject(provided.get(i).path());
            compInstance.removeInternalInputPort(portInstance);
            chanInstance.removeInternalInputPort(portInstance);
            chanInstance.removeInternalRemoteNodes(provided.get(i).path());
          }

          var required = mBinding.port.eContainer().required;
          for (var i=0; i < required.size(); i++) {
            var portInstance = this.mapper.getObject(required.get(i).path());
            compInstance.removeInternalOutputPort(portInstance);
            chanInstance.removeInternalRemoteNodes(required.get(i).path());
          }

          return callback();

        } catch (err) {
          return callback(err);
        }

      } else {
        return callback(new Error("RemoveBinding error: unable to find channel or component instance(s)."));
      }
    }

    return callback();
  },

  undo: function (_super, callback) {
    _super.call(this, callback);

    var cmd = new AddBinding(this.node, this.mapper, this.adaptModel, this.trace);
    cmd.execute(callback);

    return;
  }
});