// This format is so stupid, we need to have a bunch of code to handle parsing.
// https://w3c.github.io/webrtc-pc/#dictionary-rtciceserver-members

function parseIceServers (agent, iceServers) {
  iceServers.forEach(function (iceServer) {
    var urls = typeof iceServer.urls === 'string' ? [iceServer.urls] : iceServer.urls;
    urls.forEach(function (url) {
      var split = url.split(':');
      if (split.length !== 3) {
        return;
      }
      var dict = {
        ip: split[1],
        port: split[2],
      };
      if (split[0] === 'stun' || split[0] === 'stuns') {
        agent.stunServers.push(dict);
      } else if (split[0] === 'turn' || split[0] === 'turns') {
        agent.turnServers.push(dict);
      }
    });
  });
};

module.exports = parseIceServers;

