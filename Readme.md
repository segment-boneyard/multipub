
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

 PUB/SUB, all options passsed to `multipub({ ... })` are
 passed to the underlying `redis.createClient()` calls.

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

# License

  MIT