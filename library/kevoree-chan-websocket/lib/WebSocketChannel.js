var AbstractChannel = require('kevoree-entities').AbstractChannel,
    WebSocket       = require('ws'),
    WebSocketServer = require('ws').Server;

/**
 * Kevoree channel
 * @type {WebSocketChannel}
 */
var WebSocketChannel = AbstractChannel.extend({
  toString: 'WebSocketChannel',

  construct: function () {
    this.server = null;
  },

  /**
   * this method will be called by the Kevoree platform when your channel has to start
   */
  start: function (_super) {
    _super.call(this);
    var port = this.dictionary.getValue('port');
    if (port == undefined) {
      port = 8088;
      this.log.info(this.toString(), 'No port attribute specified for '+this.getName()+', using '+port+' as default.');
    }
    this.startWSServer(port);
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
   * @param destPortPath
   * @param msg
   */
  onSend: function (fromPortPath, destPortPath, msg) {
    var port = this.dictionary.getValue('port') || 8088;
    var hosts = this.getNodeHost(destPortPath);

    // TODO try to use every value in hosts[] not only the first one
    var client = new WebSocket('ws://'+hosts[0]+':'+port);
    client.onopen = function () {
      client.send(JSON.stringify({ destPortPath: destPortPath, msg: msg }));
    }
  },

  startWSServer: function (port) {
    try {
      this.server = new WebSocketServer({port: port});

      this.server.on('connection', function(ws) {
        ws.on('message', function(data) {
          var jsonMsg = JSON.parse(data);
          this.localDispatch(jsonMsg.destPortPath, jsonMsg.msg);

        }.bind(this));
      }.bind(this));
    } catch (err) {
      // if we end-up here it most certainly means that we are running on the browser
      // platform, and yeah, we can't create a server on browser platform, so...
      this.log.warn(this.toString(), 'Are you trying to run a WebSocket server in kevoree-browser-runtime ? Sorry, I cannot do that :/');
    }
  },

  getNodeHost: function (portPath) {
    var model = this.getKevoreeCore().getCurrentModel();
    var node = model.findByPath(portPath).eContainer().eContainer();
    var hosts = [];

    var networks = model.nodeNetworks ? model.nodeNetworks.iterator() : null;
    if (networks) {
      while (networks.hasNext()) {
        var net = networks.next();
        if (net.target.name == node.name) {
          var links = net.link ? net.link.iterator() : null;
          if (links) {
            while (links.hasNext()) {
              var link = links.next();
              var props = link.networkProperties ? link.networkProperties.iterator() : null;
              if (props) {
                while (props.hasNext()) {
                  hosts.push(props.next().value);
                }
              }
            }
          }
        }
      }
    }

    if (hosts.length == 0) {
      // no host found for this portPath in model, lets give it a try locally
      hosts.push('127.0.0.1');
    }

    return hosts;
  },

  dic_port: {
    defaultValue: 8088,
    fragmentDependant: true,
    optional: true
  }
});

module.exports = WebSocketChannel;
