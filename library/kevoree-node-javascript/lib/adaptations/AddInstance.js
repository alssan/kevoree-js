var AdaptationPrimitive = require('./AdaptationPrimitive'),
  RemoveInstance      = require('./RemoveInstance'),
  kevoree             = require('kevoree-library').org.kevoree,
  Kotlin              = require('kevoree-kotlin'),
  Port                = require('kevoree-entities').Port,
  path                = require('path');

/**
 * AddInstance Adaptation command
 *
 * @type {AddInstance} extends AdaptationPrimitive
 */
module.exports = AdaptationPrimitive.extend({
  toString: 'AddInstance',

  /**
   *
   * @param _super AdaptationPrimitive parent
   * @param callback function: if this function first parameter != null it means that there is an error
   */
  execute: function (_super, callback) {
    _super.call(this, callback);

    var kInstance = this.adaptModel.findByPath(this.trace.previousPath);

    // inception check
    if (kInstance && (kInstance.name != this.node.getName())) {
      // platform related check
      if (this.isRelatedToPlatform(kInstance)) {
        var moduleName = this.findSuitableModuleName(kInstance);
        if (moduleName != undefined && moduleName != null) {
          try {
            var InstanceClass = require(moduleName);
            var instance = new InstanceClass();
            instance.setKevoreeCore(this.node.getKevoreeCore());
            instance.setName(kInstance.name);
            instance.setPath(kInstance.path());
            instance.setNodeName(this.node.getName());

            this.doSpecificTypeProcess(kInstance);

            this.mapper.addEntry(kInstance.path(), instance);

            return callback();

          } catch (e) {
            return callback(e);
          }

        } else {
          // there is no DeployUnit installed for this instance TypeDefinition
          return callback(new Error("No DeployUnit installed for "+this.kInstance.path()));
        }
      }
    }

    callback();
  },

  undo: function (_super, callback) {
    _super.call(this, callback);

    var cmd = new RemoveInstance(this.node, this.mapper, this.adaptModel, this.trace);
    cmd.execute(callback);
    return;
  },

  findSuitableModuleName: function (kInstance) {
    var du = kInstance.typeDefinition.deployUnits.get(0);
    return this.mapper.getObject(du.path());
  },

  doSpecificTypeProcess: function (kInstance) {
    if (Kotlin.isType(kInstance.typeDefinition, kevoree.impl.ComponentTypeImpl)) {
      var inputs = kInstance.provided ? kInstance.provided.iterator() : null;
      if (inputs) {
        while (inputs.hasNext()) {
          var input = inputs.next();
          this.mapper.addEntry(input.path(), new Port(input.portTypeRef.name, input.path()));
        }
      }

      var outputs = kInstance.required ? kInstance.required.iterator() : null;
      if (outputs) {
        while (outputs.hasNext()) {
          var output = outputs.next();
          this.mapper.addEntry(output.path(), new Port(output.portTypeRef.name, output.path()));
        }
      }
    }
  }
});