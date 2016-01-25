'use strict';

var http = require('http');
var Botkit = require('botkit');
var AutomatonoAdapter = require('./lib/automatonoBotkitAdapter');
var Automatono = require('./lib/automatono');

require('dotenv').config({silent: true});

if (!process.env.token) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

class ProtoBot {
  constructor(config) {
    this.config = {
      spawn: true,
      debug: true,
      log: undefined
    };

    Object.assign(this.config, config);

    this.port = this.config.port || process.env.port || 8080;

    this.botName = this.config.botName || 'proto-bot';
    this.botTriggers = [];

    this.taggedMessage = 'direct_message,direct_mention,mention';
    this.untaggedMessage = 'direct_message,direct_mention,mention,ambient';

    this.botListener = Botkit.slackbot({
      debug: this.config.debug,
      log: this.config.log
    });

    this.botListener.on('tick', () => {});

    this.bot = this.botListener.spawn({
      token: process.env.token
    }).startRTM();

    this.botListener.setupWebserver(this.port, (err,express_webserver) => {
      this.botListener.createWebhookEndpoints(express_webserver);
    });

    this.automatonoAdapter = new AutomatonoAdapter({ bot: this.botListener });
    this.automatono = new Automatono({ adapter: this.automatonoAdapter, log: this.config.log });

    this.addUntaggedTrigger(['rise and shine$', 'roll call$', 'role call$'], this.rollCall.bind(this));
    this.addTaggedTrigger(['help'], this.listFunctions.bind(this));

    this.noDoze();
  }

  hears(listenFor) {
    return this.automatono.startConversation(listenFor);
  }

  listenFor(listener, isHidden) {
    this.listeningFor = {
      tagged: this.taggedMessage,
      listeners: listener,
      isHidden: isHidden || false
    };
    return this;
  }

  andReplyWith(string) {
    if (!this.listeningFor.isHidden) { this.addTriggers(this.listeningFor.listeners); }
    this.botListener.hears(this.listeningFor.listeners, this.listeningFor.tagged, (bot, message) => {
      bot.reply(message, string);
    });
    this.listeningFor = null;
    return this;
  }

  addTriggers(trigger) {
    if(Array.isArray(trigger)) {
      trigger.forEach((el)=>{this.addTriggers(el);});
    } else if(typeof(trigger)=='string'){
      this.botTriggers.push(trigger);
    } else {
      console.log('error: ' + trigger + ' could not be added to the list of triggers');
    }
  }

  addTaggedTrigger(listenFor, action, isHidden) {
    isHidden = isHidden || false;
    if(Array.isArray(listenFor) && typeof action==='function') {
      if (!isHidden) {
        this.addTriggers(listenFor);
      }
      this.botListener.hears(listenFor, this.taggedMessage, action)
    } else {
      console.log('error: tagged trigger could not be added');
    }
  }

  addUntaggedTrigger(listenFor, action, isHidden) {
    isHidden = isHidden || false;
    if(Array.isArray(listenFor) && typeof action==='function') {
      if (!isHidden) {
        this.addTriggers(listenFor);
      }
      this.botListener.hears(listenFor, this.untaggedMessage, action)
    } else {
      console.log('error: untagged trigger could not be added');
    }
  }

  rollCall(bot, incomingMessage) {
    bot.reply(incomingMessage, this.rollCallResponse());
  }

  rollCallResponse() {
    return 'proto-bot is alive';
  }

  listFunctions(bot, incomingMessage) {
    bot.reply(incomingMessage, 'I respond to the following commands: `' + this.botTriggers.join("`, `") + '`');
  }

  keepAliveFunc() {
    http.get(process.env.KEEPALIVE_URL, (res) => {
      this.botListener.log(`Keep alive response: ${res.statusCode}`);
    }).on('error', (e) => {
      this.botListener.log(`Got error: ${e.message}`);
    });
  }

  noDoze() {
    if (this.keepAliveIntervalId === undefined) {
      this.keepAliveFunc();
      this.keepAliveIntervalId = setInterval(() => {
        var date = new Date();
        console.log(`Current hour of the day is: ${date.getHours()}`);
        if (date.getHours() > 22) {
          this.botListener.log('***********************')
          this.botListener.log('Letting go, sleepy time');
          this.botListener.log('***********************')
          clearInterval(keepAliveIntervalId)
        } else {
          this.keepAliveFunc();
        };
      }, 300000)
    }
  };

}

module.exports = ProtoBot;
