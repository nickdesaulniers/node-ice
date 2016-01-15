var dgram = require('dgram');
var RTCIceCandidate = require('./RTCIceCandidate');
var vsStun = require('vs-stun');

function addLocalHostCandidateP (streamId, componentId, inet) {
  return function (resolve, reject) {
    var candidate = new RTCIceCandidate({
      ip: inet.address,
      type: 'host',
      streamId: streamId,
      componentId: componentId,
    });
    var socket = createSocket(inet.family).bind(null, inet.address, function () {
      candidate.port = socket.address().port;
      candidate._socket = socket;
      resolve(candidate);
    });
  };
};

// this nonsense has to be async due to socket.bind
function addLocalHostCandidate (streamId, componentId, inet) {
  return new Promise(addLocalHostCandidateP(streamId, componentId, inet));
};

function addLocalSrflxCandidate (streamId, componentId, socket, iceServer) {
  return new Promise(function (resolve, reject) {
    iceServer.host = iceServer.ip;
    vsStun.resolve(socket, iceServer, function (error, value) {
      if (error) {
        return reject(error);
      }
      if (!('public' in value)) {
        // this case happens when a stun server is of the wrong family
        return resolve();
      }
      var candidate = new RTCIceCandidate({
        ip: value.public.host,
        port: value.public.port,
        type: 'srflx',
        relatedAddress: value.local.host,
        relatedPort: value.local.port,
        streamId: streamId,
        componentId: componentId,
        _socket: socket,
      });
      resolve(candidate);
    });
  });
};

function udpFamily (family) {
  if (family === 'IPv4') {
    return 'udp4';
  } else if (family === 'IPv6'){
    return 'udp6';
  } else {
    return '';
  }
};

function createSocket (inetFamily) {
  return dgram.createSocket(udpFamily(inetFamily));
};

module.exports = {
  addLocalHostCandidate: addLocalHostCandidate,
  addLocalSrflxCandidate: addLocalSrflxCandidate,
};

