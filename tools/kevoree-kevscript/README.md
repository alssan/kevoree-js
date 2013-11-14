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
This will try to parse the KevScript file from ```examples/test-parser.kevs``` with ```parser/kevoree-parser.js```
If you can see a JSON object representing a Kevoree model-like, you won.

Checker & Kevoree model generator TODO