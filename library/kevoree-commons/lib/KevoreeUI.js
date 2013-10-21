var Class = require('pseudoclass'),
    KevoreeLogger = require('./KevoreeLogger');

var KevoreeUI = Class({
  toString: 'KevoreeUI',

  construct: function () {
    this.root = null;
    this.log = new KevoreeLogger(this.toString());
    this.name = '';
  },

  isReady: function () {
    return (this.root != null);
  },

  setRoot: function (root) {
    this.root = root;
  },

  initialize: function (comp, initCmd, callback) {
    var self = this;

    this.name = comp.getName();

    if (typeof(initCmd) == 'undefined' || initCmd == null) return callback(new Error('KevoreeUI init command unset in KevoreeCore.'));

    initCmd(this, function (err) {
      if (err) {
        self.log.error(err.message);
        self.root = null;
        return callback(err);
      }

      return callback();
    });
  },

  setContent: function (content) {
    this.root.innerHTML = content;
  },

  getName: function () {
    return this.name;
  },

  setName: function (name) {
    this.name = name;
  }
});

module.exports = KevoreeUI;