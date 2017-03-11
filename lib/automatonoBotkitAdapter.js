'use strict'

var bot = null;

class AutomatonoBotkitAdapter {
  constructor(config) {
    this.config = {
      bot: undefined
    };
    Object.assign(this.config, config);
    bot = this.config.bot;
  }

  processConversation(conversationNode) {
    var processNode = (conversationNode) => {
      return (erresp, convo) => {
        conversationNode.respondWith.forEach((el, i, arr) => {
          if (el.type === "says") {
            console.log(el.content);
            if (typeof el.content === "function") {
              convo.say(el.content(convo.source_message));
            } else {
              convo.say(el.content);
            }
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
    bot.hears(conversationNode.listenFor,
              ['direct_message','direct_mention','mention'],
              (bot, incomingMessage) => {
                bot.startConversation(incomingMessage, processNode(conversationNode));
              });
  }
}

module.exports = AutomatonoBotkitAdapter;
