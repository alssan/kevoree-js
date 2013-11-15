var kevoree      = require('kevoree-library').org.kevoree,
    Kotlin       = require('kevoree-kotlin'),
    async        = require('async');

var factory = new kevoree.impl.DefaultKevoreeFactory();
var cloner  = new kevoree.cloner.DefaultModelCloner();
var compare = new kevoree.compare.DefaultModelCompare();

/**
 *
 * @param ast
 * @param ctxModel
 * @param resolvers
 * @param callback
 */
var interpreter = function interpreter(ast, ctxModel, resolvers, callback) {
  // output model
  var model = null;
  // if we have a context model, clone it and use it has a base
  if (ctxModel) model = cloner.clone(ctxModel, false);
  // otherwise start from a brand new model
  else model = factory.createContainerRoot();

  // components ref table
  var components = {};

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
          case 'addRepo':
            console.log('"addRepo" statement is not handle in JS version.');
            break;

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
    if (!resolvers) return cb(new Error('Unable to process merge. No resolver given'));

    var du = factory.createDeployUnit();
    var type = mergeStmt.children[0].children.join('');

    if (type == 'npm' && resolvers.npm) {
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

      resolvers.npm.resolve(du, function (err, duModel) {
        if (err) return cb(err);

        var loader = new kevoree.loader.JSONModelLoader();
        var serializer = new kevoree.serializer.JSONModelSerializer();
        var tmp = loader.loadModelFromString(serializer.serialize(duModel)).get(0);
        var mergeSeq = compare.merge(model, tmp);
        mergeSeq.applyOn(model);
        return cb();
      });

    } else {
      // TODO handle mvn type and others
      console.log('Unable to handle "'+type+'" merge type yet. Sorry :/');
      cb();
    }
  }

  function processAdd(addStmt, cb) {
    var names = [];
    var type = addStmt.children[1].children.join('');

    if (addStmt.children[0].type == 'nameList') {
      for (var i in addStmt.children[0].children) {
        names.push(addStmt.children[0].children[i].children.join(''));    // each task execution ended well: merge every model
      }
    } else {
      names.push(addStmt.children[0].children.join(''));
    }

    var tDef = model.findTypeDefinitionsByID(type);
    if (Kotlin.isType(tDef, kevoree.impl.NodeTypeImpl)) {
      for (var i in names) {
        var node = factory.createContainerNode();
        node.name = names[i];
        node.typeDefinition = tDef;
        model.addNodes(node);
      }
    } else if (Kotlin.isType(tDef, kevoree.impl.GroupTypeImpl)) {
      for (var i in names) {
        var group = factory.createGroup();
        group.name = names[i];
        group.typeDefinition = tDef;
        model.addGroups(group);
      }
    } else if (Kotlin.isType(tDef, kevoree.impl.ChannelTypeImpl)) {
      for (var i in names) {
        var chan = factory.createChannel();
        chan.name = names[i];
        chan.typeDefinition = tDef;
        model.addHubs(chan);
      }
    } else if (Kotlin.isType(tDef, kevoree.impl.ComponentTypeImpl)) {
      for (var i in names) {
        var comp = factory.createComponentInstance();
        comp.name = names[i];
        comp.typeDefinition = tDef;
        // add component instance to a ref table, this will be added to proper node while processing "move"
        components[names[i]] = comp;
      }
    } else {
      return cb(new Error('TypeDefinition "'+type+'" doesn\'t exist in current model. (Maybe you should add a "merge" for it?)'));
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

    } else if (moveStmt.children[0] == '*') {
      if (typeof(moveStmt.children[2]) == 'undefined') {
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
        target = moveStmt.children[1].children.join('');
      } else {
        // move *@node0 node1
        from = moveStmt.children[1].children.join('');
        target = moveStmt.children[2].children.join('');
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
      names.push(moveStmt.children[0].children.join(''));
      target = moveStmt.children[1].children.join('');
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

  function processAttach(attachStmt, cb) {
    var names = [];
    var target = attachStmt.children[1].children.join('');

    if (attachStmt.children[0].type == 'nameList') {
      var nodeList = attachStmt.children[0].children;
      for (var i in nodeList) {
        names.push(nodeList[i].children.join(''));
      }

    } else if (attachStmt.children[0] == '*') {
      var nodes = (model.nodes) ? model.nodes.iterator() : null;
      if (nodes != null) while (nodes.hasNext()) nodes.next().name;

    } else {
      names.push(attachStmt.children[0].children.join(''));
    }

    for (var i in names) {
      var group = model.findGroupsByID(target);
      if (typeof(group) != 'undefined') {
        var node = model.findNodesByID(names[i]);
        if (typeof(node) != 'undefined') {
          group.addSubNodes(node);
        } else {
          return cb(new Error('Unable to find node instance "'+names[i]+'" in current model (attach '+names+' '+target+')'));
        }
      } else {
        return cb(new Error('Unable to find group instance "'+target+'" in current model (attach '+names+' '+target+')'));
      }
    }

    cb();
  }

  function processBinding(bindingStmt, cb) {
    var compName = bindingStmt.children[0].children.join('');
    var portName = bindingStmt.children[1].children.join('');
    var chans = [];

    var chanList = bindingStmt.children[2].children;
    for (var i in chanList) {
      chans.push(chanList[i].children.join(''));
    }

    for (var i in chans) {
      var binding = factory.createMBinding();
      // process port
      var port = factory.createPort();
      port.name = portName;
      // lets try to find the component in the model
      var nodes = model.nodes.iterator();
      while (nodes.hasNext()) {
        var node = nodes.next();
        var comps = node.components.iterator();
        while (comps.hasNext()) {
          var comp = comps.next();
          if (comp.name == compName) {
            // this is the component we are looking for
            // now determine if the port we want to add is a "required" or a "provided"
            var provided = comp.typeDefinition.provided.iterator();
            while (provided.hasNext()) {
              var providedPort = provided.next();
              if (providedPort.name == port.name) {
                // this is the port ref we are looking for
                port.portTypeRef = providedPort;
                comp.addProvided(port);
                break;
              }
            }

            if (!port.portTypeRef) {
              // not a provided apparently, check if it is a required
              var required = comp.typeDefinition.required.iterator();
              while (required.hasNext()) {
                var requiredPort = required.next();
                if (requiredPort.name == port.name) {
                  // this is the port ref we are looking for
                  port.portTypeRef = requiredPort;
                  comp.addRequired(port);
                  break;
                }
              }
            }

            if (!port.portTypeRef) {
              return cb(new Error('Unable to find "'+port.name+'" in "'+comp.typeDefinition.name+'" typeDef ports'));
            }

            // if we reach this point, it means that we have found the port and set it properly
            port.addBindings(binding);
          }
        }
      }

      var chan = model.findHubsByID(chans[i]);
      if (typeof(chan) != 'undefined') {
        binding.hub = chan;
        model.addMBindings(binding);
      } else {
        return cb(new Error('Unable to find chan instance "'+chans[i]+'" in current model. (bind '+compName+'.'+portName+' '+chans+')'));
      }
    }

    cb();
  }

  function processUnbinding(unbindingStmt, cb) {
    var compName = unbindingStmt.children[0].children.join('');
    var portName = unbindingStmt.children[1].children.join('');

    if (unbindingStmt.children[2] == '*') {
      var bindings = (model.mBindings) ? model.mBindings.iterator() : null;
      if (bindings != null) {
        while (bindings.hasNext()) {
          var binding = bindings.next();
          if (binding.port.name == portName && binding.port.eContainer().name == compName) {
            model.removeMBindings(binding);
          }
        }
      }

    } else {
      var chanList = unbindingStmt.children[2].children;
      for (var i in chanList) {
        var chanName = chanList[i].children.join('');
        var bindings = (model.mBindings) ? model.mBindings.iterator() : null;
        if (bindings != null) {
          while (bindings.hasNext()) {
            var binding = bindings.next();
            if (binding.port.name == portName && binding.port.eContainer().name == compName && binding.hub.name == chanName) {
              model.removeMBindings(binding);
            }
          }
        }
      }
    }

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

    var entity = findEntityByName(name);

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

  function processNetwork(netStmt, cb) {
    var name  = netStmt.children[0].children.join('');
    var value = netStmt.children[1].children.join('');

    var net = factory.createNodeNetwork();
    var node = model.findNodesByID(name);
    if (typeof(node) != 'undefined') {
      net.target = node;
      net.initBy = node;

      var link = factory.createNodeLink();
      link.networkType = 'ip';
      link.estimatedRate = 99;
      net.addLink(link);

      var prop = factory.createNetworkProperty();
      prop.name = 'ip';
      prop.value = value;
      link.addNetworkProperties(prop);

      model.addNodeNetworks(net);

    } else {
      return cb(new Error('Unable to find node instance "'+name+'" in current model. (network '+name+' '+value+')'));
    }

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

    for (var i in names) {
      var entity = findEntityByName(names[i]);
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

  function processDetach(detachStmt, cb) {
    var names = [];
    var target = detachStmt.children[1].children.join('');

    if (detachStmt.children[0].type == 'nameList') {
      var nodeList = detachStmt.children[0].children;
      for (var i in nodeList) {
        names.push(nodeList[i].children.join(''));
      }

    } else if (detachStmt.children[0] == '*') {
      var group = model.findGroupsByID(target);
      if (typeof(group) != 'undefined') {
        var nodes = group.subNodes.iterator();
        while (nodes.hasNext()) names.push(nodes.next().name);
      } else {
        return cb(new Error('Unable to find group instance "'+target+'" in current model. (detach * '+target+')'));
      }
    } else {
      names.push(detachStmt.children[0].children.join(''));
    }

    for (var i in names) {
      var group = model.findGroupsByID(target);
      if (typeof(group) != 'undefined') {
        var node = model.findNodesByID(names[i]);
        if (typeof(node) != 'undefined') {
          group.removeSubNodes(node);
        }
      }
    }

    cb();
  }

  function findEntityByName(name) {
    function findByName(elem) {
      var elems = (model[elem]) ? model[elem].iterator() : null;
      if (elems != null) {
        while (elems.hasNext()) {
          var entity = elems.next();
          if (entity.name == name) return entity;
        }
      }
      return null;
    }

    function findComponent() {
      var nodes = (model.nodes) ? model.nodes.iterator() : null;
      if (nodes != null) {
        while (nodes.hasNext()) {
          var comps = nodes.next().components.iterator();
          while (comps.hasNext()) {
            var comp = comps.next();
            if (comp.name == name) return comp;
          }
        }
      }
      return null;
    }

    return findByName('nodes') || findByName('groups') || findByName('hubs') || findComponent() || null;
  }
}

module.exports = interpreter;