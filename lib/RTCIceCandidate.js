var iceParse = require('wrtc-ice-cand-parse').parse;
var net = require('net');
var normalizeIPv6 = require('ipv6-normalize');

// https://tools.ietf.org/html/rfc5245#section-4.1.2.2
// https://w3c.github.io/webrtc-pc/#idl-def-RTCIceCandidateType
var typePrefs = {
  host: 126,
  srflx: 100,
  relay: 0,
};

var foundationCounter = 0;

function prioritize (typePref, localPref, componentId) {
  // https://tools.ietf.org/html/rfc5245#section-4.1.2.1
  return (Math.pow(2, 24) * typePref +
    Math.pow(2, 8) * localPref +
    256 - componentId) | 0;
};

function computePriority (type, addr, componentId) {
  // https://tools.ietf.org/html/rfc5245#section-2.3
  // https://tools.ietf.org/html/rfc5245#section-4.1.2
  // https://tools.ietf.org/html/rfc5245#section-4.1.2.2
  var typePref = typePrefs[type];
  var localPref = net.isIPv6(addr) ? 65535 : 0;
  return prioritize(typePref, localPref, componentId);
};

function RTCIceCandidate (dict) {
  // https://w3c.github.io/webrtc-pc/#rtcicecandidate-dictionary
  // members:
  //  candidate
  //  sdpMid
  //  sdpMLineIndex
  //  foundation
  //  priority
  //  ip
  //  protocol
  //  port
  //  type
  //  tcpType
  //  relatedAddress
  //  relatedPort

  Object.assign(this, dict);

  if (this.candidate) {
    var p = iceParse(this.candidate);
    this.foundation = +p.foundation;
    this.priority = +p.priority;
    this.ip = p.localIP;
    this.protocol = p.transport.toLowerCase();
    this.port = p.localPort;
    this.type = p.type;
    if (p.remoteIP && p.remotePort) {
      this.relatedAddress = p.remoteIP;
      this.relatedPort = p.remotePort;
    }
  }
  // TODO:
  // else generate candidate string

  if (net.isIPv6(this.ip)) {
    this.ip = normalizeIPv6(this.ip);
  }

  if (typeof this.port !== 'number') {
    this.port = +this.port;
  }

  if (!('componentId' in this)) {
    this.componentId = 0;
  }

  if (!('priority' in this)) {
    this.priority = computePriority(this.type, this.ip, this.componentId);
  }

  if (!('foundation' in this)) {
    // https://tools.ietf.org/html/rfc5245#section-4.2
    this.foundation = foundationCounter++;
  }

  this.protocol = this.protocol || 'udp';

  this._socket = null;
};

module.exports = RTCIceCandidate;

