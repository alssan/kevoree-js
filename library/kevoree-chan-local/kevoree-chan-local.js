var AbstractChannel = require('kevoree-entities').AbstractChannel,
    KevoreeLogger   = require('kevoree-commons').KevoreeLogger;

var LocalChannel = AbstractChannel.extend({
    toString: 'LocalChannel',

    construct: function () {
        this.log = new KevoreeLogger(this.toString());
    },

    start: function () {
        this.log.info('Local channel started');
    },

    onSend: function (fromPortPath, destPortPath, msg) {
      // directly dispatching message locally
      // without using client/server architecture because it is the purpose
      // of this channel : only works locally (on the same node)
      this.localDispatch(destPortPath, msg);
    }
});

module.exports = LocalChannel;