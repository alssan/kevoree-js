var config      = require('./config.json'),
  NodeJSRuntime = require('./lib/NodeJSRuntime'),
  KevoreeLogger = require('kevoree-commons').KevoreeLogger,
  path          = require('path'),
  kevoree       = require('kevoree-library').org.kevoree,
  argv          = require('optimist')
    .usage('Usage: $0 [--nodeName node0 --groupName sync --model path/to/your/model.json]')
    .argv;

// TODO enable install dir path in command-line
var kRuntime = new NodeJSRuntime();
var loader   = new kevoree.loader.JSONModelLoader();
var log      = new KevoreeLogger('NodeJSRuntime');
var compare  = new kevoree.compare.DefaultModelCompare();

// Kevoree Runtime started event listener
kRuntime.on('started', function () {
  // Kevoree Core is started, deploy model
  var model = loadModelFromCmdLineArg();
  kRuntime.deploy(model);
});

// Kevore Runtime error event listener
kRuntime.on('error', function (err) {
  process.exit(1);
});

var loadModelFromCmdLineArg = function loadModelFromCmdLineArg() {
  if (argv.model && argv.model.length > 0) {
    var modelPath = null;
    if (argv.model.substr(0, 1) == '/') {
      // fullpath given let's go
      modelPath = argv.model;
    } else {
      // relative path given
      modelPath = path.resolve(__dirname, argv.model);
    }
    try {
      return loader.loadModelFromString(JSON.stringify(require(modelPath))).get(0);
    } catch (ignore) {
      log.warn('Unable to load model from \''+ argv.model+'\'');
    }
  }
}


kRuntime.start(argv.nodeName || config.nodeName, argv.groupName || config.groupName);