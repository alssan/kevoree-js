module.exports = function (model, statements, stmt, opts, cb) {
  var instancePath = [];
  for (var i in stmt.children) {
    instancePath.push(statements[stmt.children[i].type](model, statements, stmt.children[i], opts, cb));
  }

  /**
   *
   * @param callback function (err, instanceName, namespaceName)
   */
  function processNodeGroupChan(callback) {
    if (instancePath.length > 2) {
      return callback(new Error('InstancePath for nodes, groups and channels cannot contain more than "myNamespace.myInstance"'));

    } else if (instancePath.length === 2) {
      return callback(null, instancePath[1], instancePath[0]);

    } else if (instancePath.length === 1) {
      return callback(null, instancePath[0]);
    }
  }

  /**
   *
   * @param callback function (err, compName, nodeName, namespaceName)
   */
  function processComponent(callback) {
    if (instancePath.length > 3) {
      return callback(new Error('InstancePath for components cannot contain more than "myNamespace.myNode.myComponent"'));

    } else if (instancePath.length === 3) {
      return callback(null, instancePath[2], instancePath[1], instancePath[0]);

    } else if (instancePath.length === 2) {
      return callback(null, instancePath[1], instancePath[0]);

    } else {
      return callback(new Error('InstancePath for components must at least contain "myNode.myComp"'));
    }
  }

  /**
   *
   * @param callback function (err, portName, compName, nodeName, namespaceName)
   */
  function processPort(callback) {
    if (instancePath.length > 4) {
      return callback(new Error('InstancePath for components cannot contain more than "myNamespace.myNode.myComponent.myPort"'));

    } else if (instancePath.length === 4) {
      return callback(null, instancePath[3], instancePath[2], instancePath[1], instancePath[0]);

    } else if (instancePath.length === 3) {
      return callback(null, instancePath[2], instancePath[1], instancePath[0]);

    } else {
      return callback(new Error('InstancePath for components must at least contain "myNode.myComp.myPort"'));
    }
  }

  return {
    checkNode:  processNodeGroupChan,
    checkGroup: processNodeGroupChan,
    checkChan:  processNodeGroupChan,
    checkComp:  processComponent,
    checkPort:  processPort,
    toString:   function () { return instancePath.join('.'); }
  };
}