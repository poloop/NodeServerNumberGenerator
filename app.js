
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var io = require('socket.io');

var app = express();
var server = http.createServer(app);
io = io.listen(server);

var interval;
var MIN_TIME = 5000;
var AL_DELTA_TIME = 10000;
var MAX_NUMBER = 100000;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


var generator = io
    .sockets.on('connection', function(socket) {
        console.log('Client onConnection');
        socket.emit('server ready', { message : 'generator server connection ready' } );
        socket.on('client ready', function (data) {
            console.log('client ready :: ' + data);
        });
        socket.on('disconnect', function() {
            //stopGeneration();
            console.log('Client DISCONNECTED');
        });
    });


startGeneration();

function startGeneration() {
    var dt = Math.random() * AL_DELTA_TIME + MIN_TIME;
    interval = setInterval(sendNumber, dt);
}

function stopGeneration() {
    clearInterval(interval);
}

function sendNumber() {
    clearInterval(interval);
    var val = 1 + Math.floor(Math.random() * (MAX_NUMBER - 1));
    var dt = Math.random() * AL_DELTA_TIME + MIN_TIME;
    generator.emit('send number', { value : val});
    //generator.send(val);
    console.log('Emit :: ' + new Date().toTimeString() + ' :: ' + val);
    console.log('Next call in ' + (dt/1000) + 's');
    interval = setInterval(sendNumber, dt);
}


