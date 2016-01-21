process.env['testing'] = true;
process.env['token'] = "matt";

var test = require('tape');
var ProtoBot = require('../proto_bot');
var testBot = new ProtoBot({ debug: false, log: false, port: 8083 });

test('sanity', t => {
  t.plan(2);
  t.ok(ProtoBot, 'ProtoBot class is available');
  var protoBot = new ProtoBot({port: 8081, log: false, debug: false});
  var expected = 'proto-bot';
  t.equals(protoBot.botName, expected, "default name set");
  protoBot.bot.closeRTM();
});

test('bot config obj overwrite defaults', t => {
  t.plan(2);
  var expectedName = 'matt';
  var expectedDebug = false;
  var mattBot = new ProtoBot({botName: expectedName, debug: expectedDebug, port: 8082, log: false});
  t.equals(mattBot.botName, expectedName, "botname overwrite");
  t.equals(mattBot.config.debug, expectedDebug, "debug overwrite");
  mattBot.bot.closeRTM();
});

test('triggers are added to help list during registration', t => {
  t.plan(2);
  var trigger_one = "trigger one",
      trigger_two = "trigger two";

  testBot.addUntaggedTrigger([trigger_one, trigger_two], (bot, message) => {
    // noop
    return null;
  });

  var testBotContainsTrigger = testBot.botTriggers.indexOf(trigger_one);
  t.ok(testBotContainsTrigger, 'triggers should be added to internal list');

  var testBotContainsTrigger = testBot.botTriggers.indexOf(trigger_two);
  t.ok(testBotContainsTrigger, 'triggers should be added to internal list');
});

test.onFinish(() => {
  testBot.bot.closeRTM();
  process.exit();
});
