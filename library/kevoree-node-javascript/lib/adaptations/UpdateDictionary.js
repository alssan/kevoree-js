var AdaptationPrimitive = require('./AdaptationPrimitive');

module.exports = AdaptationPrimitive.extend({
  toString: 'UpdateDictionary',

  construct: function () {
    this.oldDictionary = this.node.getDictionary().clone();
  },

  execute: function (_super, callback) {
    _super.call(this, callback);

    var dicValue = this.adaptModel.findByPath(this.trace.srcPath),
      instance = this.findEntityInstance();

    if (instance != null) {
      var dictionary = instance.getDictionary();
      if (dicValue.attribute.fragmentDependant == true) {
        if (dicValue.targetNode != null) {
          if (dicValue.targetNode.name == this.node.getName()) {
            dictionary.setEntry(dicValue.attribute.name, dicValue.value);
          }
        }
      } else {
        dictionary.setEntry(dicValue.attribute.name, dicValue.value);
      }

      this.log.debug(this.toString(), 'UpdateDictionary: job done for attribute '+dicValue.attribute.name);
      return callback();
    }

    return callback();
  },

  undo: function (_super, callback) {
    _super.call(this, callback);

    var instance = this.findEntityInstance()
    if (instance != null) {
      var dictionary = instance.getDictionary();
      dictionary.setMap(this.oldDictionary);
      callback();

    }

    // TODO handle default and stuff
    callback();
  },

  findEntityInstance: function () {
    // this suxx a lot
    for (var path in this.mapper.getMap()) {
      if (this.trace.srcPath.startsWith(path)) {
        return this.mapper.getObject(path);
      }
    }
    return null;
  }
});