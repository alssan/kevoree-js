var Class   = require('pseudoclass'),
    kevoree = require('kevoree-library').org.kevoree;

var KevScriptGenerator = Class({
  toString: 'KevScriptGenerator',

  construct: function () {
    this.factory = new kevoree.impl.DefaultKevoreeFactory();
  },

  /**
   * Generates a ContainerRoot from a parsedModel generated from kevscript-parser
   * returns ContainerRoot
   */
  gen: function (parsedModel) {
    var model = this.factory.createContainerRoot();

    for (var nodeName in parsedModel.nodes) {
      var node = this.factory.createContainerNode();
      node.name = nodeName;
      
    }

    return model;
  }
});

module.exports = KevScriptGenerator;