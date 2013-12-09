var kevoree = require('kevoree-library').org.kevoree;
var factory = new kevoree.impl.DefaultKevoreeFactory();

module.exports = function (model, statements, stmt, opts, cb) {
  var compName = stmt.children[0].children.join('');
  var portName = stmt.children[1].children.join('');
  var chanName = stmt.children[2].children.join('');

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

  var chan = model.findHubsByID(chanName);
  if (typeof(chan) != 'undefined') {
    binding.hub = chan;
    model.addMBindings(binding);
  } else {
    return cb(new Error('Unable to find chan instance "'+chanName+'" in current model. (bind '+compName+'.'+portName+' '+chanName+')'));
  }

  cb();
}