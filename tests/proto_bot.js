process.env['testing'] = true;
process.env['token'] = "matt";

var test = require('tape');
var ProtoBot = require('../proto_bot');

test('sanity', t => {
  t.plan(2);
  t.ok(ProtoBot, 'ProtoBot class is available');
  var protoBot = new ProtoBot({spawn: false});
  var expected = 'proto-bot';
  t.equals(protoBot.botName, expected, "default name set");
});

test('bot config obj overwrite defaults', t => {
  t.plan(2);
  var expectedName = 'matt';
  var expectedDebug = false;
  var mattBot = new ProtoBot({botName: expectedName, debug: expectedDebug, spawn: false});
  t.equals(mattBot.botName, expectedName, "botname overwrite");
  t.equals(mattBot.config.debug, expectedDebug, "debug overwrite");
});
