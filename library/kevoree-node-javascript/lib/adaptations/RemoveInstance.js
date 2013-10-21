var AdaptationPrimitive = require('./AdaptationPrimitive'),
    AddInstance         = require('./AddInstance'),
    kevoree             = require('kevoree-library').org.kevoree;

/**
 * RemoveInstance Adaptation command
 *
 * @type {RemoveInstance} extends AdaptationPrimitive
 */
module.exports = AdaptationPrimitive.extend({
  toString: 'RemoveInstance',

  /**
   *
   * @param _super AdaptationPrimitive parent
   * @param callback function: if this function first parameter != null it means that there is an error
   */
  execute: function (_super, callback) {
    _super.call(this, callback);

    var kInstance = this.node.getKevoreeCore().getCurrentModel().findByPath(this.trace.objPath);

    var instance = this.mapper.getObject(kInstance.path());
    if (instance != undefined && instance != null) {
      this.mapper.removeEntry(kInstance.path());
      this.doSpecificTypeProcess(kInstance);
      callback(null);
      return;

    } else {
      callback(new Error("RemoveInstance error: unable to remove instance "+kInstance.path()));
      return;
    }
  },

  undo: function (_super, callback) {
    _super.call(this, callback);

    var cmd = new AddInstance(this.node, this.mapper, this.adaptModel, this.trace);
    cmd.execute(callback);
    return;
  },

  doSpecificTypeProcess: function (kInstance) {
    if (Kotlin.isType(kInstance.typeDefinition, kevoree.impl.ComponentTypeImpl)) {
      var provided = kInstance.provided;
      for (var i=0; i < provided.size(); i++) {
        this.mapper.removeEntry(provided.get(i).path());
      }

      var required = kInstance.required;
      for (var i=0; i < required.size(); i++) {
        this.mapper.removeEntry(required.get(i).path());
      }

    } else if (Kotlin.isType(kInstance.typeDefinition, kevoree.impl.ChannelTypeImpl)) {

    } else if (Kotlin.isType(kInstance.typeDefinition, kevoree.impl.GroupTypeImpl)) {


    } else if (Kotlin.isType(kInstance.typeDefinition, kevoree.impl.NodeTypeImpl)) {

    }
  }
});