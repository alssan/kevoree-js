var Class = require('pseudoclass');

var KevoreeLogger = Class({
  toString: 'KevoreeLogger',

  construct: function (tag) {
    this.tag = tag;
  },

  info: function (tag, msg) {
    if (typeof(msg) == 'undefined') {
      msg = tag;
      tag = this.tag;
    }
    console.log('[INFO] '+tag+': '+msg);
  },

  warn: function (tag, msg) {
    if (typeof(msg) == 'undefined') {
      msg = tag;
      tag = this.tag;
    }
    console.warn('[WARN] '+tag+': '+msg);
  },

  error: function (tag, msg) {
    if (typeof(msg) == 'undefined') {
      msg = tag;
      tag = this.tag;
    }
    console.error('[ERROR] '+tag+': '+msg);
  },

  debug: function (tag, msg) {
    if (typeof(msg) == 'undefined') {
      msg = tag;
      tag = this.tag;
    }
    console.log('[DEBUG] '+tag+': '+msg);
  },

  setTag: function (tag) {
    this.tag = tag;
  }
});

module.exports = KevoreeLogger;