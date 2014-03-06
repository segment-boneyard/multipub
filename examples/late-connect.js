
var multipub = require('..');

// launch:
// $ redis-server --port 4000 &
// $ redis-server --port 4001 &
// $ redis-server --port 4002 &

var client = multipub();

client.subscribe('user:login');

client.on('message', function(_, msg){
  console.log(msg);
});

client.on('error', function(err){
  console.error('ERROR: %s', err.message);
});

setInterval(function(){
  client.publish('user:login', { name: 'tobi' });
}, 200);

setTimeout(function(){
  client.connect('localhost:4000');
}, 1000);

setTimeout(function(){
  client.connect('localhost:4001');
}, 3000);

setTimeout(function(){
  client.connect('localhost:4002');
}, 6000);