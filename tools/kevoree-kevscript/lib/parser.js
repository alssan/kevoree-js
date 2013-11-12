/*
 * Generated by the Waxeye Parser Generator - version 0.8.0
 * www.waxeye.org
 */

var waxeye = waxeye;
if (typeof module !== 'undefined') {
    // require from module system
    waxeye = require('waxeye');
}

var Parser = (function() {

    var parser = function() { return this; };
    parser.prototype = new waxeye.WaxeyeParser(0, true, [new waxeye.FA("kevScript", [new waxeye.State([new waxeye.Edge(1, 1, false)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false),
            new waxeye.State([new waxeye.Edge(1, 3, false)], true),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false)], waxeye.FA.LEFT),
        new waxeye.FA("statement", [new waxeye.State([new waxeye.Edge(2, 1, false),
                new waxeye.Edge(3, 1, false),
                new waxeye.Edge(4, 1, false),
                new waxeye.Edge(5, 1, false),
                new waxeye.Edge(6, 1, false),
                new waxeye.Edge(7, 1, false),
                new waxeye.Edge(12, 1, false),
                new waxeye.Edge(13, 1, false),
                new waxeye.Edge(8, 1, false)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false),
            new waxeye.State([], true)], waxeye.FA.LEFT),
        new waxeye.FA("add", [new waxeye.State([new waxeye.Edge(16, 1, false)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false),
            new waxeye.State([new waxeye.Edge(23, 3, false),
                new waxeye.Edge(14, 8, false)], false),
            new waxeye.State([new waxeye.Edge(26, 4, false)], false),
            new waxeye.State([new waxeye.Edge(":", 5, true)], false),
            new waxeye.State([new waxeye.Edge(26, 6, false)], false),
            new waxeye.State([new waxeye.Edge(23, 7, false)], false),
            new waxeye.State([], true),
            new waxeye.State([new waxeye.Edge(26, 9, false)], false),
            new waxeye.State([new waxeye.Edge(":", 10, true)], false),
            new waxeye.State([new waxeye.Edge(26, 11, false)], false),
            new waxeye.State([new waxeye.Edge(23, 7, false)], false)], waxeye.FA.LEFT),
        new waxeye.FA("remove", [new waxeye.State([new waxeye.Edge(17, 1, false)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false),
            new waxeye.State([new waxeye.Edge(23, 3, false),
                new waxeye.Edge(14, 4, false)], false),
            new waxeye.State([], true),
            new waxeye.State([new waxeye.Edge(26, 5, false)], false),
            new waxeye.State([new waxeye.Edge(":", 6, true)], false),
            new waxeye.State([new waxeye.Edge(26, 7, false)], false),
            new waxeye.State([new waxeye.Edge(23, 3, false)], false)], waxeye.FA.LEFT),
        new waxeye.FA("move", [new waxeye.State([new waxeye.Edge(18, 1, false)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false),
            new waxeye.State([new waxeye.Edge(23, 3, false),
                new waxeye.Edge(14, 6, false),
                new waxeye.Edge("*", 8, false)], false),
            new waxeye.State([new waxeye.Edge(26, 4, false)], false),
            new waxeye.State([new waxeye.Edge(23, 5, false)], false),
            new waxeye.State([], true),
            new waxeye.State([new waxeye.Edge(26, 7, false)], false),
            new waxeye.State([new waxeye.Edge(23, 5, false)], false),
            new waxeye.State([new waxeye.Edge("@", 9, true),
                new waxeye.Edge(26, 11, false)], false),
            new waxeye.State([new waxeye.Edge(23, 10, false)], false),
            new waxeye.State([new waxeye.Edge(26, 11, false)], false),
            new waxeye.State([new waxeye.Edge(23, 5, false)], false)], waxeye.FA.LEFT),
        new waxeye.FA("attach", [new waxeye.State([new waxeye.Edge(20, 1, false)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false),
            new waxeye.State([new waxeye.Edge(23, 3, false),
                new waxeye.Edge(14, 6, false),
                new waxeye.Edge("*", 8, false)], false),
            new waxeye.State([new waxeye.Edge(26, 4, false)], false),
            new waxeye.State([new waxeye.Edge(23, 5, false)], false),
            new waxeye.State([], true),
            new waxeye.State([new waxeye.Edge(26, 7, false)], false),
            new waxeye.State([new waxeye.Edge(23, 5, false)], false),
            new waxeye.State([new waxeye.Edge(26, 9, false)], false),
            new waxeye.State([new waxeye.Edge(23, 5, false)], false)], waxeye.FA.LEFT),
        new waxeye.FA("detach", [new waxeye.State([new waxeye.Edge(21, 1, false)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false),
            new waxeye.State([new waxeye.Edge(23, 3, false),
                new waxeye.Edge(14, 6, false),
                new waxeye.Edge("*", 8, false)], false),
            new waxeye.State([new waxeye.Edge(26, 4, false)], false),
            new waxeye.State([new waxeye.Edge(23, 5, false)], false),
            new waxeye.State([], true),
            new waxeye.State([new waxeye.Edge(26, 7, false)], false),
            new waxeye.State([new waxeye.Edge(23, 5, false)], false),
            new waxeye.State([new waxeye.Edge(26, 9, false)], false),
            new waxeye.State([new waxeye.Edge(23, 5, false)], false)], waxeye.FA.LEFT),
        new waxeye.FA("set", [new waxeye.State([new waxeye.Edge(19, 1, false)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false),
            new waxeye.State([new waxeye.Edge(23, 3, false)], false),
            new waxeye.State([new waxeye.Edge(26, 4, false)], false),
            new waxeye.State([new waxeye.Edge(9, 5, false)], false),
            new waxeye.State([], true)], waxeye.FA.LEFT),
        new waxeye.FA("network", [new waxeye.State([new waxeye.Edge(22, 1, false)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false),
            new waxeye.State([new waxeye.Edge(23, 3, false)], false),
            new waxeye.State([new waxeye.Edge(26, 4, false)], false),
            new waxeye.State([new waxeye.Edge(24, 5, false)], false),
            new waxeye.State([], true)], waxeye.FA.LEFT),
        new waxeye.FA("dictionary", [new waxeye.State([new waxeye.Edge(10, 1, false)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], true),
            new waxeye.State([new waxeye.Edge([","], 3, true)], true),
            new waxeye.State([new waxeye.Edge(26, 4, false)], false),
            new waxeye.State([new waxeye.Edge(10, 2, false)], false)], waxeye.FA.LEFT),
        new waxeye.FA("attrList", [new waxeye.State([new waxeye.Edge("{", 1, true)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false),
            new waxeye.State([new waxeye.Edge(11, 3, false)], false),
            new waxeye.State([new waxeye.Edge(26, 4, false)], false),
            new waxeye.State([new waxeye.Edge([","], 5, true),
                new waxeye.Edge(26, 7, false)], false),
            new waxeye.State([new waxeye.Edge(26, 6, false)], false),
            new waxeye.State([new waxeye.Edge(11, 4, false)], false),
            new waxeye.State([new waxeye.Edge("}", 8, true)], false),
            new waxeye.State([new waxeye.Edge("@", 9, true)], true),
            new waxeye.State([new waxeye.Edge(23, 10, false)], false),
            new waxeye.State([], true)], waxeye.FA.LEFT),
        new waxeye.FA("attribute", [new waxeye.State([new waxeye.Edge(23, 1, false)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false),
            new waxeye.State([new waxeye.Edge("=", 3, true)], false),
            new waxeye.State([new waxeye.Edge(26, 4, false)], false),
            new waxeye.State([new waxeye.Edge(["\'"], 5, true),
                new waxeye.Edge(["\""], 10, true)], false),
            new waxeye.State([new waxeye.Edge(26, 6, false)], false),
            new waxeye.State([new waxeye.Edge(24, 7, false)], false),
            new waxeye.State([new waxeye.Edge(26, 8, false)], false),
            new waxeye.State([new waxeye.Edge(["\'"], 9, true)], false),
            new waxeye.State([], true),
            new waxeye.State([new waxeye.Edge(26, 11, false)], false),
            new waxeye.State([new waxeye.Edge(24, 12, false)], false),
            new waxeye.State([new waxeye.Edge(26, 13, false)], false),
            new waxeye.State([new waxeye.Edge(["\""], 9, true)], false)], waxeye.FA.LEFT),
        new waxeye.FA("addBinding", [new waxeye.State([new waxeye.Edge(23, 1, false)], false),
            new waxeye.State([new waxeye.Edge(".", 2, true)], false),
            new waxeye.State([new waxeye.Edge(23, 3, false)], false),
            new waxeye.State([new waxeye.Edge(26, 4, false)], false),
            new waxeye.State([new waxeye.Edge("=", 5, true)], false),
            new waxeye.State([new waxeye.Edge(">", 6, true)], false),
            new waxeye.State([new waxeye.Edge(26, 7, false)], false),
            new waxeye.State([new waxeye.Edge(23, 8, false)], false),
            new waxeye.State([], true)], waxeye.FA.LEFT),
        new waxeye.FA("merge", [new waxeye.State([new waxeye.Edge(15, 1, false)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false),
            new waxeye.State([new waxeye.Edge(23, 3, false)], false),
            new waxeye.State([new waxeye.Edge(":", 4, true)], false),
            new waxeye.State([new waxeye.Edge(24, 5, false)], false),
            new waxeye.State([], true)], waxeye.FA.LEFT),
        new waxeye.FA("nameList", [new waxeye.State([new waxeye.Edge(23, 1, false)], false),
            new waxeye.State([new waxeye.Edge(26, 2, false)], false),
            new waxeye.State([new waxeye.Edge([","], 3, true)], true),
            new waxeye.State([new waxeye.Edge(26, 4, false)], false),
            new waxeye.State([new waxeye.Edge(23, 2, false)], false)], waxeye.FA.LEFT),
        new waxeye.FA("mergeToken", [new waxeye.State([new waxeye.Edge("m", 1, false)], false),
            new waxeye.State([new waxeye.Edge("e", 2, false)], false),
            new waxeye.State([new waxeye.Edge("r", 3, false)], false),
            new waxeye.State([new waxeye.Edge("g", 4, false)], false),
            new waxeye.State([new waxeye.Edge("e", 5, false)], false),
            new waxeye.State([], true)], waxeye.FA.VOID),
        new waxeye.FA("addToken", [new waxeye.State([new waxeye.Edge("a", 1, false)], false),
            new waxeye.State([new waxeye.Edge("d", 2, false)], false),
            new waxeye.State([new waxeye.Edge("d", 3, false)], false),
            new waxeye.State([], true)], waxeye.FA.VOID),
        new waxeye.FA("removeToken", [new waxeye.State([new waxeye.Edge("r", 1, false)], false),
            new waxeye.State([new waxeye.Edge("e", 2, false)], false),
            new waxeye.State([new waxeye.Edge("m", 3, false)], false),
            new waxeye.State([new waxeye.Edge("o", 4, false)], false),
            new waxeye.State([new waxeye.Edge("v", 5, false)], false),
            new waxeye.State([new waxeye.Edge("e", 6, false)], false),
            new waxeye.State([], true)], waxeye.FA.VOID),
        new waxeye.FA("moveToken", [new waxeye.State([new waxeye.Edge("m", 1, false)], false),
            new waxeye.State([new waxeye.Edge("o", 2, false)], false),
            new waxeye.State([new waxeye.Edge("v", 3, false)], false),
            new waxeye.State([new waxeye.Edge("e", 4, false)], false),
            new waxeye.State([], true)], waxeye.FA.VOID),
        new waxeye.FA("setToken", [new waxeye.State([new waxeye.Edge("s", 1, false)], false),
            new waxeye.State([new waxeye.Edge("e", 2, false)], false),
            new waxeye.State([new waxeye.Edge("t", 3, false)], false),
            new waxeye.State([], true)], waxeye.FA.VOID),
        new waxeye.FA("attachToken", [new waxeye.State([new waxeye.Edge("a", 1, false)], false),
            new waxeye.State([new waxeye.Edge("t", 2, false)], false),
            new waxeye.State([new waxeye.Edge("t", 3, false)], false),
            new waxeye.State([new waxeye.Edge("a", 4, false)], false),
            new waxeye.State([new waxeye.Edge("c", 5, false)], false),
            new waxeye.State([new waxeye.Edge("h", 6, false)], false),
            new waxeye.State([], true)], waxeye.FA.VOID),
        new waxeye.FA("detachToken", [new waxeye.State([new waxeye.Edge("d", 1, false)], false),
            new waxeye.State([new waxeye.Edge("e", 2, false)], false),
            new waxeye.State([new waxeye.Edge("t", 3, false)], false),
            new waxeye.State([new waxeye.Edge("a", 4, false)], false),
            new waxeye.State([new waxeye.Edge("c", 5, false)], false),
            new waxeye.State([new waxeye.Edge("h", 6, false)], false),
            new waxeye.State([], true)], waxeye.FA.VOID),
        new waxeye.FA("networkToken", [new waxeye.State([new waxeye.Edge("n", 1, false)], false),
            new waxeye.State([new waxeye.Edge("e", 2, false)], false),
            new waxeye.State([new waxeye.Edge("t", 3, false)], false),
            new waxeye.State([new waxeye.Edge("w", 4, false)], false),
            new waxeye.State([new waxeye.Edge("o", 5, false)], false),
            new waxeye.State([new waxeye.Edge("r", 6, false)], false),
            new waxeye.State([new waxeye.Edge("k", 7, false)], false),
            new waxeye.State([], true)], waxeye.FA.VOID),
        new waxeye.FA("string", [new waxeye.State([new waxeye.Edge(["-", [48, 57], [65, 90], "_", [97, 122]], 1, false)], false),
            new waxeye.State([new waxeye.Edge(["-", [48, 57], [65, 90], "_", [97, 122]], 1, false)], true)], waxeye.FA.LEFT),
        new waxeye.FA("string2", [new waxeye.State([new waxeye.Edge([[45, 46], [48, 58], [64, 90], "_", [97, 122]], 1, false)], false),
            new waxeye.State([new waxeye.Edge([[45, 46], [48, 58], [64, 90], "_", [97, 122]], 1, false)], true)], waxeye.FA.LEFT),
        new waxeye.FA("eol", [new waxeye.State([new waxeye.Edge("\r", 1, false),
                new waxeye.Edge("\n", 2, false),
                new waxeye.Edge("\r", 2, false)], false),
            new waxeye.State([new waxeye.Edge("\n", 2, false)], false),
            new waxeye.State([], true)], waxeye.FA.VOID),
        new waxeye.FA("ws", [new waxeye.State([new waxeye.Edge(["\t", " "], 0, false),
                new waxeye.Edge(25, 0, false)], true)], waxeye.FA.VOID)]);
    return parser;
 
})();

// Add to module system
if (typeof module !== 'undefined') {
    module.exports.Parser = Parser;
}
