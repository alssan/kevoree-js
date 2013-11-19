var AbstractComponent = require('kevoree-entities').AbstractComponent,
    view = require('./../generated-ui/view');


var FakeConsole = AbstractComponent.extend({
  toString: 'FakeConsole',

  start: function (_super) {
    _super.call(this);

    this.setUIContent(view({foo: 'potato'}), function (err, root) {
      if (err) {
        return this.log.warn(err.message);
      }

      // view set successfully
      var msgInput = root.querySelector('#msg'),
          sendBtn  = root.querySelector('#send');
      var sendMsg = function() {
        if (msgInput.value.length > 0) {
          // update message list
          this.addMessageUI('<', msgInput.value);
          // send it through output port 'sendMsg'
          this.out_sendMsg(msgInput.value);
        }
      }.bind(this);

      // send message on click event if value.length > 0
      sendBtn.onclick = sendMsg;

      // send message on 'enter' key keyup event if value.length > 0
      msgInput.onkeyup = function (e) {
        if (e && e.keyCode && e.keyCode == 13) {
          // 'enter' key pressed
          sendMsg();
        }
      };
    });
  },
  stop: function (_super) {
    _super.call(this);
  },

  in_inMsg: function (msg) {
    this.addMessageUI('>', msg);
  },

  out_sendMsg: function () {},

  addMessageUI: function(tag, msg) {
    var root = this.getUIRoot();
    if (root == null) {
      // TODO handle no UI version
      this.log.debug(this.toString(), tag+' '+msg);
    } else {
      var msgList = root.querySelector('#msg-list');
      msgList.innerHTML += '<li>'+tag+' '+msg+'</li>';
    }
  }
});

module.exports = FakeConsole;