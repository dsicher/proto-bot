'use strict'

class AutomatonoResponse {
  constructor(type, respondWith, isRepeat) {
    isRepeat = isRepeat || false
    this.type = type;
    this.content = respondWith;
    this.isRepeat = isRepeat;
    this.isLeaf = false;
  }
}

module.exports = AutomatonoResponse;