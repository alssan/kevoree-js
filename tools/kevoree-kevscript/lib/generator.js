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
    console.log('MERGE =================');
    for (var i in mergeStmt.children) {
      console.log(mergeStmt.children[i]);
    }
  }

  function processAdd(addStmt) {
    console.log('ADD =================');
    for (var i in addStmt.children) {
      console.log(addStmt.children[i]);
    }
  }

  function processMove(moveStmt) {
    console.log('MOVE =================');
    for (var i in moveStmt.children) {
      console.log(moveStmt.children[i]);
    }
  }

  function processAttach(attachStmt) {
    console.log('ATTACH =================');
    for (var i in attachStmt.children) {
      console.log(attachStmt.children[i]);
    }
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