var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
	console.log('服务器运行在localhost: %d', port);
});
// 静态文件托管目录
app.use(express.static(__dirname + '/public'));

var users = [],
	index = 0;
io.on('connection', function (socket) {
	socket.on('delay',function(data){
		var delay = ((+new Date() - data[0]) / 2) >> 0;
		socket.emit('upDelay', [delay]);
	});
	socket.emit('delay',[+new Date()]);
	(function upDelay(){
		var T=setTimeout(function(){
			socket.emit('delay',[+new Date()]);
			upDelay();
		},2000);
	}());
	socket.on('disconnect', function() {

	});
});
