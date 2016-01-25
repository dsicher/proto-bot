'use strict'

var automatonoNode = require('./automatonoNode');
var automatonoResponse = require('./automatonoResponse');

class Automatono {
  constructor(config) {
    this.config = {
      log: undefined,
      debug: true
    };
    Object.assign(this.config, config);
    this.resetConversation();
  }

  resetConversation() {
    this.conversation = null;
    this.currentNodeStack = [];
    this.lastInputType = "none";
    this.currentDepth = "";
  }

  log(msg) {
    if (this.config.log) {
      console.log(msg);
    }
  }

  err(msg) {
    if (this.lastInputType != "error") {
      if (this.config.debug) {
        console.log('**************************************');
        console.log('Automatono Error:');
        console.log(msg);
        console.log('**************************************');
      }
    }
    this.lastInputType = "error";
  }

  logDepth(isIncrement, msg) {
    if (isIncrement) {
      this.currentDepth += "-+-";
    }
    this.log(`${this.currentDepth} ${msg}`);
    if (!isIncrement) {
      this.currentDepth = this.currentDepth.slice(0, -3);
    }
  }

  startConversation(listenFor) {
    if(this.lastInputType==="none") {
      this.lastInputType = "hears";
      var newNode = new automatonoNode(listenFor);
      this.conversation = newNode;
      this.currentNodeStack.push(newNode);
      this.log('--------------------------------------');
      this.log('Starting Conversation...');
      this.logDepth(true, `Creating branch: ${listenFor}`);
      return this;
    }
    this.err('startConversation must initiate a new conversation');
  }

  hears(listenFor) {
    if (this.lastInputType==="asks"||this.lastInputType==="defaultsTo"||this.lastInputType==="end") {
      this.logDepth(true, `Creating Branch: ${listenFor}`);
      this.lastInputType = "hears";
      var newNode = new automatonoNode(listenFor);
      this.currentNodeStack[this.currentNodeStack.length-1].childConversationNodes.push(newNode);
      this.currentNodeStack.push(newNode);
      return this;
    }
    this.err('hears must follow asks, default, or end');
  }

  says(respondWith) {
    if(this.lastInputType==="hears"||this.lastInputType==="says") {
      this.lastInputType = "says";
      this.currentNodeStack[this.currentNodeStack.length-1].respondWith.push(new automatonoResponse("says", respondWith));
      return this;
    }
    this.err('says must follow hears or says');
  }

  asks(respondWith) {
    if(this.lastInputType==="hears"||this.lastInputType==="says") {
      this.lastInputType = "asks";
      this.currentNodeStack[this.currentNodeStack.length-1].respondWith.push(new automatonoResponse("asks", respondWith));
      return this;
    }
    this.err('asks must follow hears or says');
  }

  defaultsTo(respondWith) {
    if (this.lastInputType==="end" || this.lastInputType==="defaultsTo" && this.currentNodeStack[this.currentNodeStack.length-1].respondWith[this.currentNodeStack[this.currentNodeStack.length-1].respondWith.length-1].type === 'asks') {
      this.logDepth(false, `Closing Branch: ${this.currentNodeStack[this.currentNodeStack.length-1].listenFor}`);
      this.lastInputType = "defaultsTo";
      var newNode = new automatonoNode();
      this.currentNodeStack[this.currentNodeStack.length-1].childConversationNodes.push(newNode);
      this.currentNodeStack.pop();
      newNode.isDefault = true;
      newNode.respondWith.push(new automatonoResponse("says", respondWith, true));
      return this;
    }
    this.err('defaultsTo must follow end or defaultsTo');
  }

  end() {
    if (this.currentNodeStack.length>0) {
      this.logDepth(false, `Closing Branch: ${this.currentNodeStack[this.currentNodeStack.length-1].listenFor}`);
    } else {
      this.log('Closing and Processing Conversation...');
      this.log('======================================');
    }
    if((this.lastInputType === "end" || this.lastInputType === "defaultsTo") && this.currentNodeStack.length === 0) {
      this.processConversation(this.conversation);
      this.resetConversation();
      return;
    } else if (this.lastInputType === "says") {
      this.currentNodeStack[this.currentNodeStack.length-1].respondWith[this.currentNodeStack[this.currentNodeStack.length-1].respondWith.length-1].isLeaf = true;
      this.lastInputType = "end";
      this.currentNodeStack.pop();
      return this;
    } else if (this.lastInputType === "end" || this.lastInputType === "defaultsTo") {
      this.lastInputType = "end";
      this.currentNodeStack.pop();
      return this;
    }
    this.err('To close a branch with end, it must follow says, end, or defaultsTo. To close a conversation with end, end must follow an end or defaultsTo, and all branches must be closed.');
  }
}

module.exports = Automatono;
