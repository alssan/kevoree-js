var AbstractChannel = require('kevoree-entities').AbstractChannel,
    WebSocket       = require('ws'),
    WebSocketServer = require('ws').Server;

var REGISTER = 42;

/**
 * Kevoree channel
 * @type {WebSocketChannel}
 */
var WebSocketChannel = AbstractChannel.extend({
  toString: 'WebSocketChannel',

  construct: function () {
    this.server = null;
    this.client = null;
    this.connectedClients = [];
  },

  /**
   * this method will be called by the Kevoree platform when your channel has to start
   */
  start: function (_super) {
    _super.call(this);

    this.checkNoMultipleMasterServer();

    var port = this.dictionary.getValue('port');
    if (typeof(port) == 'undefined' || port.length == 0) this.startWSClient();
    else this.startWSServer(port);
  },

  /**
   * this method will be called by the Kevoree platform when your channel has to stop
   */
  stop: function () {
    this.log.warn(this.toString(), 'stop() method not implemented yet.');
    // TODO
  },

  /**
   * When a channel is bound with an output port this method will be called when a message is sent
   *
   * @param fromPortPath port that sends the message
   * @param destPortPaths port paths of connected input port that should receive the message
   * @param msg
   */
  onSend: function (fromPortPath, destPortPaths, msg) {
    if (this.client != null) {
      // directly send message to server because we can't much more =)
      this.client.send(msg);

    } else if (this.server != null) {
      // broadcast message to each connected clients
      for (var i in this.connectedClients) {
        this.connectedClients[i].send(msg);
      }
    }
  },

  startWSServer: function (port) {
    try {
      this.server = new WebSocketServer({port: port});
      this.log.debug(this.toString(), 'New server created for channel');

      this.server.on('connection', function(ws) {
        this.connectedClients.push(ws);

        ws.onmessage = localDispatchHandler.bind(this);
        ws.onerror = function () {
          this.connectedClients.splice(this.connectedClients.indexOf(ws), 1);
        }.bind(this);
        ws.onclose = function () {
          this.connectedClients.splice(this.connectedClients.indexOf(ws), 1);
        }.bind(this);

      }.bind(this));
    } catch (err) {
      // if we end-up here it most certainly means that we are running on the browser
      // platform, and yeah, we can't create a server on browser platform, so...
      this.log.warn(this.toString(), 'Are you trying to run a WebSocket server in kevoree-browser-runtime ? Sorry, I cannot do that :/');
    }
  },

  startWSClient: function () {
    var addresses = this.getMasterServerAddresses();
    if (typeof(addresses) !== 'undefined' && addresses != null && addresses.length > 0) {
      this.client = new WebSocket('ws://'+addresses[0]); // TODO change that => to try each different addresses not only the first one

      this.client.onmessage = localDispatchHandler.bind(this);

      this.client.onclose = function onClose() {
        this.log.debug(this.toString(), "WebSocketChannel info: client connection closed with server ("+ws._socket.remoteAddress+":"+ws._socket.remotePort+")");
        // TODO: auto reconnect
      }.bind(this);

      this.client.onerror = function onError() {
        // TODO: auto reconnect
      }.bind(this);

    } else {
      throw new Error("There is no master server in your model. You must specify a master server by giving a value to one port attribute.");
    }
  },

  getMasterServerAddresses: function () {
    var addresses = [];

    var chan = this.getModelEntity();
    var values = (chan.dictionary.values) ? chan.dictionary.values.iterator() : null;
    if (values) {
      while (values.hasNext()) {
        var val = values.next();
        if (val.value && val.value.length > 0) {
          var port = val.value;
          var hosts = this.getNodeHosts(val.targetNode);
          for (var host in hosts) addresses.push(host+':'+port);
          return addresses;
        }
      }
    }
  },

  getNodeHostsByPort: function (portPath) {
    var model = this.getKevoreeCore().getCurrentModel();
    var node = model.findByPath(portPath).eContainer().eContainer();
    return this.getNodeHosts(node);
  },

  getNodeHosts: function (targetNode) {
    var model = this.getKevoreeCore().getDeployModel();
    var hosts = [];

    var networks = model.nodeNetworks ? model.nodeNetworks.iterator() : null;
    if (networks) {
      while (networks.hasNext()) {
        var net = networks.next();
        if (net.target.name == targetNode.name) {
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

  checkNoMultipleMasterServer: function () {
    var portDefined = 0;
    var chan = this.getModelEntity();
    var values = (chan.dictionary.values) ? chan.dictionary.values.iterator() : null;
    if (values) {
      while (values.hasNext()) {
        var val = values.next();
        if (val.value && val.value.length > 0) portDefined++;
      }
    }

    if (portDefined == 0 || portDefined > 1)
      throw new Error(this.toString()+' error: You must specify one and only one port attribute per fragment.');
  },

  dic_port: {
    fragmentDependant: true,
    optional: true
  }
});

/**
 * you should call this method with a WebSocketChannel context (because it uses 'this', and expects it
 * to be a WebSocketChannel instance)
 * @param data
 */
var localDispatchHandler = function (data) {
  if (data.type != 'binary' || typeof(data.data) == 'string') {
    // received data is a String
    this.localDispatch(data.data);

  } else {
    // received data is binary
    this.localDispatch(String.fromCharCode.apply(null, new Uint8Array(data.data)));
  }
}

module.exports = WebSocketChannel;
