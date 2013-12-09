var kevoree = require('kevoree-library').org.kevoree;
var factory = kevoree.impl.DefaultKevoreeFactory();

module.exports = function (model, statements, stmt, opts, cb) {
  if (!cb) {
    cb = opts;
    opts = {};
  }

  var name  = stmt.children[0].children.join('');
  var value = stmt.children[1].children.join('');

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