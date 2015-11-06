$(document).ready(function () {
	var ME = {
		/*用户自定义数据*/
		USER: {
			username: '',
		},
		/*dom相关*/
		DOM: {
			$window: $(window),
			$joinBtn: $('#joinBtn'),
			$joinInput: $('#joinInput'),
			$login: $('div.login'),
			$main: $('div.main'),
			$handlePanle: $('ul.handle-panel'),
			$groupChatPanel: $('div.group-chat-panel')
		},
		WOK: FactoryWorker('script/chatWorker.js')
	};
	/*线程工厂*/
	function FactoryWorker(workerUrl) {
		if (!window.Worker) return;
		var worker = new Worker(workerUrl),
			$event = $({});
		var W = {
			emit: function (type, data) {
				worker.postMessage({
					type: type,
					data: data
				});
			},
			on: function (type, fn) {
				$event.on(type, fn);
			},
			off: function (type, fn) {
				$event.off(type, fn);
			}
		};
		worker.onmessage = function (event) {
			var EData = event.data,
				type = EData.type,
				data = EData.data;
			$event.trigger(type, data);
		}
		return W;
	};
	/*消息列表生成用的*/
	function BuildLog($Wrapper) {
		var msgList = {
			'prompt': function (data, leave) {
				var msg = '',
					userName = data.userName,
					onlineNum = data.onlineNum;
				if (leave) {
					msg += !!userName ? userName + ' 离开了聊天室' : '';
				} else {
					msg += !!userName ? userName + ' 欢迎您加入本聊天室' : '';
					msg += !!onlineNum ? ' 当前在线人数为: ' + onlineNum : '';
				}
				return $('<li>').addClass('prompt').text(msg);
			}
		};
		return function (type, data) {
			if (!type || !data) return;
			var logmsg = msgList[type];
			if (!logmsg) return;
			$Wrapper.append(logmsg(data));
		}

	};
	(function init() {
		ME.DOM.$window.keydown(function (event) {
			/*按键没有特殊的按键的影响*/
			if (!(event.ctrlKey || event.metaKey || event.altKey)) {
				ME.DOM.$joinInput.focus();
			}
			var inputUname = ME.DOM.$joinInput.val().trim();
			if (event.which === 13 && (!!inputUname)) {
				ME.DOM.$login.hide(500, function () {
					ME.DOM.$main.show(500);
				});
				initHandelPanel();
				initGame(cleanInput(inputUname));
				initChatRoom();
			}
		});
	})();
	/*初始化面板，添加面板的开关*/
	function initHandelPanel() {
		/*这里有与dom 的data-panel属性挂钩*/
		var Panles = {
			"groupChatRoom": ME.DOM.$groupChatPanel
		};
		ME.DOM.$handlePanle.on('click', 'li', function (event) {
			var $this = $(this),
				panelName = $(this).data('panel');
			if (!!!panelName) return;
			var $panel = Panles[panelName];
			$this.removeClass('prompt');
			$panel.slideToggle(500);
		});
		/*而后还可以写一下与消息同志的机制*/
	}
	//  初始化聊天室，这里有与后台交互的功能
	function initChatRoom() {
		var Log = BuildLog($('ul.msg-wrapper'));
		ME.WOK.on('login', function (event, data) {
			console.log('用户登录成功，在线人数为：', data);
			data.userName = ME.USER.username;
			Log('prompt', data);
		});
		ME.WOK.on('userJoin', function (event, data) {
			console.log('其他用户登录：', data);
			Log('prompt', data);
		});
		ME.WOK.on('leave', function (event, data) {
			Log('prompt', data);
		});
	};
	//	初始化用户角色地图，这里也有
	function initGame(username) {
		ME.USER.username = username;
		ME.WOK.emit('login', {
			userName: username
		});
	}
	//  用于清除危险字符用的
	function cleanInput(input) {
		return $('<div/>').text(input).text();
	};


});
