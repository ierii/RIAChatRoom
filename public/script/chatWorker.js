importScripts('/socket.io/socket.io.js');
var socket = io();
var Self = self;
var selfDelay = 0;
var W = (function () {
	var onEventList = {};
	Self.onmessage = function (event) {
		var data = event.data,
			eType = data.type,
			eData = data.data;
		W.trigger(eType, eData);
	}
	return {
		/*与主线程通讯的事件*/
		emit: function (eType, data) {
			Self.postMessage({
				type: eType,
				data: data
			});
		},
		on: function (eType, handle) {
			if (!onEventList[eType]) {
				onEventList[eType] = [];
			}
			onEventList[eType].push(handle);
		},
		/*data必须为数据数组*/
		trigger: function (eType) {
			var fns = onEventList[eType],
				data = Array.prototype.slice.call(arguments, 1);
			if (!fns || fns.length === 0) {
				return false;
			}
			for (var i = 0, fn; fn = fns[i++];) {
				fn.apply(this, data);
			}
		},
		off: function (eType, fn) {
			var fns = onEventList[eType];
			if (!fns) {
				return false;
			}
			if (!fn) {
				fns && (fns.length = 0);
			} else {
				for (var len = fns.length - 1; len >= 0; len--) {
					var _fn = fns[len];
					if (_fn === fn) {
						fns.splice(len, 1);
					}
				}
			}
		}
	}
}());
W.on('login', function (data) {
	socket.emit('login', data);
});
W.on('typing', function (data) {
	socket.emit('typing', data);
});
W.on('stopTyping', function (data) {
	socket.emit('stopTyping', data);
});
W.on('msg',function(data){
	socket.emit('msg',data);
});
socket.on('msg',function(data){
	W.emit('msg',data);
});
socket.on('typing', function (data) {
	W.emit('typing', data);
});
socket.on('stopTyping', function (data) {
	W.emit('stopTyping', data);
});
socket.on('login', function (data) {

	W.emit('login', data);
});
socket.on('userJoin', function (data) {
	W.emit('userJoin', data);
});
socket.on('leave', function (data) {
	W.emit('leave', data);
});

socket.on('delay', function (data) {
	socket.emit('delay', data);
});
socket.on('upDelay', function (data) {
	selfDelay = data.delay;
});
console.log('线程正常运行！');
