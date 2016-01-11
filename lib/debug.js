var chalk = require('chalk');
var Packet = require('vs-stun/lib/Packet');

//var leftArrow = '\u2190';
//var rightArrow = '\u2192';

function printDebugPacket (p, rinfo) {
  var type = Packet.getType(p);
  var str = '';
  if (type === Packet.BINDING_SUCCESS) {
    str += chalk.green('[STUN] BINDING SUCCESS ');
  } else if (type === Packet.BINDING_REQUEST) {
    //console.log();
    str += chalk.yellow('[STUN] BINDING REQUEST ');
    //p.doc.attributes.forEach(function (attr) {
      //console.log(attr.name, attr.value.obj);
    //});
  } else {
    console.log();
    console.log(Packet.typeToString(p));
    p.doc.attributes.forEach(function (attr) {
      console.log(attr.name, attr.value.obj);
    });
  }
  str += chalk.blue(rinfo.address) + ':' + chalk.magenta(rinfo.port);
  console.log(str);
};

function printMatches (a, b) {
  console.log(chalk[a === b ? 'green' : 'red'](a + ' === ' + b));
  //console.log(typeof a, typeof b)
};

function printPeerReflexive (source, dest, candidatePair) {
  console.log('---');
  console.warn('Found a peer reflexive candidate')
  printMatches(source.address, candidatePair.remote.ip);
  printMatches(source.port, candidatePair.remote.port);
  printMatches(dest.host, candidatePair.local.ip);
  printMatches(dest.port, candidatePair.local.port);
  console.log('---');
};

function formatAddrPort (obj) {
  return chalk.blue(obj.ip) + ':' + chalk.magenta(obj.port);
};

function printPairs (pairList) {
  console.warn('valid list:')
  console.warn('local -> remote');
  pairList.forEach(function (pair) {
    console.warn(formatAddrPort(pair.local) + ' -> ' + formatAddrPort(pair.remote));
  });
  console.warn('---');
};

function warnNonStunPacket (info, rinfo) {
  console.warn('not a stun packet');
  console.warn(info.address + ':' + info.port + ' -> ' + rinfo.address + ':' +
    rinfo.port);
};

function iceLocalHostCandidate (candidate) {
  console.warn(chalk.cyan('[ICE] LOCAL HOST CANDIDATE ') +
    formatAddrPort(candidate));
};

function iceLocalSrflxCandidate (candidate) {
  console.warn(chalk.cyan('[ICE] LOCAL SRFLX CANDIDATE ') +
    formatAddrPort(candidate));
};

function iceRemoteCandidate (candidate) {
  console.warn(chalk.cyan('[ICE] REMOTE ' + candidate.type.toUpperCase() +
    ' CANDIDATE ') + formatAddrPort(candidate));
};

module.exports = {
  iceLocalHostCandidate: iceLocalHostCandidate,
  iceLocalSrflxCandidate: iceLocalSrflxCandidate,
  iceRemoteCandidate: iceRemoteCandidate,
  printDebugPacket: printDebugPacket,
  printPeerReflexive: printPeerReflexive,
  printPairs: printPairs,
  warnNonStunPacket: warnNonStunPacket,
};

