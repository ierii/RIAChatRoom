var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;

server.listen(port, function() {
    console.log('服务器运行在localhost: %d', port);
});
// 静态文件托管目录
app.use(express.static(__dirname + '/public'));

var users = [],
    index = 0;
io.on('connection', function(socket) {
    index++;
    socket.on('login', function(data) {
        console.log('登录的用户：', data.userName);
        socket.emit('login', {
            onlineNum: index
        });
        socket.broadcast.emit('userJoin', {
            onlineNum: index,
            userName: data.userName
        });

    });
    /**/
     socket.on('disconnect', function() {
     	index--;
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
