
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter;
var debug = require('debug')('multipub:client');
var fwd = require('forward-events');
var assert = require('assert');
var Node = require('./node');

/**
 * Expose `Client`.
 */

module.exports = Client;

/**
 * Initialize a Client with the given `opts`.
 *
 * A muxpub Client consists of zero or more redis Nodes,
 * each Node may have a number of connections to that node.
 *
 * A noop "error" handler is attached so that reconnection
 * can be performed on errors without forcing the user to
 * add an "error" handler of their own, however one should
 * be used for logging.
 *
 * Options are passed to the redis.createClient() call.
 *
 * @param {Object} opts
 * @api public
 */

function Client(opts) {
  this.opts = opts || {};
  this.subscriptions = {};
  this.nodes = [];
  this.n = 0;
}

/**
 * Inherit from `Emitter.prototype`.
 */

Client.prototype.__proto__ = Emitter.prototype;

/**
 * Add connection to `addr`.
 *
 * @param {String} addr
 * @api public
 */

Client.prototype.connect = function(addr){
  debug('connect %s', addr);
  assert('string' == typeof addr, 'address string required');
  var node = new Node(addr, this.opts);
  fwd(node, this);
  this.watchState(node);
};

/**
 * Watch the state of `node` and remove it
 * from the .nodes set when it is not writable.
 *
 * @param {Node} node
 * @api private
 */

Client.prototype.watchState = function(node){
  var self = this;

  node.pub.on('ready', function(){
    debug('add %s', node.addr);
    self.nodes.push(node);
    self.ensureSubscriptions();
  });

  node.pub.on('end', function(){
    debug('remove %s', node.addr);
    var i = self.nodes.indexOf(node);
    self.nodes.splice(i, 1);
  });
};

/**
 * Subscribe to `pattern`.
 *
 * @param {String} pattern
 * @api public
 */

Client.prototype.subscribe = function(pattern){
  debug('subscribe %j', pattern)
  this.subscriptions[pattern] = true;
  this.ensureSubscriptions();
};


/**
 * Usubscribe from `pattern`.
 *
 * @param {String} pattern
 * @api public
 */

Client.prototype.unsubscribe = function(pattern){
  debug('unsubscribe %j', pattern);
  delete this.subscriptions[pattern];
  this.nodes.forEach(function(node){
    node.unsubscribe(pattern);
  });
};

/**
 * Ensure all nodes are subscribed to all
 * patterns that have been specified. This
 * is idempotent.
 *
 * @api private
 */

Client.prototype.ensureSubscriptions = function(){
  var patterns = Object.keys(this.subscriptions);
  this.nodes.forEach(function(node){
    patterns.forEach(function(pattern){
      node.subscribe(pattern);
    });
  });
};

/**
 * Publish `msg` on `channel` round-robin.
 *
 * @param {String} channel
 * @param {String|Object} msg
 * @api public
 */

Client.prototype.publish = function(channel, msg){
  if (msg && 'object' == typeof msg) {
    msg = JSON.stringify(msg);
  }

  var len = this.nodes.length;
  if (!len) return debug('no connections - message dropped');
  var i = this.n++ % len;
  var node = this.nodes[i];
  node.publish(channel, msg);
};
