
var multipub = require('..');

// launch:
// $ redis-server --port 4000 &
// $ redis-server --port 4001 &
// $ redis-server --port 4002 &

var client = multipub();

client.on('error', function(){});

client.connect('localhost:4000');
client.connect('localhost:4001');
client.connect('localhost:4002');

client.subscribe('user:tobi');
client.subscribe('user:luna');

client.on('message', function(channel, msg){
  console.log('%s - %s', channel, msg);
});

setInterval(function(){
  client.publish('user:luna', 'logged in');
}, 50);

setInterval(function(){
  client.publish('user:tobi', 'logged out');
}, 500);