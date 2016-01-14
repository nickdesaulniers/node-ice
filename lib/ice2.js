var Enum = require('enum');
var EventEmitter = require('events');
var forEachInet = require('forEachInet');
var Stream = require('./stream');
var util = require('util');

// https://w3c.github.io/webrtc-pc/#rtcicegatheringstate-enum
var gatheringStates = new Enum([
  'New',
  'Gathering',
  'Complete'
]);

// https://w3c.github.io/webrtc-pc/#rtciceconnectionstate-enum
var connectionStates = new Enum([
  'New',
  'Checking',
  'Connected',
  'Completed',
  'Failed',
  'Disconnected',
  'Closed'
]);

function IceAgent (config) {
  EventEmitter.call(this);

  // streams are objects that have their own list of components
  this.streams = [];
  this.nextStreamId = 0;

  this.localAddresses = [];

  this.iceControlling = false;
  this.Ta = 20; // ms

  this.gatheringState = gatheringStates.New;
  this.connectionState = connectionStates.New;

  this.config = config;
};
util.inherits(IceAgent, EventEmitter);

// APIs analagous to libnice
//IceAgent.prototype.addLocalAddress = function (addr) {};
IceAgent.prototype.addStream = function (numComponents) {
  var stream = new Stream(this.nextStreamId++, numComponents, this);
  this.streams.push(stream);
  return stream.id;
};

//IceAgent.prototype.removeStream = function (streamId) {};
//IceAgent.prototype.setPortRange = function () {};
IceAgent.prototype.gatherCandidates = function (streamId) {
  // find our stream
  var stream = findStream(this, streamId);
  // gather local addresses if we don't already have them
  var addresses = findOrCreateLocalAddresses(this);
  // for each address, create a local host candidate
  addresses.forEach(function (address) {
    stream.components.forEach(function (component) {
      // create a new candidate, who owns the socket
      var socket = createSocket(address.family);
    });
  });
  // for each component create a socket
  // add a stun server per socket?
  // create a candidate
  // emit new candidate event
};
IceAgent.prototype.setRemoteCredentials = function (ufrag, pwd) {};
IceAgent.prototype.setLocalCredentials = function (ufrag, pwd) {};
IceAgent.prototype.getLocalCredentials = function () {};
IceAgent.prototype.setRemoteCandidates = function (streamId, componentId, candidates) {};
IceAgent.prototype.getLocalCandidates = function (streamId, componentId) {};
IceAgent.prototype.getRemoteCandidates = function (streamId, componentId) {};
//IceAgent.prototype.restart = function () {};
//IceAgent.prototype.restartStream = function (streamId) {};
//IceAgent.prototype.setSelectedPair = function (streamId, componentId, lFoundation, rFoundation) {};
//IceAgent.prototype.getSelectedPair = function (streamId, componentId) {};
IceAgent.prototype.getSelectedSocket = function (streamId, componentId) {};
//IceAgent.prototype.setSelectedRemoteCandidate = function (streamId, componentId, candidate) {};

// APIs added by me.
IceAgent.prototype.getGatheringStates = function () {};
IceAgent.prototype.getConnectionState = function () {};
IceAgent.prototype.gatherHostCandidates = function () {};
IceAgent.prototype.gatherSrflxCandidates = function () {};
IceAgent.prototype.gatherRelayCandidates = function () {};

// private helper functions
function findStream (agent, streamId) {
  for (var i = 0, len = agent.streams.length; i < len; ++i) {
    var stream = agent.streams[i];
    if (stream.id === streamId) {
      return stream;
    }
  }
  // This will happen if you call findStream without calling agent.addStream
  // first.
  agent.emit('error', 'unable for ICE agent to find a stream with id: ' +
    streamId);
};

function findOrCreateLocalAddresses (agent) {
  if (agent.localAddresses.length < 1) {
    forEachInet(addNonLinkLocalOrInternalAddresses(agent));
  }
  return agent.localAddresses;
};

function addNonLinkLocalOrInternalAddresses (agent) {
  return function (inet) {
    if (!inet.internal && !isLinkLocalAddress(inet)){
      agent.localAddresses.push(inet);
    }
  };
};

function isLinkLocalAddress (inet) {
  // TODO: handle ipv4 link local addresses
  return inet.family === 'IPv6' && inet.address.startsWith('fe80::');
};

function udpFamily (inet) {
  var family = net.isIp(inet);
  if (family === 'IPv4') {
    return 'udp4';
  } else if (family === 'IPv6'){
    return 'udp6';
  } else {
    // not sure how this would ever be possible unless we were passed something
    // that wasn't an inet.
    throw new Error('network interface has an unknown IP family');
  }
};

function createSocket (inetFamily) {
  var socket = dgram.createSocket(udpFamily(inetFamily));
  return socket;
};

module.exports = IceAgent;

