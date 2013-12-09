module.exports = function (model, statements, stmt, opts, cb) {
  var nameList = statements[stmt.children[0].type](model, statements, stmt.children[0], opts, cb);
  var target = statements[stmt.children[1].type](model, statements, stmt.children[1], opts, cb);

  for (var i in nameList) {
    var group = model.findGroupsByID(target);
    if (typeof(group) != 'undefined') {
      // process InstancePath
      if (nameList[i].length > 2) {
        return cb(new Error('InstancePath can not contain more than "myNamespace.myGroup" in "attach '+nameList[i].join('.')+' '+target+'"'));

      } else if (nameList[i].length === 2) {
        // TODO handle namespace
        return cb(new Error('Namespaces are not handled yet (:/ sorry) in "attach '+nameList[i].join('.')+' '+target+'"'));

      } else if (nameList[i][0] === '*') {
        var nodes = model.nodes.iterator();
        while (nodes.hasNext()) group.addSubNodes(nodes.next());

      } else {
        var node = model.findNodesByID(nameList[i][0]);
        if (node) {
          group.addSubNodes(node);

        } else {
          return cb(new Error('Unable to find "'+nameList[i][0]+'" in model node instances for "attach '+nameList[i].join('.')+' '+target+'"'));
        }
      }
    } else {
      return cb(new Error('Unable to find group instance "'+target+'" in current model (attach '+nameList+' '+target+')'));
    }
  }

  cb();
}