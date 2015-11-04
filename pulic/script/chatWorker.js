//importScripts('/socket.io/socket.io.js');
//var socket=io();
var Self = self;
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
		trigger: function (eType, data) {
			var fns = onEventList[eType];
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
W.on('login',function(data){
	console.log(data);
});
