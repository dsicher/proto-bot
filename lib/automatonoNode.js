'use strict'

class automatonoNode {
  constructor(pattern) {
    this.listenFor = pattern;
    this.respondWith = [];
    this.childConversationNodes = [];
    this.isDefault = false;
  }
}

module.exports = automatonoNode;
