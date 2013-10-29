// if you have already created your own Channel extending AbstractChannel
// you can replace AbstractChannel here and use your own
// ex: var MyChan = require('./path/to/MyChan')
// the only thing needed is that the top level channel extends AbstractChannel :)
var AbstractChannel = require('kevoree-entities').AbstractChannel;

/**
 * Kevoree channel
 * @type {<%= entityName %>}
 */
var <%= entityName %> = <%= entityType %>.extend({
  toString: '<%= entityName %>',

  /**
   * this method will be called by the Kevoree platform when your channel has to start
   */
  start: function (_super) {
    _super.call(this);
    // TODO
  },

  /**
   * this method will be called by the Kevoree platform when your channel has to stop
   */
  stop: function () {
    // TODO
  },

  /**
   * When a channel is bound with an output port this method will be called 'n' times
   * when this output port will send a message ('n' corresponding to the number of input port
   * connected to this channel)
   * @param fromPortPath
   * @param destPortPaths Array
   * @param msg
   */
  onSend: function (fromPortPath, destPortPaths, msg) {
    // TODO
  }
});

module.exports = <%= entityName %>;
