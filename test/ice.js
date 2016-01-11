var IceAgent = require('../lib/ice');
var test = require('tape');

test('constructor should throw for missing ICE server list', function (t) {
  t.plan(1);

  t.throws(function () {
    var agent = new IceAgent;
  });
});
