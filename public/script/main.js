$(document).ready(function () {
	var ME = {
		/*自定义数据*/
		USER: {
			userName: '',
			connected:false;
		},
		/*dom相关*/
		DOM: {
			$window: $(window),
			$joinBtn: $('#joinBtn'),
			$joinInput: $('#joinInput'),
			$login: $('div.login'),
			$main: $('div.main'),
			$handlePanle: $('ul.handle-panel'),
			$groupChatPanel: $('div.group-chat-panel'),
			$msgTemplate:$('#msgTemplate')
		},
		/*与线程通讯用的*/
		WOK: FactoryWorker('script/chatWorker.js')
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
	function BuildLog($wrapper){
		var msgTemplate=ME.DOM.$msgTemplate.html(),
			buildTemplate=window.juicer(msgTemplate);
		return function(type,data){
			data.type=type;
			$wrapper.append(buildTemplate.render(data));
		}

	}
	/*消息管理中心，消息的移除，通知控制面板*/
	function ManageMsg($wrapper,$notice){
		var msglist={
			'msgNodes':[],
			'typMsgNode':null
		}
		$wrapper.on('removeMsg',function(event,$node){

		});
		return {
			removeTypingMsg:function(){
				$wrapper.removeChild(msglist.typMsgNode);
			},

		}
	}
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
		var Log=BuildLog($('ul.msg-wrapper'));
		ME.WOK.on('login', function (event, data) {
			data.userName = ME.USER.userName;
			Log('join', data);
		});
		ME.WOK.on('userJoin', function (event, data) {
			Log('join', data);
		});
		ME.WOK.on('leave', function (event, data) {
			Log('leave', data);
		});
		ME.WOK.on('typing',function(event,data){
			Log('typing',data)
		});
		ME.WOK.on('stopTyping',function(event,data){

		});
	};
	//	初始化用户角色地图，这里也有
	function initGame(username) {
		ME.USER.userName = username;
		ME.USER.connected=true;
		ME.WOK.emit('login', {
			userName: username
		});
	}
	//  用于清除危险字符用的
	function cleanInput(input) {
		return $('<div/>').text(input).text();
	};


});
