var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
var port = process.env.VCAP_APP_PORT || 3000;

server.listen(port, function() {
    console.log('服务器运行在localhost: %d', port);
});
// 静态文件托管目录
app.use(express.static(__dirname + '/public'));

var users = [],
    index = 0;
io.on('connection', function(socket) {
    socket.on('login', function(data) {
		index++;
        console.log('登录的用户：', data.userName);
		socket.userName=data.userName;
        socket.emit('login', {
            onlineNum: index,
			userId:socket.id
        });
        socket.broadcast.emit('userJoin', {
            onlineNum: index,
            userName: data.userName
        });

    });
	socket.on('typing',function(data){
		console.log('in server in typing',data);
		data.userId=socket.id;
		socket.broadcast.emit('typing',data);
	});
	socket.on('stopTyping',function(data){
		console.log('in server in stoptyping',data);
		data.userId=socket.id;
		socket.broadcast.emit('stopTyping',data);
	});
	socket.on('msg',function(data){
		console.log('in server the user msg is:',data);
		socket.broadcast.emit('msg',data);
	});
    /*用户离开*/
     socket.on('disconnect', function() {
     	index=index>0?index--:0;
		socket.broadcast.emit('leave',{userName:socket.userName,onlineNum:index});
    });
    /*检测时间延迟用的*/
    socket.on('delay', function(data) {
        var delay = ((+new Date() - data.start) / 2) >> 0;
        socket.emit('upDelay', {
            delay: delay
        });
    });
    socket.emit('delay', {
        start: +new Date()
    });
    (function upDelay() {
        var T = setTimeout(function() {
            socket.emit('delay', {
                start: +new Date()
            });
            upDelay();
        }, 2000);
    }());
});
