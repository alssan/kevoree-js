var kevsParser = require('./../parser/kevscript-parser'),
    fs         = require('fs'),
    path       = require('path');

fs.readFile(path.resolve(__dirname, '..', 'examples', 'test-parser.kevs'), 'utf8', function (err, data) {
  if (err) throw err;

  var result = kevsParser.parse(data);
  console.log(JSON.stringify(result, null, 2));
});