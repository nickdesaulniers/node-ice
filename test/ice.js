var IceAgent = require('../lib/ice');
var RTCIceCandidate = require('../lib/RTCIceCandidate');
var test = require('tape');

var iceServers = [
  {
    urls: 'stun:stun.l.google.com:19302',
  }
];

test('constructor should throw for missing ICE server list', function (t) {
  t.plan(1);

  t.throws(function () {
    var agent = new IceAgent;
  });
});

test('gatherHostCandidates', function (t) {
  t.plan(1);

  var agent = new IceAgent({
    iceServers: iceServers,
  });
  agent.gatherHostCandidates().then(function (candidates) {
    candidates.filter(function (candidate) {
      return candidate instanceof RTCIceCandidate;
    });
    agent.shutdown();
    t.ok(candidates.length > 0, 'had some host candidates');
  }).catch(function (e) {
    agent.shutdown();
    t.fail(e);
  });
});

