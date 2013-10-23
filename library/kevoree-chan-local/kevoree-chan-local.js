var AbstractChannel = require('kevoree-entities').AbstractChannel;

var LocalChannel = AbstractChannel.extend({
  toString: 'LocalChannel',

  start: function (_super) {
    _super.call(this);
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