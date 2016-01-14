var IceAgent = require('../lib/ice2.js');

var agent = new IceAgent({
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    }
  ],
});

agent.on('icecandidate', function (candidate) {
  console.log('ice candidate', candidate);
});

agent.on('icecandidateerror', function (e) {
  console.error('ice candidate error', e);
});

agent.on('iceconnectionstatechange', function (e) {
  console.log('connection state change', agent.getConnectionState());
});

agent.on('icegatheringstatechange', function (e) {
  console.log('gathering state change', agent.getGatheringState());
  // if state === done
  // get local candidates
  // get local credentials
  // send to peer
});

agent.on('error', function (e) {
  console.error('error', e);
});

var streamId = agent.addStream(1);
agent.gatherCandidates(streamId);
console.log(agent);

