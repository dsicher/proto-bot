/*-----------------------------------------------------------------------------------------------------------
//
//                                        SIMPLE PROTO CONFIGS
//
//---------------------------------------------------------------------------------------------------------*/

var botName = 'proto-bot';
var botTriggers = ['help',
                   'roll call',
                   'role call'
                  ];

/*-----------------------------------------------------------------------------------------------------------
//
//                                        Proto-bot Boilerplate
//
//---------------------------------------------------------------------------------------------------------*/

var http = require('http');
var Botkit = require('botkit');
var os = require('os');

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
}();

var botListener = Botkit.slackbot({
    debug: true,
});

var bot = botListener.spawn({
    token: process.env.token
}).startRTM();

botListener.setupWebserver(process.env.PORT,function(err,express_webserver) {
  botListener.createWebhookEndpoints(express_webserver);
});

var taggedMessage = 'direct_message,direct_mention,mention';
var untaggedMessage = 'direct_message,direct_mention,mention,ambient';

function listFunctions(bot, incomingMessage) {
  bot.reply(incomingMessage, 'I respond to the following commands: `' + botTriggers.join("`, `") + '`');
}
botListener.hears(['help'], untaggedMessage, listFunctions);

function rollCall(bot, incomingMessage) {
  bot.reply(incomingMessage, botName + ' present');
}
botListener.hears(['roll call','role call'], untaggedMessage, rollCall);

/*-----------------------------------------------------------------------------------------------------------
//
//                                         !BOILER-PLATE OVER!
//                                           INSERT BOT HERE
//
//                                            | | | | | | |
//                                            V V V V V V V
//
//---------------------------------------------------------------------------------------------------------*/
