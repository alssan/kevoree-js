## kevoree-kevscript

Convert a KevScript file to a Kevoree model (ContainerRoot)

```sh
node kevs2model.js -k examples/test-parser.kevs
# will output `model.json` in current directory
```

To be sure that the parser works correctly, run:
```sh
node test/test-parser.js
```
This will try to parse the KevScript file from ```examples/test-parser.kevs```  
If you can see a JSON object representing a Kevoree model-like, you won.

If you want to generate ```kevoree-kevscript.js``` for the browser, just run:
```sh
npm install
grunt browser
```
This will create a new folder named ```browser/``` in the project root containing a raw browserified version of
```kevoree-kevscript``` and a uglified one.
> ie. Default ```grunt browser``` task will generate an AMD bundle.