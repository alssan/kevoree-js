module.exports = function (model, statements, stmt, opts, cb) {
  var names = [];
  var target = null;
  var from = null;

  if (stmt.children[0].type == 'nameList') {
    var nameList = stmt.children[0].children;
    for (var i in nameList) {
      names.push(nameList[i].children.join(''));
    }
    target = stmt.children[1].children.join('');

  } else if (stmt.children[0] == '*') {
    if (typeof(stmt.children[2]) == 'undefined') {
      // move * node1
      // add all previously added component instances (with "add comp0 : MyCompType")
      for (var compName in components) names.push(compName);
      // and add all components previously added in model too
      var nodes = (model.nodes) ? model.nodes.iterator() : null;
      if (nodes != null) {
        while (nodes.hasNext()) {
          var node = nodes.next();
          var comps = node.components.iterator();
          while (comps.hasNext()) names.push(comps.next().name);
        }
      }
      target = stmt.children[1].children.join('');
    } else {
      // move *@node0 node1
      from = stmt.children[1].children.join('');
      target = stmt.children[2].children.join('');
      var node = model.findNodesByID(from);
      if (typeof(node) == 'undefined') {
        return cb(new Error('Unable to find node "'+from+'" in current model (move *@'+from+' '+target+'). Failure.'));
      } else {
        // "from" node found in model, proceed
        var comps = node.components.iterator();
        while (comps.hasNext()) names.push(comps.next().name);
      }
    }

  } else {
    names.push(stmt.children[0].children.join(''));
    target = stmt.children[1].children.join('');
  }

  for (var i in names) {
    var comp = components[names[i]];
    if (typeof(comp) == 'undefined') {
      // comp definition has not been made in kevscript
      // we should check if it has already been added to current model
      var comp = (function (compName) {
        var nodes = (model.nodes) ? model.nodes.iterator() : null;
        if (nodes != null) {
          while (nodes.hasNext()) {
            var node = nodes.next();
            var comps = node.components.iterator();
            while (comps.hasNext()) {
              var modelComp = comps.next();
              if (modelComp.name == compName) return modelComp;
            }
          }
          return null;
        }
      })(names[i])
      if (comp == null) {
        // component instance not found in kevscript AND in model => error
        return cb(new Error('Unable to "move" component "'+names[i]+'" to node "'+target+'". Component does not exist.'));

      } else {
        // component instance found in current model, proceed
        addCompToNode(comp, target)
      }

    } else {
      addCompToNode(comp, target);
    }
  }

  function addCompToNode(comp, nodeName) {
    var node = model.findNodesByID(nodeName);
    if (typeof(node) == 'undefined') {
      // the node specified to move component to has not yet been created
      return cb(new Error('Unable to "move" component "'+comp.name+'" to node "'+nodeName+'". Node does not exist.'));
    } else {
      // the node specified to move component to has been created, proceed move
      node.addComponents(comp);
    }
  }

  cb();
}