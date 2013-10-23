var AbstractComponent = require('kevoree-entities').AbstractComponent;

/**
 * Kevoree component
 * @type {HelloWorldComponent}
 */
var HelloWorldComponent = AbstractComponent.extend({
  toString: 'HelloWorldComponent',

  construct: function () {
    this.id = null;
  },

  /**
   *
   */
  start: function (_super) {
    _super.call(this);
    var self = this;

    this.log.info('Hello world!');

    this.id = setInterval(function () {
      // send a message through output port 'sendText' every 2 seconds
      self.out_sendText('hello world '+(new Date));
    }, 2000);

    this.setUIContent('<p>Hello world</p>', function (err) {
      if (err) {
        console.log("Something went wrong while setting view content", 'Reason: '+err.message);
      } else {
        console.log("View content set successfully");
      }
    });
  },

  stop: function () {
    clearInterval(this.id);
    this.id = null;
  },

  // define an output port called "sendText" (this will be bind later with a function to send your messages through it)
  // to prevent platform from exploding if there is no channel bind to output port, you should give an empty function
  // that does nothing, just keep away from troubles =)
  out_sendText: function () {},

  // print messages to std output when received from input port 'fake'
  in_fake: function (msg) {
    this.log.info("Message received: "+ msg);
  }
});

module.exports = HelloWorldComponent;