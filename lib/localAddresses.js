var forEachInet = require('forEachInet');

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

module.exports = findOrCreateLocalAddresses;

