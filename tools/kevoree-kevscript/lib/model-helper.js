module.exports = {
  findEntityByName: function(model, name) {
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