var AdaptationPrimitive = require('./AdaptationPrimitive'),
    RemoveBinding       = require('./RemoveBinding');

module.exports = AdaptationPrimitive.extend({
  toString: 'AddBinding',

  execute: function (_super, callback) {
    _super.call(this, callback);

    var mBinding = this.adaptModel.findByPath(this.trace.previousPath);

    if (mBinding.port.eContainer().eContainer().name == this.node.getName()) {
      // this binding is related to the current node platform
      var chanInstance = this.mapper.getObject(mBinding.hub.path()),
          compInstance = this.mapper.getObject(mBinding.port.eContainer().path()),
          portInstance = this.mapper.getObject(mBinding.port.path());

      if (chanInstance && compInstance) {
        try {
          portInstance.setComponent(compInstance);
          portInstance.setChannel(chanInstance);

          if (this.isInputPortType(mBinding.port)) {
            compInstance.addInternalInputPort(portInstance);
            chanInstance.addInternalInputPort(portInstance);
          } else {
            compInstance.addInternalOutputPort(portInstance);
          }

          return callback();

        } catch (err) {
          return callback(err);
        }

      } else {
        return callback(new Error("AddBinding error: unable to find channel or component instance(s)."));
      }
    }

    return callback();
  },

  undo: function (_super, callback) {
    _super.call(this, callback);

    var cmd = new RemoveBinding(this.node, this.mapper, this.adaptModel, this.trace);
    cmd.execute(callback);

    return;
  },

  isInputPortType: function (kPort) {
    var kCompTD = kPort.eContainer().typeDefinition;
    var inputs = kCompTD.provided ? kCompTD.provided.iterator() : null;
    if (inputs) {
      while (inputs.hasNext()) {
        var input = inputs.next();
        if (input.name == kPort.portTypeRef.name) return true;
      }
    }

    var outputs = kCompTD.required ? kCompTD.required.iterator() : null;
    if (outputs) {
      while (outputs.hasNext()) {
        var output = outputs.next();
        if (output.name == kPort.portTypeRef.name) return false;
      }
    }

    return false;
  }
});