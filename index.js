/*-----------------------------------------------------------------------------------------------------------
//
//                                        SIMPLE PROTO CONFIGS
//
//---------------------------------------------------------------------------------------------------------*/

var botName = 'proto-bot';
var botTriggers = [];

/*-----------------------------------------------------------------------------------------------------------
//
//                                        Proto-bot Boilerplate
//
//---------------------------------------------------------------------------------------------------------*/

var http = require('http');
var Botkit = require('botkit');

require('dotenv').load();

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var keepAliveFunc = function() {
  http.get(process.env.KEEPALIVE_URL, function(res) {
    console.log(`Keep alive response: ${res.statusCode}`);
  }).on('error', function(e) {
    console.log(`Got error: ${e.message}`);
  });
}

var noDoze = function() {
  if (keepAliveIntervalId === undefined) {
    keepAliveFunc();
    var keepAliveIntervalId = setInterval(function() {
      var date = new Date();
      console.log(`Current hour of the day is: ${date.getHours()}`);
      if (date.getHours() > 22) {
        console.log('***********************')
        console.log('Letting go, sleepy time');
        console.log('***********************')
        clearInterval(keepAliveIntervalId)
      } else {
        keepAliveFunc();
      };
    }, 300000)
  }
};

var protoBot = function(config) {
  var defaults =  {
    botName: 'proto-bot',
    debug: true
  };

  this.config = Object.assign({}, defaults, config);
  this.botName = this.config.botName;
  this.botTriggers = [];

  this.taggedMessage = 'direct_message,direct_mention,mention';
  this.untaggedMessage = 'direct_message,direct_mention,mention,ambient';

  noDoze();

  this.botListener = Botkit.slackbot({
    debug: this.config.debug,
  });

  this.bot = this.botListener.spawn({
    token: process.env.token
  }).startRTM();

  this.botListener.setupWebserver(process.env.PORT,function(err,express_webserver) {
    this.botListener.createWebhookEndpoints(express_webserver);
  }.bind(this));

  this.addUntaggedTrigger(['rise and shine', 'roll call$', 'role call$'], this.rollCall.bind(this));
  this.addTaggedTrigger(['help'], this.listFunctions.bind(this));
}

protoBot.prototype.addTriggers = function(trigger) {
  if(Array.isArray(trigger)) {
    trigger.forEach(function(el){this.addTriggers(el);}.bind(this));
  } else if(typeof(trigger)=='string'){
    this.botTriggers.push(trigger);
  } else {
    console.log('error: ' + trigger + ' could not be added to the list of triggers');
  }
}

protoBot.prototype.addTaggedTrigger = function(listenFor, action) {
  if(Array.isArray(listenFor) && typeof action==='function') {
    this.addTriggers(listenFor);
    this.botListener.hears(listenFor, this.taggedMessage, action)
  } else {
    console.log('error: tagged trigger could not be added');
  }
}

protoBot.prototype.addUntaggedTrigger = function(listenFor, action) {
  if(Array.isArray(listenFor) && typeof action==='function') {
    this.addTriggers(listenFor);
    this.botListener.hears(listenFor, this.untaggedMessage, action)
  } else {
    console.log('error: untagged trigger could not be added');
  }
}


protoBot.prototype.rollCall = function(bot, incomingMessage) {
  bot.reply(incomingMessage, this.rollCallResponse());
}

protoBot.prototype.rollCallResponse = function() {
  return 'proto-bot is alive';
}

protoBot.prototype.listFunctions = function(bot, incomingMessage) {
  bot.reply(incomingMessage, 'I respond to the following commands: `' + this.botTriggers.join("`, `") + '`');
}

module.exports = protoBot;
