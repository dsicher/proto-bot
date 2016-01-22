### Proto Bot

This project's focus is to create on natural language DSL for Botkit's Slack
chat bot framework.

Examples:

    // include the lib
    var protobot = require('proto-bot');

    // instantiate a bot and give it a name
    var demobot = new protobot({
      botName: 'demo-bot', // ENTER YOUR BOT NAME HERE
    });

    // register triggers and actions
    demobot.listenFor("hey demobot").andReplyWith("well hello there... user");
