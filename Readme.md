
# multipub

  Multi-redis pub/sub allowing you to publish and subscribe to and from N redis nodes.

## Installation

```
$ npm install multipub
```

## Example

 Launch some redis nodes:

```
$ redis-server --port 4000 &
$ redis-server --port 4001 &
$ redis-server --port 4002 &
```

 PUB/SUB:

```js
var multipub = require('multipub');

var client = multipub();

client.connect('localhost:4000');
client.connect('localhost:4001');
client.connect('localhost:4002');

client.subscribe('user:*');

client.on('message', function(channel, msg){
  console.log('%s - %s', channel, msg);
});

setInterval(function(){
  client.publish('user:login', { name: 'tobi' });
}, 50);

setInterval(function(){
  client.publish('user:login', { name: 'loki' });
}, 500);
```

## API

### multipub(options)

  Options are passed to node_redis's `.createClient()`.

```js
var multipub = require('multipub');
var client = multipub({
  options: 'here'
});
```

### Client#connect(addr)

 Add connection to `addr`, for example "0.0.0.0:4000".

### Client#subscribe(pattern)

 Subscribe to a channel or pattern, such as "user:login" or "user:*".

### Client#unsubscribe(pattern)

 Unsubscribe from a channel or pattern, must match _exactly_ what you
 passed to `.subscribe()`.

# License

  MIT