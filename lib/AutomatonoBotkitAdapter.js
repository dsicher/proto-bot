'use strict'

var Automatono = require('./automatono');

class AutomatonoBotkitAdapter extends Automatono {
  constructor(config) {
    super(config)
    this.bot = config.bot;
  }

  processConversation(conversationNode) {
    var processNode = (conversationNode) => {
      return (erresp, convo) => {
        conversationNode.respondWith.forEach((el, i, arr) => {
          if (el.type === "says") {
            convo.say(el.content);
            if (el.isLeaf) {
              convo.next();
            }
            if (el.isRepeat) {
              convo.repeat();
              convo.next();
            }
          } else if (el.type === "asks") {
            convo.ask(el.content, processBranches(conversationNode.childConversationNodes));
            convo.next();
          }
        })
      }
    };

    var processBranches = (conversationNodeArray) => {
      var returnArray = [];
      conversationNodeArray.forEach((el, i, arr)=>{
        returnArray.push({default: el.isDefault,
                          pattern: el.listenFor,
                          callback: processNode(el)});
      });
      return returnArray;
    };

    this.bot.hears(conversationNode.listenFor,
                   'direct_message,direct_mention,mention',
                   (bot, incomingMessage) => {
                     bot.startConversation(incomingMessage, processNode(conversationNode));
                   });
  }
}

module.exports = AutomatonoBotkitAdapter;
