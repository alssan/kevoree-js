var kevoree = require('kevoree-library').org.kevoree;
var factory = new kevoree.impl.DefaultKevoreeFactory();

module.exports = function (model, statements, stmt, opts, cb) {
  var port = statements[stmt.children[0].type](model, statements, stmt.children[0], opts, cb);
  var chan = statements[stmt.children[1].type](model, statements, stmt.children[1], opts, cb);

  function addBinding2(portName, comp, chanInst) {
    // start with a undefined portInst
    var portInst;

    // now lets try to find a Port instance in this component provided ports
    var inputs = comp.provided.iterator();
    while (inputs.hasNext()) {
      var input = inputs.next();
      if (input.portTypeRef.name == portName) {
        portInst = input;
        break;
      }
    }
    if (!portInst) {
      // if we can't find it in provided ports, lets try in required
      var outputs = comp.required.iterator();
      while (outputs.hasNext()) {
        var output = outputs.next();
        if (output.portTypeRef.name == portName) {
          portInst = output;
          break;
        }
      }
    }
    if (!portInst) {
      // reaching this point means that we were not able to find any port instance
      // matching this portName, so we have to create a brand new port instance
      portInst = factory.createPort();
      // lets try to find a PortTypeRef in the component TypeDefinition provided ports that matches portName
      var inputRefs = comp.typeDefinition.provided.iterator();
      while (inputRefs.hasNext()) {
        var inRef = inputRefs.next();
        if (inRef.name == portName) {
          // bingo, add it the the comp instance
          portInst.portTypeRef = inRef;
          comp.addProvided(portInst);
          break;
        }
      }
      if (!portInst.portTypeRef) {
        // well, it isn't a provided port obviously, so now lets try to find out if it is a required
        var outputRefs = comp.typeDefinition.required.iterator();
        while (outputRefs.hasNext()) {
          var outRef = outputRefs.next();
          if (outRef.name == portName) {
            // bingo, add it to the comp instance
            portInst.portTypeRef = outRef;
            comp.addRequired(portInst);
            break;
          }
        }
      }
    }

    if (portInst && portInst.portTypeRef && portInst.portTypeRef.name == portName) {
      var bindings = portInst.bindings.iterator();
      var alreadyBound = false;
      while (bindings.hasNext()) {
        var binding = bindings.next();
        if (binding.hub.name === chanInst.name) {
          alreadyBound = true;
          break;
        }
      }

      if (!alreadyBound) {
        binding = factory.createMBinding();
        binding.port = portInst;
        binding.hub  = chanInst;
        model.addMBindings(binding);
      }
    } else {
      // seems like you are trying to connect a port that do not belong to the comp you referred to
      return cb(new Error('Unable to find port "'+portName+'" in component '+comp.typeDefinition.name+'['+comp.name+'] (bind '+port.toString()+' '+chan.toString()+')'));
    }
  }

  function addBinding1(portName, compName, node, chanInst) {
    var comp = node.findComponentsByID(compName);
    if (comp) {
      if (portName === '*') {
        var inputRefs = comp.typeDefinition.provided.iterator();
        while (inputRefs.hasNext()) {
          addBinding2(inputRefs.next().name, comp, chanInst);
        }
        var outputRefs = comp.typeDefinition.required.iterator();
        while (outputRefs.hasNext()) {
          addBinding2(outputRefs.next().name, comp, chanInst);
        }

      } else {
        addBinding2(portName, comp, chanInst);
      }
    } else {
      return cb(new Error('Unable to find component instance "'+compName+'" in node "'+node.name+'" (bind '+port.toString()+' '+chan.toString()+')'));
    }
  }

  function addBinding0(portName, compName, nodeName, chanInst) {
    var node = model.findNodesByID(nodeName);
    if (node) {
      if (compName === '*') {
        var compz = node.components.iterator();
        while (compz.hasNext()) {
          addBinding1(portName, compz.next().name, node, chanInst);
        }

      } else {
        addBinding1(portName, compName, node, chanInst);
      }
    } else {
      return cb(new Error('Unable to find node instance "'+nodeName+'" in model (bind '+port.toString()+' '+chan.toString()+')'));
    }
  }

  function bindPortToChan(chanInst) {
    port.fourMax(function (err, portName, compName, nodeName, namespace) {
      if (err) {
        err.message += ' (bind '+port.toString()+' '+chan.toString()+')';
        return cb(err);
      }

      if (namespace) {
        // TODO
        return cb(new Error('Namespaces are not handled yet :/ Sorry (bind '+port.toString()+' '+chan.toString()+')'));

      } else {
        if (nodeName === '*') {
          var nodes = model.nodes.iterator();
          while (nodes.hasNext()) {
            addBinding0(portName, compName, nodes.next().name, chanInst);
          }

        } else {
          addBinding0(portName, compName, nodeName, chanInst);
        }
      }
    });
  }

  chan.twoMax(function (err, name, namespace) {
    if (err) {
      err.message += ' (bind '+port.toString()+' '+chan.toString()+')';
      return cb(err);
    }

    if (namespace) {
      // TODO
      return cb(new Error('Namespaces are not handled yet :/ Sorry (bind '+port.toString()+' '+chan.toString()+')'));

    } else {
      if (name === '*') {
        var chanz = model.hubs.iterator();
        while (chanz.hasNext()) {
          bindPortToChan(chanz.next());
        }

      } else {
        var chanInst = model.findHubsByID(name);
        if (chanInst) {
          bindPortToChan(chanInst);

        } else {
          return cb(new Error('Unable to find target channel instance "'+name+'" (bind '+port.toString()+' '+chan.toString()+')'));
        }
      }
    }
  });

  cb();
}