// if you have already created your own Channel extending AbstractChannel
// you can replace AbstractChannel here and use your own
// ex: var MyChan = require('./path/to/MyChan')
// the only thing needed is that the top level channel extends AbstractChannel :)
var AbstractChannel = require('kevoree-entities').AbstractChannel,
    Stomp           = require('stomp-client');

/**
 * Kevoree channel
 * @type {StompServer}
 */
var StompServer = AbstractChannel.extend({
  toString: 'StompServer',

  construct: function () {
    this.client = null;
    this.connected = false;
  },

  /**
   * this method will be called by the Kevoree platform when your channel has to start
   */
  start: function (_super) {
    _super.call(this);

    var host  = this.dictionary.getValue('host');
    var port  = this.dictionary.getValue('port');
    var topic = this.dictionary.getValue('topic') || '/';

    this.client = new Stomp(host, port);

    this.client.on('connect', function() {
      this.connected = true;
    }.bind(this));
    this.client.on('disconnect', function() {
      this.connected = false;
      // TODO auto-reconnect
    }.bind(this));
    this.client.on('error', function() {
      this.connected = false;
      // TODO auto-reconnect
    }.bind(this));

    this.client.connect(function (sessionID) {
      this.client.subscribe(topic, function(body, headers) {
        try {
          var msg = JSON.parse(body);
          this.localDispatch(msg.destPortPath, msg.msg);
        } catch (err) {
          this.log.warn(this.toString(), 'Unable to process received message. Dropping it.');
        }
      }.bind(this));
    }.bind(this));
  },

  /**
   * this method will be called by the Kevoree platform when your channel has to stop
   */
  stop: function () {
    if (this.client != null) this.client.disconnect();
  },

  /**
   * When a channel is bound with an output port this method will be called 'n' times
   * when this output port will send a message ('n' corresponding to the number of input port
   * connected to this channel)
   * @param fromPortPath
   * @param destPortPath
   * @param msg
   */
  onSend: function (fromPortPath, destPortPath, msg) {
    if (this.client != null && this.connected == true) {
      var topic = this.dictionary.getValue('topic') || '/';
      this.client.publish(topic, JSON.stringify({destPortPath: destPortPath, msg: msg}));
    }
    // TODO set later if not yet connected
  },

  dic_host: {
    optional: false,
    fragmentDependant: false
  },
  dic_port: {
    optional: false,
    fragmentDependant: false
  },
  dic_topic: {
    optional: true,
    fragmentDependant: false,
    defaultValue: '/'
  }
});

module.exports = StompServer;
