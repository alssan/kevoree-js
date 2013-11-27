var AdaptationPrimitive = require('./AdaptationPrimitive');

module.exports = AdaptationPrimitive.extend({
  toString: 'UpdateDictionary',

  construct: function () {
    this.oldDictionary = null;
    this.instance = null;
  },

  execute: function (_super, callback) {
    _super.call(this, callback);

    var dicValue = this.adaptModel.findByPath(this.trace.srcPath),
      instance = this.findEntityInstance();

    if (instance != null) {
      var dictionary = instance.getDictionary();
      this.oldDictionary = dictionary.clone();
      this.instance = instance;
      if (dicValue.attribute.fragmentDependant == true) {
        if (dicValue.targetNode != null) {
          if (dicValue.targetNode.name == this.node.getName()) {
            dictionary.setEntry(dicValue.attribute.name, dicValue.value);
          }
        }
      } else {
        dictionary.setEntry(dicValue.attribute.name, dicValue.value);
      }

      this.log.debug(this.toString(), 'job done for attribute '+dicValue.attribute.name);
      return callback();

    } else {
      // check if this attribute is related to the running platform node type
      if (dicValue.eContainer().eContainer().name == this.node.toString()
        || dicValue.eContainer().eContainer().name == this.node.getName()) {
        var dictionary = this.node.getDictionary();
        this.oldDictionary = dictionary.clone();
        this.instance = this.node;
        dictionary.setEntry(dicValue.attribute.name, dicValue.value);
      }
    }

    return callback();
  },

  undo: function (_super, callback) {
    _super.call(this, callback);

    if (this.instance != null && this.oldDictionary != null) {
      this.instance.getDictionary().setMap(this.oldDictionary.getMap());
    }

    callback();
  },

  findEntityInstance: function () {
    for (var path in this.mapper.getMap()) {
      if (this.trace.srcPath.startsWith(path)) {
        return this.mapper.getObject(path);
      }
    }
    return null;
  }
});