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
  },

  /**
   * this method will be called by the Kevoree platform when your channel has to start
   */
  start: function (_super) {
    _super.call(this);

    var port = this.dictionary.getValue('port');
    if (typeof(port) == 'undefined' || port.length == 0) this.startWSClient();
    else this.startWSServer(port);
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
    var port  = this.dictionary.getValue('port') || 8088;
    var hosts = this.getNodeHosts(destPortPath);

    // TODO try to use every value in hosts[] not only the first one
    var client = new WebSocket('ws://'+hosts[0]+':'+port);
    client.onopen = function () {
      client.send(JSON.stringify({ destPortPath: destPortPath, msg: msg }));
      this.log.debug(this.toString(), 'Connection to server made for channel (message should have been sent!)');
    }.bind(this);
  },

  startWSServer: function (port) {
    try {
      this.server = new WebSocketServer({port: port});
      this.log.debug(this.toString(), 'New server created for channel');

      this.server.on('connection', function(ws) {
        ws.onmessage = localDispatchHandler.bind(this);
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

      this.client.onopen = function onOpen() {
        var binMsg = new Uint8Array(chan.getNodeName().length+1);
        binMsg[0] = REGISTER;
        for (var i=0; i < chan.getNodeName().length; i++) {
          binMsg[i+1] = chan.getNodeName().charCodeAt(i);
        }
        this.client.send(binMsg);
      }.bind(this);

      this.client.onmessage = localDispatchHandler.bind(this);

      this.client.onclose = function onClose() {
        chan.log.debug(this.toString(), "WebSocketChannel info: client connection closed with server ("+ws._socket.remoteAddress+":"+ws._socket.remotePort+")");
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
    var model = this.getKevoreeCore().getCurrentModel();
    var bindings = model.mBindings ? model.mBindings.iterator() : null;
    if (bindings) {
      while (bindings.hasNext()) {
        var binding = bindings.next();
        if (binding.hub.path() == this.getPath()) {
          // this binding refers to this channel
        }
      }
    }
  },

  getNodeHosts: function (portPath) {
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
  var jsonMsg = JSON.parse(data);
  this.localDispatch(jsonMsg.destPortPath, jsonMsg.msg);
}

module.exports = WebSocketChannel;
