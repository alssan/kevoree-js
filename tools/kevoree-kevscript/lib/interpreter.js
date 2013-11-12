var kevoree   = require('kevoree-library').org.kevoree,
    generator = require('./generator'),
    async     = require('async');

var factory = new kevoree.impl.DefaultKevoreeFactory();
var cloner  = new kevoree.cloner.DefaultModelCloner();
var compare = new kevoree.compare.DefaultModelCompare();

var interpreter = function interpreter(ast, ctxModel, callback) {
  var model = null;
  // if we have a context model, clone it and use it has a base
  if (ctxModel) model = cloner.clone(ctxModel, false);
  // otherwise start from a brand new model
  else model = factory.createContainerRoot();

  // process statements
  var tasks = [];
  for (var i in ast.children) processStatement(ast.children[i]);

  // execute tasks
  async.series(tasks, function (err) {
    if (err) return callback(err);

    return callback(null, model);
  });

  function processStatement(stmt) {
    for (var i in stmt.children) {
      (function (childStmt) {
        switch (childStmt.type) {
          case 'merge':
            tasks.push(function (cb) {
              processMerge(childStmt, cb);
            });
            break;

          case 'add':
            tasks.push(function (cb) {
              processAdd(childStmt, cb);
            });
            break;

          case 'move':
            tasks.push(function (cb) {
              processMove(childStmt, cb);
            });
            break;

          case 'attach':
            tasks.push(function (cb) {
              processAttach(childStmt, cb);
            });
            break;

          case 'addBinding':
            tasks.push(function (cb) {
              processBinding(childStmt, cb);
            });
            break;

          case 'delBinding':
            tasks.push(function (cb) {
              processUnbinding(childStmt, cb);
            });
            break;

          case 'set':
            tasks.push(function (cb) {
              processSet(childStmt, cb);
            });
            break;

          case 'network':
            tasks.push(function (cb) {
              processNetwork(childStmt, cb);
            });
            break;

          case 'remove':
            tasks.push(function (cb) {
              processRemove(childStmt, cb);
            });
            break;

          case 'detach':
            tasks.push(function (cb) {
              processDetach(childStmt, cb);
            });
            break;

          default:
            return callback(new Error("Unable to process statement "+childStmt.type+". Unknown statement."));
        }
      })(stmt.children[i]);
    }
  }

  function processMerge(mergeStmt, cb) {
    var du = { type: mergeStmt.children[0].children.join('') };

    if (du.type == 'npm') {
      var mergeDef = mergeStmt.children[1].children.join('');

      var colon = mergeDef.split(':');
      var arobas = mergeDef.split('@');
      if (colon.length == 1 && arobas.length == 1) {
        du.name = mergeDef;
      } else if (colon.length == 1 && arobas.length == 2) {
        du.name = arobas[0];
        du.version = arobas[1];
      } else if (colon.length == 2 && arobas.length == 1) {
        du.name = colon[0];
        du.version = colon[1];
      } else {
        return cb(new Error('Unable to parse merge statement "'+mergeDef+'"'));
      }
    } else {
      // TODO handle mvn type and others
      console.log('Unable to handle "'+du.type+'" merge type yet. Sorry :/');
    }

    cb();
  }

  function processAdd(addStmt, cb) {
    var names = [];
    var type = addStmt.children[1].children.join('');

    if (addStmt.children[0].type == 'nameList') {
      for (var i in addStmt.children[0].children) {
        names.push(addStmt.children[0].children[i].children.join(''));
      }
    } else {
      names.push(addStmt.children[0].children.join(''));
    }

    cb();
  }

  function processMove(moveStmt, cb) {
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

    cb();
  }

  function processAttach(attachStmt, cb) {
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

    cb();
  }

  function processBinding(bindingStmt, cb) {
    var comp = bindingStmt.children[0].children.join('');
    var port = bindingStmt.children[1].children.join('');
    var chans = [];

    var chanList = bindingStmt.children[2].children;
    for (var i in chanList) {
      chans.push(chanList[i].children.join(''));
    }

    console.log('BIND', comp+'.'+port, chans);

    cb();
  }

  function processUnbinding(unbindingStmt, cb) {
    var comp = unbindingStmt.children[0].children.join('');
    var port = unbindingStmt.children[1].children.join('');
    var chans = [];

    if (unbindingStmt.children[2] == '*') {
      // TODO remove all bindings
      chans.push('all_bound_chans');

    } else {
      var chanList = unbindingStmt.children[2].children;
      for (var i in chanList) {
        chans.push(chanList[i].children.join(''));
      }
    }

    console.log('UNBIND', comp+'.'+port, chans);

    cb();
  }

  function processSet(setStmt, cb) {
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

    cb();
  }

  function processNetwork(netStmt, cb) {
    var name  = netStmt.children[0].children.join('');
    var value = netStmt.children[1].children.join('');
    console.log('NETWORK', name, value);
    cb();
  }

  function processRemove(removeStmt, cb) {
    var names = [];

    if (removeStmt.children[0].type == 'nameList') {
      for (var i in removeStmt.children[0].children) {
        names.push(removeStmt.children[0].children[i].children.join(''));
      }
    } else {
      names.push(removeStmt.children[0].children.join(''));
    }
    console.log('REMOVE', names);
    cb();
  }

  function processDetach(detachStmt, cb) {
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
    cb();
  }
}

module.exports = interpreter;