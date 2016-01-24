'use strict'

class automatonoNode {
  constructor(listenFor) {
    this.listenFor = listenFor;
    this.respondWith = [];
    this.childConversationNodes = [];
    this.isDefault = false;
  }
}

module.exports = automatonoNode;