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
	/**/
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
	(function init() {
		ME.DOM.$window.keydown(function (event) {
			/*按键没有特殊的按键的影响*/
			if (!(event.ctrlKey || event.metaKey || event.altKey)) {
				ME.DOM.$joinInput.focus();
			}
			var inputUname=ME.DOM.$joinInput.val().trim();
			if (event.which === 13&&(!!inputUname)) {
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
		ME.WOK.on('login',function(event,data){
			console.log('用户登录成功，在线人数为：',data);
		});
		ME.WOK.on('userJoin',function(event,data){
			console.log('其他用户登录：',data);
		});
	};
	//	初始化用户角色地图，这里也有
	function initGame(username) {
		ME.USER.username = username;
		ME.WOK.emit('login', {
			userName: username
		});
	}
	function log(type,data){
		var msgList={
			'prompt':function(data){
				var msg='',
					userName=data.userName,
					onlineNum=data.onlineNum;
				msg+=!!userName?userName+' join in the chat room':'';
				msg+=!!onlineNum?'online num is: '+onlineNum:'';
				return $('<li>').addClass('prompt').text(message);
			}
		};

	}
	//  用于清除危险字符用的
	function cleanInput(input) {
		return $('<div/>').text(input).text();
	};


});
