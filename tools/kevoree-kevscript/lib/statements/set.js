var kevoree = require('kevoree-library').org.kevoree;
var factory = new kevoree.impl.DefaultKevoreeFactory();
var helper  = require('../model-helper');

module.exports = function (model, statements, stmt, opts, cb) {
  if (!cb) {
    cb = opts;
    opts = {};
  }

  var attrs = [];
  var name = stmt.children[0].children.join('');

  var dictionary = stmt.children[1];
  for (var i in dictionary.children) {
    var attrList = dictionary.children[i].children;
    var dic = {};
    for (var j in attrList) {
      if (attrList[j].type == 'attribute') {
        dic.name  = attrList[j].children[0].children.join('');
        dic.value = attrList[j].children[1].children.join('');
      } else {
        dic.targetNode = attrList[j].children.join('');
      }
    }
    attrs.push(dic);
  }

  var entity = helper.findEntityByName(model, name);

  if (entity != null) {
    for (var i in attrs) {
      var dic = entity.dictionary || factory.createDictionary();
      var dicAttrs = entity.typeDefinition.dictionaryType.attributes;

      function getDictionaryAttributeFromName(attrName) {
        for (var i=0; i < dicAttrs.size(); i++) {
          if (dicAttrs.get(i).name == attrName) return dicAttrs.get(i);
        }
        return callback(new Error('Unable to find "'+attrName+'" in "'+entity.typeDefinition.name+'" typeDef dictionary.'));
      }

      var val = factory.createDictionaryValue();
      val.attribute = getDictionaryAttributeFromName(attrs[i].name);
      val.value = attrs[i].value;
      if (typeof(attrs[i].targetNode) != 'undefined') {
        val.targetNode = model.findNodesByID(attrs[i].targetNode);
      }

      var values = (dic.values) ? dic.values.iterator() : null;
      if (values != null) {
        while (values.hasNext()) {
          var dicVal = values.next();
          if (dicVal.attribute == val.attribute) dic.removeValues(dicVal);
        }
      }
      dic.addValues(val);

      entity.dictionary = dic;
    }

    cb();
  } else {
    return cb(new Error('Unable to find instance "'+name+'" in current model. Can\'t set it\'s dictionary.'));
  }
}