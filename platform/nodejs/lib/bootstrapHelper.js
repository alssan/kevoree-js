var npm     = require('npm'),
    path    = require('path'),
    kevoree = require('kevoree-library').org.kevoree;

var loader  = new kevoree.loader.JSONModelLoader();
var factory = new kevoree.impl.DefaultKevoreeFactory();
var compare = new kevoree.compare.DefaultModelCompare();

var bootstrapModel = function bootstrapModel(model, modulesPath, nodename, groupname, callback, logger) {
  if (!model) model = factory.createContainerRoot();

  var node = model.findNodesByID(nodename);
  var group = model.findGroupsByID(groupname);
  if (typeof(node) == 'undefined' || typeof(group) == 'undefined') {
    var wsGrpModelJson = require(path.resolve(modulesPath, 'node_modules', 'kevoree-group-websocket', 'kevlib.json'));
    var wsGrpModel = loader.loadModelFromString(JSON.stringify(wsGrpModelJson)).get(0);
    var mergeSeq = compare.merge(model, wsGrpModel);
    mergeSeq.applyOn(model);

    logger.warn('No node "'+nodename+'" and/or group "'+groupname+'" found in model. Adding default instances..');

    // create a node instance
    var nodeInstance = factory.createContainerNode();
    nodeInstance.name = nodename;
    nodeInstance.typeDefinition = model.findTypeDefinitionsByID('JavascriptNode');
    model.addNodes(nodeInstance);

    // create a group instance
    var grpInstance = factory.createGroup();
    grpInstance.name = groupname;
    grpInstance.typeDefinition = model.findTypeDefinitionsByID('WebSocketGroup');
    grpInstance.dictionary = factory.createDictionary();
    var portVal = factory.createDictionaryValue();
    var portAttr = null;
    var attrs = model.findTypeDefinitionsByID('WebSocketGroup').dictionaryType.attributes.iterator();
    while (attrs.hasNext()) {
      var attr = attrs.next();
      if (attr.name == 'port') {
        portAttr = attr;
        break;
      }
    }
    portVal.attribute = portAttr;

    portVal.value = '8000';
    portVal.targetNode = nodeInstance;
    grpInstance.dictionary.addValues(portVal);
    grpInstance.addSubNodes(nodeInstance);
    model.addGroups(grpInstance);
  }

  return callback(null, model);
}

module.exports = function (model, nodename, groupname, modulesPath, callback, logger) {
  try {
    if (!model) logger.warn('No bootstrap model given: using a default bootstrap model');
    // try to bootstrapModel without downloading and installing module from npm
    bootstrapModel(model, modulesPath, nodename, groupname, callback, logger);

  } catch (err) {
    // bootstrapping failed which means (probably) that module wasn't installed yet
    // so let's do it :D
    logger.info("Unable to find DeployUnit (kevoree-group-websocket) locally: downloading & installing it...");
    // load npm
    npm.load({}, function (err) {
      if (err) return callback(err);

      // installation success
      npm.commands.install(modulesPath, ['kevoree-group-websocket'], function installKevWSGrpCb(err) {
        if (err) return callback(err);

        bootstrapModel(model, modulesPath, nodename, groupname, callback, logger);
      });
    });
  }
};