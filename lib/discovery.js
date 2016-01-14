var dgram = require('dgram');
var RTCIceCandidate = require('./RTCIceCandidate');

function addLocalHostCandidateP (streamId, componentId, inet) {
  return function (resolve, reject) {
    var candidate = new RTCIceCandidate({
      ip: inet.address,
      type: 'host',
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
};

