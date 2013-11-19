var jade = require('./runtime');

(function (jade) {
	module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div><input id="msg" type="text"/><button id="send">' + escape((interp = foo) == null ? '' : interp) + '</button></div><div><ul id="msg-list"></ul></div>');
}
return buf.join("");
};
})(jade);