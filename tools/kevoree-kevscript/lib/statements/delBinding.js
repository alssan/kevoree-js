module.exports = function (model, statements, stmt, opts, cb) {
  var compName = stmt.children[0].children.join('');
  var portName = stmt.children[1].children.join('');

  if (stmt.children[2] == '*') {
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
    var chanList = stmt.children[2].children;
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