var npm     = require('npm'),
    path    = require('path'),
    kevoree = require('kevoree-library').org.kevoree;

var loader  = new kevoree.loader.JSONModelLoader();
var factory = new kevoree.impl.DefaultKevoreeFactory();
var compare = new kevoree.compare.DefaultModelCompare();

var bootstrapModel = function bootstrapModel(options, callback) {
  if (!options.model) options.model = factory.createContainerRoot();

  var node = options.model.findNodesByID(options.nodeName);
  var group = options.model.findGroupsByID(options.groupName);
  if (typeof(node) == 'undefined' || typeof(group) == 'undefined') {
    var wsGrpModelJson = require(path.resolve(options.modulesPath, 'node_modules', 'kevoree-group-websocket', 'kevlib.json'));
    var wsGrpModel = loader.loadModelFromString(JSON.stringify(wsGrpModelJson)).get(0);
    var mergeSeq = compare.merge(options.model, wsGrpModel);
    mergeSeq.applyOn(options.model);

    options.logger.warn('No node "'+options.nodeName+'" and/or group "'+options.groupName+'" found in model. Adding default instances..');

    // create a node instance
    var nodeInstance = factory.createContainerNode();
    nodeInstance.name = options.nodeName;
    nodeInstance.typeDefinition = options.model.findTypeDefinitionsByID('JavascriptNode');
    options.model.addNodes(nodeInstance);

    // create a group instance
    var grpInstance = factory.createGroup();
    grpInstance.name = options.groupName;
    grpInstance.typeDefinition = options.model.findTypeDefinitionsByID('WebSocketGroup');
    grpInstance.dictionary = factory.createDictionary();
    var portVal = factory.createDictionaryValue();
    var portAttr = null;
    var attrs = options.model.findTypeDefinitionsByID('WebSocketGroup').dictionaryType.attributes.iterator();
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
    options.model.addGroups(grpInstance);
  }

  return callback(null, options.model);
}

module.exports = function (options, callback) {
  if (!options.model) {
    options.logger.warn('No bootstrap model given: using a default bootstrap model');
    defaultBootstrap();

  } else {
    if (options.model.findByID(options.nodeName) && options.model.findByID(options.groupName)) {
      // we dont have to process this model anymore, everything is in it :)
      return callback(null, options.model);
    } else {
      defaultBootstrap();
    }
  }

  function defaultBootstrap() {
    try {
      // try to bootstrapModel without downloading and installing module from npm
      bootstrapModel(options, callback);

    } catch (err) {
      // bootstrapping failed which means (probably) that module wasn't installed yet
      // so let's do it :D
      var deployUnit = factory.createDeployUnit();
      deployUnit.name = 'kevoree-group-websocket';
      options.bootstrapper.bootstrap(deployUnit, function (err, Clazz, model) {
        if (err) return callback(err);
        options.model = model;
        bootstrapModel(options, callback);
      });
    }
  }
};