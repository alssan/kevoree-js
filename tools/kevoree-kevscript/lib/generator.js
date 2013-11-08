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
    console.log(type, mergeDef);
  }

  function processAdd(addStmt) {
    var names = [];
    var type = addStmt.children[1].children.join('');;

    if (addStmt.children[0].type == 'nameList') {
      for (var i in addStmt.children[0].children) {
        names.push(addStmt.children[0].children[i].children.join(''));
      }
    } else {
      names.push(addStmt.children[0].children.join(''));
    }
    console.log(names, type);
  }

  function processMove(moveStmt) {
    console.log('MOVE =================');
    for (var i in moveStmt.children) {
      console.log(moveStmt.children[i]);
    }
  }

  function processAttach(attachStmt) {
    var nodes = [];
    var target = attachStmt.children[1].children.join('');;

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
    console.log(nodes, target);
  }

  function processBinding(bindingStmt) {
    console.log('BINDING =================');
    for (var i in bindingStmt.children) {
      console.log(bindingStmt.children[i]);
    }
  }

  function processSet(setStmt) {
    console.log('SET =================');
    for (var i in setStmt.children) {
      console.log(setStmt.children[i]);
    }
  }

  function processNetwork(netStmt) {
    console.log('NETWORK =================');
    for (var i in netStmt.children) {
      console.log(netStmt.children[i]);
    }
  }

  function processRemove(removeStmt) {
    console.log('REMOVE =================');
    for (var i in removeStmt.children) {
      console.log(removeStmt.children[i]);
    }
  }

  function processDetach(detachStmt) {
    console.log('DETACH =================');
    for (var i in detachStmt.children) {
      console.log(detachStmt.children[i]);
    }
  }
}

module.exports = generator;