var kevoree    = require('kevoree-library').org.kevoree;
var factory    = new kevoree.impl.DefaultKevoreeFactory();
var Kotlin     = require('kevoree-kotlin');

module.exports = function (model, statements, stmt, opts, cb) {
  var nameList = statements[stmt.children[0].type](model, statements, stmt.children[0], opts, cb);
  var typeDef  = statements[stmt.children[1].type](model, statements, stmt.children[1], opts, cb);

  // try to find TypeDefinition in model
  var tDef = model.findTypeDefinitionsByID(typeDef);

  function checkPathForNodeGroupChan(instancePath, callback) {
    if (instancePath.length > 2) {
      return cb(new Error('InstancePath can not contain more than "myNamespace.myInstance" for instances in "add '+instancePath.join('.')+' : '+typeDef+'"'));

    } else if (instancePath.length === 2) {
      // check if a namespace has been created with instancePath[0] name
      if (opts.namespaces[instancePath[0]]) {
        // namespace found, we are almost good to go
        if (instancePath[1] !== '*') {
          return callback(null, instancePath[1], instancePath[0]);

        } else {
          // instances can't have the name '*'
          return cb(new Error('Instances can not have "*" has a name. (add '+instancePath.join('.')+' : '+typeDef.toString()+')'));
        }
      } else {
        return cb(new Error('Unable to find "'+instancePath[0]+'" namespace. Did you create it? (add '+instancePath.join('.')+' : '+typeDef.toString()+')'));
      }

    } else if (instancePath.length === 1) {
      if (instancePath[0] !== '*') {
        // ok now we are good to go
        return callback(null, instancePath[0]);

      } else {
        // instances can't have the name '*'
        return cb(new Error('Instances can not have "*" has a name. (add '+instancePath.join('.')+' : '+typeDef.toString()+')'));
      }
    }
  }

  function addComponent(instancePath) {
    if (instancePath.length < 2) {
      return cb(new Error('InstancePath for components must at least contain "nodeName.compName" in "add '+instancePath.join('.')+' : '+typeDef.toString()+'"'));

    } else if (instancePath.length > 3) {
      return cb(new Error('InstancePath can not contain more than "myNamespace.myNode.myComp" for components in "add '+instancePath.join('.')+' : '+typeDef.toString()+'"'));

    } else if (instancePath.length === 2) {
      // check whether the first part of the path is:
      //  - '*' a wildcard
      //  - 'namespace' a namespace
      //  - 'nodeName' a node name
      if (instancePath[0] === '*') {
        // add this comp to all nodes
        var nodes = model.nodes.iterator();
        while (nodes.hasNext()) {
          var comp = factory.createComponentInstance();
          comp.name = instancePath[1];
          comp.typeDefinition = tDef;
          nodes.next().addComponents(comp);
        }

      } else {
        var node = model.findNodesByID(instancePath[0]);
        if (node) {
          // instance is defined, so it is a node
          var comp = factory.createComponentInstance();
          comp.name = instancePath[1];
          comp.typeDefinition = tDef;
          node.addComponents(comp);

        } else {
          // instance is not a node. check if it is a namespace
          // TODO handle namespaces
          return cb(new Error('Unable to find "'+instancePath[0]+'" (add '+instancePath.join('.')+' : '+typeDef.toString()+') in model node instances nor namespaces (well, namespaces are not handled yet sorry :/)'));
//          var namespace = opts.namespaces[instancePath[0]];
//          if (namespace && namespace.length > 0) {
//            // there is a namespace with this name and it contains instances
//            // now check if instances inside the namespace are nodes
//            for (var i=0; i < namespace.length; i++) {
//              if (!Kotlin.isType(namespace[i].typeDefinition, kevoree.impl.NodeTypeImpl)) {
//                // this namespace contains more than just NodeType => error
//                return cb(new Error('InstancePath in "add '+instancePath.join('.')+' : '+typeDef.toString()+'" refers to namespace "'+instancePath[0]+'" which contains more than just NodeTypes.'));
//              }
//            }
//
//            var comp = factory.createComponent();
//
//
//            // if we end-up here, namespace's instances are all NodeType
//            for (var i=0; i< namespace.length; i++) {
//              namespace[i].addComponents(comp);
//            }
//          }
        }
      }
    } else if (instancePath.length === 3) {
      // TODO handle namespaces
      return cb(new Error('InstancePath for component in "add '+instancePath.join('.')+' : '+typeDef.toString()+'" appears to refer to a namespace. Namespaces are not handled yet :/'));
    }
  }

  // create proper entity according to the type
  if (Kotlin.isType(tDef, kevoree.impl.NodeTypeImpl)) {
    for (var i in nameList) {
      checkPathForNodeGroupChan(nameList[i], function (err, instanceName, namespace) {
        // ok now we are good to go
        var node = factory.createContainerNode();
        node.name = instanceName;
        node.typeDefinition = tDef;
        model.addNodes(node);
        if (namespace) opts.namespaces[namespace].push(node);
      });
    }

  } else if (Kotlin.isType(tDef, kevoree.impl.GroupTypeImpl)) {
    for (var i in nameList) {
      checkPathForNodeGroupChan(nameList[i], function (err, instanceName, namespace) {
        if (err) return cb(err);

        var group = factory.createGroup();
        group.name = instanceName;
        group.typeDefinition = tDef;
        model.addGroups(group);

        if (namespace) opts.namespaces[namespace].push(group);
      });
    }

  } else if (Kotlin.isType(tDef, kevoree.impl.ChannelTypeImpl)) {
    for (var i in nameList) {
      checkPathForNodeGroupChan(nameList[i], function (err, instanceName, namespace) {
        if (err) return cb(err);

        var chan = factory.createChannel();
        chan.name = instanceName;
        chan.typeDefinition = tDef;
        model.addHubs(chan);

        if (namespace) opts.namespaces[namespace].push(chan);
      });
    }

  } else if (Kotlin.isType(tDef, kevoree.impl.ComponentTypeImpl)) {
    for (var i in nameList) addComponent(nameList[i]);

  } else {
    return cb(new Error('TypeDefinition "'+typeDef+'" doesn\'t exist in current model. (Maybe you should add an "include" for it?)'));
  }
  cb();
}