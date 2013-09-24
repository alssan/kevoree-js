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

            callback.call(this, null);
            return;
        }


        // NEED SOMETHING THERE because I can't get the related instance from mapper with the trace
        // change kev metamodel ? oO
        callback.call(this, null);
        return;
    },

    undo: function (_super, callback) {
        _super.call(this, callback);

        var instance = this.findEntityInstance()
        if (instance != null) {
            var dictionary = instance.getDictionary();
            dictionary.setMap(this.oldDictionary);
            callback.call(this, null);

        }

        // TODO handle default and stuff
        callback.call(this, null);
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