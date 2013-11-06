var peg  = require('pegjs'),
    path = require('path'),
    fs   = require('fs');

module.exports = function (grunt) {

  // tasks
  grunt.registerTask(
    'parser',
    "Generate KevScript parser from grammar/kevscript.pegjs using PEGjs",
    function () {
      var exportVar = grunt.option('exportVar') || 'module.exports';

      var callback = this.async();

      fs.readFile(path.resolve(__dirname, 'grammar', 'kevscript.pegjs'), 'utf8', function (err, data) {
        if (err) return callback(err);

        try {
          var parser = peg.buildParser(data);
          var parserSource = exportVar + " = " + parser.toSource() + ";\n";
          fs.writeFile(path.resolve(__dirname, 'parser', 'kevscript-parser.js'), parserSource, function (err) {
            if (err) return callback(err);

            callback();
          });
        } catch (parserErr) {
          return callback(parserErr);
        }
      });
    }
  );

  // task sets
  grunt.registerTask('gen-parser', ['parser']);
};