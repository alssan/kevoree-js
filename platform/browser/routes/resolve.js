var http       = require('http'),
    fs         = require('fs'),
    path       = require('path'),
    zlib       = require('zlib'),
    tar        = require('tar'),
    AdmZip     = require('adm-zip'),
    rimraf     = require('rimraf'),
    browserify = require('browserify'),
    npm        = require('npm');


var BROWSER_MODULES = 'browser_modules',
    BROWSER_TAG     = '-kbrowser';

/**
 * GET /resolve
 *
 * Request param = {
 *  type: string,       // deployUnit.type (npm, git, etc...)
 *  name: string,       // deployUnit.name (kevoree-node, kevoree-comp-helloworld, ...)
 *  version: string     // deployUnit.version (0.0.1, ...)
 * }
 *
 * @param req
 * @param res
 */
module.exports = function(req, res) {
  if (req.body.type == 'npm') {

    var installDir        = path.resolve('site', 'public', 'libraries'),
        modulePath        = path.resolve(installDir, 'node_modules', req.body.name),
        browserModulePath = path.resolve(installDir, BROWSER_MODULES, req.body.name+BROWSER_TAG),
        downloadLink      = '/libraries/'+BROWSER_MODULES+'/'+req.body.name+BROWSER_TAG+'.zip';

    // check if bundle as already been downloaded
    if (!fs.existsSync(browserModulePath+'.zip')) {
      // install module with npm
      npm.load({}, function (err) {
        if (err) {
          res.send(500, 'Unable to load npm module');
          return;
        }

        // load success
        npm.commands.install(installDir, [req.body.name+'@'+req.body.version], function installCallback(err) {
          if (err) {
            res.send(500, 'npm failed to install package %s:%s', req.body.name, req.body.version);
            return;
          }
          // installation succeeded
          fs.mkdir(browserModulePath, function () {
            // browserify module
            var b = browserify();
            var bundleFile = fs.createWriteStream(path.resolve(browserModulePath, req.body.name+'-bundle.js'));

            // set kevoree-library et kevoree-kotlin as 'provided externally' because there are bundled with
            // kevoree-browser-runtime-client, if you don't do that, they will be loaded multiple times
            // and the whole thing will blew up like crazy, trust me (just lost 2 hours)
            b.external(path.resolve(process.cwd(), 'client', 'node_modules', 'kevoree-library'), {expose: 'kevoree-library'})
              .external(path.resolve(process.cwd(), 'client', 'node_modules', 'kevoree-kotlin'), {expose: 'kevoree-kotlin'})
              .require(modulePath, { expose: req.body.name })
              .transform('brfs')// will try to get content from fs.readFileSync() into a function (to be available as a string later on)
              .bundle({detectGlobals: false})
              .pipe(bundleFile)
              .on('finish', function () {
                // zip browser-bundled folder
                var zip = new AdmZip();
                zip.addLocalFolder(browserModulePath);
                zip.writeZip(browserModulePath+'.zip');
                // remove browserModulePath folder from server
                rimraf(browserModulePath, function (err) {
                  if (err) console.error("Unable to delete %s folder :/", browserModulePath);
                });
                // send response
                return res.json({
                  zipPath: downloadLink,
                  zipName: req.body.name+'@'+req.body.version,
                  requireName: modulePath
                });
              });
          });
        });
      });

    } else {
      // send response
      res.json({
        zipPath: downloadLink,
        zipName: req.body.name+'@'+req.body.version,
        requireName: modulePath
      });
      return;
    }

  } else {
    res.send(500, 'Sorry, for now Kevoree Browser Runtime server is only able to resolve "npm" packages.');
  }
};