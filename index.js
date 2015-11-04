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

	socket.on('disconnect', function() {

	});
});
