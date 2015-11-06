$(document).ready(function () {
	var ME = {
		/*自定义数据*/
		USER: {
			userName: '',
			userId:'',
			connected: false,
			typing:false,
			TYPING_TIMER_LENGTH:400
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
			$groupChatMsgWrapper: $('#group-msg-wrapper'),
			$groupChatInput:$('#group-msg-input'),
			$groupChatBtn: $('#groupChatRoom'),
			$msgTemplate: $('#msgTemplate'),
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
			/*这里单单借用jquery的事件属性*/
			$event = $();
		/*加上一层包装用于与线程通讯*/
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
	function BuildLog($wrapper) {
		/*这里利用模板引擎生成对应消息列表*/
		var msgTemplate = ME.DOM.$msgTemplate.html(),
			buildTemplate = window.juicer(msgTemplate);
		return function (type, data) {
			data.type = type;
			var liHtml = buildTemplate.render(data),
				$msg = $(liHtml);
			$wrapper.append($msg);
			return $msg;
		}

	}
	/*消息管理中心，消息的移除，通知控制面板*/
	function ManageMsg($wrapper, $notice) {
		var msgList = [],
		    typingMsgList={},
			$typingMsg = null;
		$wrapper.on('removeMsg', function (event) {
			var index = 0;
			while (index++ < 30) {
				var $item = msgList.shift();
				$item.remove();
			}
			$wrapper.trigger('scrollBottom');
		});
		$wrapper.on('scrollBottom', function () {
			var scrollHeight = $wrapper[0].scrollHeight;
			$wrapper.animate({
				scrollTop: scrollHeight
			}, 500);
		})
		return {
			addMsg: function ($msg) {
				msgList.push($msg);
				$wrapper.trigger('scrollBottom');
				if ($msg.data('isHidden')) {
					$notice.addClass('prompt');
				}
				if (!(msgList.length > 50)) return;
				$wrapper.trigger('removeMsg');
			},
			addTypingMsg: function ($tmsg,userId) {
				typingMsgList[userId]=$tmsg;
			},
			rmTypingMsg: function (userId) {
				typingMsgList[userId].remove();
				delete typingMsgList[userId];

			}
		};
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
			var isHidden = !!$panel.is(':hidden');
			$this.data('isHidden', isHidden);
		});
	}
	//  初始化聊天室，这里有与后台交互的功能
	function initChatRoom() {
		var Log = BuildLog(ME.DOM.$groupChatMsgWrapper),
			MngMsg = ManageMsg(ME.DOM.$groupChatMsgWrapper, ME.DOM.$groupChatBtn);
		ME.WOK.on('login', function (event, data) {
			data.userName = ME.USER.userName;
			ME.USER.userId=data.userId;
			MngMsg.addMsg(Log('join', data));
		});
		ME.WOK.on('userJoin', function (event, data) {
			MngMsg.addMsg(Log('join', data));
		});
		ME.WOK.on('leave', function (event, data) {
			MngMsg.addMsg(Log('leave', data));
		});
		ME.WOK.on('typing', function (event, data) {
			MngMsg.addTypingMsg(Log('typing', data),data.userId);
		});
		ME.WOK.on('stopTyping', function (event, data) {
			MngMsg.rmTypingMsg(data.userId);
		});



		ME.DOM.$groupChatInput.on('input',function(){
			if(!ME.USER.connected)return;
			if(!ME.USER.typing)ME.USER.typing=true;
			var startTime=+new Date();
			ME.WOK.emit('typing',{userName:ME.USER.userName});
			setTimeout(function () {
                var typingTime =+new Date();
                var timeDiff = typingTime - startTime;
                if (timeDiff >= ME.USER.TYPING_TIMER_LENGTH&&ME.USER.typing) {
                    ME.WOK.emit('stopTyping',{});
                    ME.USER.typing = false;
                }
            }, ME.USER.TYPING_TIMER_LENGTH);
		});
	};
	//	初始化用户角色地图，这里也有
	function initGame(username) {
		ME.USER.userName = username;
		ME.USER.connected = true;
		ME.WOK.emit('login', {
			userName: username
		});
	}
	//  用于清除危险字符用的
	function cleanInput(input) {
		return $('<div/>').text(input).text();
	};


});
