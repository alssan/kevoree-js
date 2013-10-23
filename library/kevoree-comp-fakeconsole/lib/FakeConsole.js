// if you have already created your own Component extending AbstractComponent
// you can replace AbstractComponent here and use your own
// ex: var MyComp = require('./path/to/MyComp')
// the only thing needed is that the top level component extends AbstractComponent :)
var AbstractComponent = require('kevoree-entities').AbstractComponent;

var BTN_ID   = 'send-msg-btn',
    INPUT_ID = 'send-msg-input';

/**
 * Kevoree component
 * @type {FakeConsole}
 */
var FakeConsole = AbstractComponent.extend({
  toString: 'FakeConsole',

  construct: function () {
    this.messages = [];
  },

  /**
   * this method will be called by the Kevoree platform when your component has to start
   */
  start: function (_super) {
    _super.call(this);

    this.setUIContent(this.generateHTML(), function (err) {
      if (!err) this.registerDOMListeners();
    });
  },

  /**
   * this method will be called by the Kevoree platform when your component has to stop
   */
  stop: function () {
    // TODO
  },

  in_inMsg: function (msg) {
    this.messages.push('> '+msg);
    this.updateMessageList();
  },

  out_sendMsg: function () {},

  updateMessageList: function () {
    this.setUIContent(this.generateHTML(), function (err) {
      if (err) {
        // Something went wrong while setting view content - which means that we are certainly running on the
        // console-based platform: fall back to KevoreeLogger then
        this.log.info(this.toString(), '========== FakeConsole ==========');
        for (var i in this.messages) {
          this.log.info(this.toString(), this.messages[i]);
        }

      } else {
        this.registerDOMListeners();
      }
    });
  },

  generateHTML: function () {
    var html = '<div>' +
      '<input id="'+INPUT_ID+'" type="text" placeholder="Say something :)"/>' +
      '<button id="'+BTN_ID+'">Send</button>' +
      '</div>';

    if (this.messages.length > 0) {
      html += '<ul>';
      for (var i in this.messages) {
        html += '<li>'+this.messages[i]+'</li>';
      }
      html += '</ul>';
    }

    return html;
  },

  registerDOMListeners: function () {
    var sendBtn    = this.getUIRoot().querySelector('#'+BTN_ID),
        inputField = this.getUIRoot().querySelector('#'+INPUT_ID);

    var sendMsg = function() {
      if (inputField.value.length > 0) {
        // add message to our message list
        this.messages.push('< '+inputField.value);
        // update message list
        this.updateMessageList();
        // send it through output port 'sendMsg'
        this.out_sendMsg(inputField.value);
      }
    }.bind(this);

    // send message on click event if value.length > 0
    sendBtn.onclick = sendMsg;

    // send message on 'enter' key keyup event if value.length > 0
    inputField.onkeyup = function (e) {
      if (e && e.keyCode && e.keyCode == 13) {
        // 'enter' key pressed
        sendMsg();
      }
    };
  }
});

module.exports = FakeConsole;
