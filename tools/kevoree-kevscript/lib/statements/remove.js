var kevoree = require('kevoree-library').org.kevoree;
var Kotlin = require('kevoree-kotlin');
var factory = kevoree.impl.DefaultKevoreeFactory();
var helper = require('../model-helper');

module.exports = function (model, statements, stmt, opts, cb) {
  if (!cb) {
    cb = opts;
    opts = {};
  }

  var names = [];

  if (stmt.children[0].type == 'nameList') {
    for (var i in stmt.children[0].children) {
      names.push(stmt.children[0].children[i].children.join(''));
    }
  } else {
    names.push(stmt.children[0].children.join(''));
  }

  for (var i in names) {
    var entity = helper.findEntityByName(model, names[i]);
    if (entity != null) {
      if (Kotlin.isType(entity.typeDefinition, kevoree.impl.NodeTypeImpl)) {
        var groups = (model.groups) ? model.groups.iterator() : null;
        if (groups != null) {
          while (groups.hasNext()) {
            var group = groups.next();
            var subNodes = group.subNodes.iterator()
            while (subNodes.hasNext()) {
              if (subNodes.next().name == entity.name) group.removeSubNodes(entity);
            }
            var values = group.dictionary.values.iterator();
            while (values.hasNext()) {
              var val = values.next();
              if (val.targetNode.name == entity.name) group.dictionary.removeValues(val);
            }
          }
        }
        model.removeNodes(entity);

      } else if (Kotlin.isType(entity.typeDefinition, kevoree.impl.GroupTypeImpl)) {
        model.removeGroups(entity);
      } else if (Kotlin.isType(entity.typeDefinition, kevoree.impl.ChannelTypeImpl)) {
        model.removeHubs(entity);
      } else if (Kotlin.isType(entity.typeDefinition, kevoree.impl.ComponentTypeImpl)) {
        entity.eContainer().removeComponents(entity);
      } else {
        return cb(new Error('Unable to remove instance "'+names[i]+'" from current model. (Are you sure it is a node, group, chan, component?)'));
      }
    }
  }

  cb();
}