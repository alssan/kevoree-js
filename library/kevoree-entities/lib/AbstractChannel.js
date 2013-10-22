var KevoreeEntity = require('./KevoreeEntity');

/**
 * AbstractChannel entity
 *
 * @type {AbstractChannel} extends KevoreeEntity
 */
module.exports = KevoreeEntity.extend({
  toString: 'AbstractChannel',

  construct: function () {
    this.inputs = {};
  },

  internalSend: function (outputPath, msg) {
    for (var inputPath in this.inputs) {
      this.onSend(outputPath, inputPath, msg);
    }
  },

  /**
   *
   * @param fromPortPath
   * @param destPortPath
   * @param msg
   */
  onSend: function (fromPortPath, destPortPath, msg) {},

  /**
   *
   * @param destPortPath
   * @param msg
   */
  localDispatch: function (destPortPath, msg) {
    var port = this.inputs[destPortPath];
    var comp = port.getComponent();
    // call component's input port function with 'msg' parameter
    comp[port.getInputPortMethodName()](msg);
  },

  addInternalInputPort: function (port) {
    this.inputs[port.getPath()] = port;
  },

  removeInternalInputPort: function (port) {
    delete this.inputs[port.getPath()];
  }
});