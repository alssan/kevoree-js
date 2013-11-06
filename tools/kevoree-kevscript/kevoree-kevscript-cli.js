var path = require('path'),
    fs   = require('fs'),
    argv = require('optimist')
              .usage('Usage: $0 -k path/to/a/model.kevs [-o path/to/output/model.json]')
              .demand(['k', 'o'])
              .alias('k', 'kevs')
              .alias('o', 'output')
              .describe('k', 'Path to the KevScript source file you want to transform into a Kevoree JSON model')
              .describe('o', 'Where to write the output Kevoree JSON model')
              .default('o', '.')
              .argv,
    KevScript = require('./lib/KevScript'),
    kevoree   = require('kevoree-library').org.kevoree;

var input = path.resolve(argv.k);
var output = path.resolve(argv.o);
var kevs = new KevScript();
var serializer = new kevoree.serializer.JSONModelSerializer();

fs.readFile(input, 'utf8', function (err, data) {
  if (err) throw err;

  var model = kevs.parse(data);
  try {
    var modelStr = JSON.stringify(JSON.parse(serializer.serialize(model)), null, 4);
    fs.writeFile(output, modelStr, 'utf8', function (err) {
      if (err) throw err;
      console.log('Success =)');
    });
  } catch (err) {
    console.log("Unable to serialize ContainerRoot model.\n", err.stack);
  }
});

