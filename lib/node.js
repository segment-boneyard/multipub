
/**
 * Module dependencies.
 */

var Emitter = require('events').EventEmitter;
var debug = require('debug')('multipub:node');
var fwd = require('forward-events');
var parse = require('url').parse;
var redis = require('redis');

/**
 * Expose `Node`.
 */

module.exports = Node;

/**
 * Initialize a redis node with the given `opts`.
 *
 * A muxpub Node may have zero or more connections to
 * the redis instance. Options passed here are passed to
 * redis.createClient().
 *
 * @param {String} addr
 * @param {Object} [opts]
 * @api public
 */

function Node(addr, opts) {
  this.url = parse('tcp://' + addr);
  this.addr = addr;
  this.opts = opts || {};
  this.subscriptions = {};
  this.pub = this.client();
  this.sub = this.client();
}

/**
 * Inherit from `Emitter.prototype`.
 */

Node.prototype.__proto__ = Emitter.prototype;

/**
 * Return a connection to the redis node.
 *
 * @return {RedisClient}
 * @api private
 */

Node.prototype.connection = function(){
  var host = this.url.hostname;
  var port = this.url.port;
  var opts = this.opts;
  return redis.createClient(port, host, opts);
};

/**
 * Return a connection and handle:
 *
 * - message forwarding
 * - pmessage -> message normalization
 *
 * @return {RedisClient}
 * @api private
 */

Node.prototype.client = function(){
  var conn = this.connection();
  var self = this;

  fwd(conn, this);

  conn.on('pmessage', function(pattern, channel, msg){
    self.emit('message', channel, msg, pattern);
  });

  return conn;
};

/**
 * Publish `msg` to `channel`.
 *
 * @param {String} channel
 * @param {String} msg
 * @api private
 */

Node.prototype.publish = function(channel, msg){
  debug('%s - publish %s %j', this.addr, channel, msg);
  this.pub.publish(channel, msg);
};

/**
 * Subscribe to `pattern` unless already subscribed.
 *
 * @param {String} pattern
 * @api private
 */

Node.prototype.subscribe = function(pattern){
  if (this.subscriptions[pattern]) return;
  this.subscriptions[pattern] = true;
  debug('%s - subscribe %j', this.addr, pattern);

  if (~pattern.indexOf('*')) {
    this.sub.psubscribe(pattern);
  } else {
    this.sub.subscribe(pattern);
  }
};

/**
 * Unsubscribe from `pattern`.
 *
 * @param {String} pattern
 * @api private
 */

Node.prototype.unsubscribe = function(pattern){
  debug('%s - unsubscribe %j', this.addr, pattern);
  if (~pattern.indexOf('*')) {
    this.sub.punsubscribe(pattern);
  } else {
    this.sub.unsubscribe(pattern);
  }
};
