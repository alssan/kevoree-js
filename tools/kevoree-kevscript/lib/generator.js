var kevoree = require('kevoree-library').org.kevoree;

var factory = new kevoree.impl.DefaultKevoreeFactory();

var generator = function generator(ast, ctxModel, callback) {
  for (var i in ast.children) processStatement(ast.children[i]);

  /**
   *
   * @param stmt
   * @returns {*}
   */
  function processStatement(stmt) {
    for (var i in stmt.children) {
      switch (stmt.children[i].type) {
        case 'merge':
          processMerge(stmt.children[i]);
          break;

        case 'add':
          processAdd(stmt.children[i]);
          break;

        case 'move':
          processMove(stmt.children[i]);
          break;

        case 'attach':
          processAttach(stmt.children[i]);
          break;

        case 'addBinding':
          processBinding(stmt.children[i]);
          break;

        case 'set':
          processSet(stmt.children[i]);
          break;

        case 'network':
          processNetwork(stmt.children[i]);
          break;

        case 'remove':
          processRemove(stmt.children[i]);
          break;

        case 'detach':
          processDetach(stmt.children[i]);
          break;

        default:
          console.error("generator can't process statement "+stmt);
          return callback(new Error("Unable to process statement "+stmt+". Unknown statement."));
      }
    }
  }

  /**
   *
   * @param mergeStmt
   */
  function processMerge(mergeStmt) {
    var type     = mergeStmt.children[0].children.join('');
    var mergeDef = mergeStmt.children[1].children.join('');
    console.log('MERGE', type, mergeDef);
  }

  function processAdd(addStmt) {
    var names = [];
    var type = addStmt.children[1].children.join('');

    if (addStmt.children[0].type == 'nameList') {
      for (var i in addStmt.children[0].children) {
        names.push(addStmt.children[0].children[i].children.join(''));
      }
    } else {
      names.push(addStmt.children[0].children.join(''));
    }
    console.log('ADD', names, type);
  }

  function processMove(moveStmt) {
    var names = [];
    var target = null;
    var from = null;

    if (moveStmt.children[0].type == 'nameList') {
      var nameList = moveStmt.children[0].children;
      for (var i in nameList) {
        names.push(nameList[i].children.join(''));
      }
      target = moveStmt.children[1].children.join('');
      console.log('MOVE', names, target);

    } else if (moveStmt.children[0] == '*') {
      // TODO add all comp from 'from' to 'target'
      if (typeof(moveStmt.children[2]) == 'undefined') {
        // move * node1
        names.push('all_nodes');
        target = moveStmt.children[1].children.join('');
        console.log('MOVE', names, target);
      } else {
        // move *@node0 node1
        names.push('all_nodes');
        from = moveStmt.children[1].children.join('');
        target = moveStmt.children[2].children.join('');
        console.log('MOVE', names, from, target);
      }

    } else {
      names.push(moveStmt.children[0].children.join(''));
      target = moveStmt.children[1].children.join('');
      console.log('MOVE', names, target);
    }

  }

  function processAttach(attachStmt) {
    var nodes = [];
    var target = attachStmt.children[1].children.join('');

    if (attachStmt.children[0].type == 'nameList') {
      var nodeList = attachStmt.children[0].children;
      for (var i in nodeList) {
        nodes.push(nodeList[i].children.join(''));
      }

    } else if (attachStmt.children[0] == '*') {
      // TODO add currently created node instance to the given target
      nodes.push('all_nodes');
    } else {
      nodes.push(attachStmt.children[0].children.join(''));
    }

    console.log('ATTACH', nodes, target);
  }

  function processBinding(bindingStmt) {
    var comp = bindingStmt.children[0].children.join('');
    var port = bindingStmt.children[1].children.join('');
    var chan = bindingStmt.children[2].children.join('');

    console.log('BINDING', comp+'.'+port, chan);
  }

  function processSet(setStmt) {
    var attrs = [];
    var name = setStmt.children[0].children.join('');

    var dictionary = setStmt.children[1];
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

    console.log('SET', name+'\n', attrs);
  }

  function processNetwork(netStmt) {
    var name  = netStmt.children[0].children.join('');
    var value = netStmt.children[1].children.join('');
    console.log('NETWORK', name, value);
  }

  function processRemove(removeStmt) {
    var name  = netStmt.children[0].children.join('');
    console.log('NETWORK', name);
  }

  function processDetach(detachStmt) {
    var nodes = [];
    var target = detachStmt.children[1].children.join('');

    if (detachStmt.children[0].type == 'nameList') {
      var nodeList = detachStmt.children[0].children;
      for (var i in nodeList) {
        nodes.push(nodeList[i].children.join(''));
      }

    } else if (detachStmt.children[0] == '*') {
      // TODO add currently created node instance to the given target
      nodes.push('all_nodes');
    } else {
      nodes.push(detachStmt.children[0].children.join(''));
    }

    console.log('DETACH', nodes, target);
  }
}

module.exports = generator;