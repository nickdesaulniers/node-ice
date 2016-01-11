# Node-ICE
An implementation of Interactive Connectivity Establishment (ICE, RFC 5245) for
Node.js.

## Why is ICE useful?
ICE solves the problem of establishing a UDP based connection between two peers
potentially behind NATs without them having to muck around with their router's
port forwarding settings.  Without ICE, it's *highly likely* for UDP
connections given between two random peers to fail.

## Implementation Details
For those of you who have read the spec(s).  This is a full implementation (not
a lite implementation), with full trickle (as opposed to half trickle), and
aggressive nomination (as opposed to regular nomination).

## What's Missing
* TURN candidate support
* Peer Reflexive candidate support

## API
...

## Relevant Specs
* [RFC 5245 - ICE (Interactive Connectivity Establishment)](https://tools.ietf.org/html/rfc5245)
* [RFC 5389 - STUN (Session Traversal Utilities for NAT)](https://tools.ietf.org/html/rfc5389)
* [RFC 5766 - TURN (Traversal Using Relays around NAT)](https://tools.ietf.org/html/rfc5766)
* [RFC 7064 - STUN URI Scheme](https://tools.ietf.org/html/rfc7064)
* [DRAFT ICE-BIS - ICE (Interactive Connectivity Establishment)](https://tools.ietf.org/html/draft-ietf-ice-rfc5245bis-00)
* [DRAFT ICE-Trickle - Incremental Provisioning for ICE](https://tools.ietf.org/html/draft-ietf-ice-trickle-01)

