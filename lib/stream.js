var Component = require('./component');
var iceCredentials = require('./ice-ufrag-pwd');

function Stream (streamId, numComponents, agent) {
  this.components = [];
  this.agent = agent;
  this.id = streamId;
  this.localUsername = '';
  this.localPassword = '';
  this.remoteUsername = '';
  this.remotePassword = '';

  for (var i = 0; i < numComponents; ++i) {
    this.components.push(new Component(i + 1, agent, this));
  }

  this.generateCredentials();
};

Stream.prototype.generateCredentials = function () {
  this.localUsername = iceCredentials.ufrag();
  this.localPassword = iceCredentials.password();
};

Stream.prototype.getNumComponents = function () {
  return this.components.length();
};

module.exports = Stream;
