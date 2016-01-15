var discovery = require('./discovery');
var Enum = require('enum');
var EventEmitter = require('events');
var findOrCreateLocalAddresses = require('./localAddresses');
var parseIceServers = require('./parseIceServerList');
var Stream = require('./stream'); // TODO: maybe rename this to IceStream?
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

  this.stunServers = [];
  this.turnServers = [];

  // TODO: this should be per stream
  this.pendingGathers = 0;

  parseIceServers(this, config.iceServers);
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
  transitionGatherState(this, gatheringStates.Gathering);
  var stream = findStream(this, streamId);
  var addresses = findOrCreateLocalAddresses(this);
  var onError = this.emit.bind(this, 'error');
  calculatePendingGathers(this, addresses.length, stream.components.length,
    this.stunServers.length, this.turnServers.length);
  addresses.forEach((address) => {
    stream.components.forEach((component) => {
      var p = discovery.addLocalHostCandidate(streamId, component.componentId,
        address);
      p.then((candidate) => {
        this.emit('icecandidate', candidate);
        checkDoneGathering(this);
        return this.gatherSrflxCandidate(candidate);
      });
      p.catch(onError);
    });
  });
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
IceAgent.prototype.getGatheringState = function () {
  return this.gatheringState.key;
};
IceAgent.prototype.getConnectionState = function () {
  return this.connectionState.key;
};

IceAgent.prototype.gatherSrflxCandidate = function (hostCandidate) {
  var onError = this.emit.bind(this, 'error');
  this.stunServers.forEach((server) => {
    var p = discovery.addLocalSrflxCandidate(hostCandidate.streamId,
      hostCandidate.componentId, hostCandidate._socket, server);
    p.then((candidate) => {
      if (candidate) {
        this.emit('icecandidate', candidate);
      }
      checkDoneGathering(this);
    });
    p.catch(onError);
  });
};

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

function transitionGatherState (agent, nextState) {
  agent.gatheringState = nextState;
  agent.emit('icegatheringstatechange');
};

function calculatePendingGathers (agent, numAddresses, numComponents, numStunServers, numTurnServers) {
  var numHostCandidates = numAddresses * numComponents;
  var numStunCandidates = numHostCandidates * numStunServers;
  var numTurnCandidates = numHostCandidates * numTurnServers;
  agent.pendingGathers = numHostCandidates + numStunCandidates + numTurnCandidates;
};

function checkDoneGathering (agent) {
  if (--agent.pendingGathers === 0) {
    transitionGatherState(agent, gatheringStates.Complete);
  }
};

module.exports = IceAgent;

