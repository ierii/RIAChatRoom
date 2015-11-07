$(document).ready(function () {
	var ME = {
		/*自定义数据*/
		USER: {
			userName: '',
			userId: '',
			connected: false,
			typing: false,
			START_INPUT_TIME: 0,
			TYPING_TIMER_LENGTH: 800
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
			$groupChatInput: $('#group-msg-input'),
			$groupChatBtn: $('#groupChatRoom'),
			$msgTemplate: $('#msgTemplate'),
		},
		/*与线程通讯用的*/
		WOK: FactoryWorker('script/chatWorker.js')
	};
	(function init() {
		var inputUname = '';
		var bindLoginInput = BindKeyDown(ME.DOM.$joinInput,
			function ($input) {
				/*回车执行的先决条件*/
				return inputUname = $input.val().trim();
			},
			function ($input, msg) {
				/*回车可执行的事件*/
				inputUname = msg;
				ME.DOM.$joinBtn.trigger('click');
			});
		initChatRoom();
		initHandelPanel();
		bindLoginInput.bind();
		ME.DOM.$joinBtn.on('click', function (event) {
			event.preventDefault();
			if (!inputUname) return;
			ME.DOM.$login.hide(500, function () {
				ME.DOM.$main.show(500);
			});
			ME.DOM.$joinBtn.off('click');
			bindLoginInput.unbind();
			initGame(cleanInput(inputUname));
		});
	}());
	/*绑定的输入对象，前提执行函数，确定执行函数*/
	function BindKeyDown($input, premise, fn) {
		var msg = '';
		var handle = function (event) {
				msg = premise($input);
				if (event.ctrlKey || event.metaKey || event.altKey) return;
				$input.focus();
				if (event.which === 13 && !!msg) {
					fn($input, msg);
				}
			}
			/*用于绑定或解绑定用的*/
		return {
			bind: function () {
				ME.DOM.$window.on('keydown', handle);
			},
			unbind: function () {
				ME.DOM.$window.off('keydown', handle);
			}
		};
	}
	/*线程工厂，包装产生出可以与后台直接进行事件通讯的wok对象*/
	function FactoryWorker(workerUrl) {
		if (!window.Worker) return;
		var worker = new Worker(workerUrl),
			/*这里单单借用jquery的事件属性*/
			$event = $({});
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

	/*消息管理中心，消息的移除，通知控制面板*/
	function ManageMsg($wrapper, $notice, $template) {
		var msgTemplate = $template.html(),
			buildTemplate = window.juicer(msgTemplate),
			msgList = [],
			typingMsgList = {};
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
		});
		$notice.on('prompt', function (event) {
			console.log('add prompt!!!');
			if ($notice.data('hidden')) {
				$notice.addClass('prompt');
			}
		});
		return {
			log: function (type, data) {
				data.type = type;
				var msg = buildTemplate.render(data);
				msgList.push($(msg).appendTo($wrapper));
				/*触发滚动消息列表的事件*/
				$wrapper.trigger('scrollBottom');
				/*出发面板的消息提示*/
				$notice.trigger('prompt');
				/*消息达到上限是截取消息列表*/
				if (msgList.length >= 50) {
					$wrapper.trigger('removeMsg');
				}
			},
			logTypMsg: function (type, data) {
				var userId = data.userId;
				if (typingMsgList[userId]) return;
				data.type = type;
				var msg = buildTemplate.render(data);
				typingMsgList[userId] = $(msg).appendTo($wrapper);
			},
			rmTypMsg: function (data) {
				var userId = data.userId;
				if (!userId) return;
				typingMsgList[userId].fadeOut('slow', function () {
					$(this).remove();
				});
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
				panelName = $(this).data('panel'),
				isHidden = $(this).data('hidden');
			if (!!!panelName) return;
			var $panel = Panles[panelName];
			$this.removeClass('prompt');
			$this.data('hidden', !isHidden);
			$panel.data('hidden', !isHidden);
			$panel.slideToggle(500);
		});
	}
	//  初始化聊天室，这里有与后台交互的功能
	function initChatRoom() {
		var MngMsg = ManageMsg(ME.DOM.$groupChatMsgWrapper, ME.DOM.$groupChatBtn, ME.DOM.$msgTemplate);
		/*用户发送消息*/
		var bindGroupMsgInput = BindKeyDown(ME.DOM.$groupChatInput,
			function ($input) {
				return (!ME.DOM.$groupChatPanel.data('hidden')) && $input.val().trim();
			},
			function ($input, msg) {
				var data = {
					userName: ME.USER.userName,
					msg: msg
				};
				ME.WOK.emit('msg', data);
				$input.val('');
				MngMsg.log('left', data);
			});
		bindGroupMsgInput.bind();
		ME.WOK.on('login', function (event, data) {
			console.log('the user login:', data);
			ME.USER.userId = data.userId;
			data.userName = ME.USER.userName;
			MngMsg.log('join', data);
		});
		ME.WOK.on('userJoin', function (event, data) {
			MngMsg.log('join', data);
		});
		ME.WOK.on('leave', function (event, data) {
			MngMsg.log('leave', data);
		});
		ME.WOK.on('typing', function (event, data) {
			MngMsg.logTypMsg('typing', data);
		});
		ME.WOK.on('stopTyping', function (event, data) {
			MngMsg.rmTypMsg(data);
		});

		ME.WOK.on('msg', function (event, data) {
			MngMsg.log('right', data);
		});
		/*用户正在输入与停止事件的触发*/
		ME.DOM.$groupChatInput.on('input', function () {
			if (!ME.USER.connected) return;
			if (!ME.USER.typing) {
				ME.USER.typing = true;
				ME.WOK.emit('typing', {
					userName: ME.USER.userName
				});
			}
			ME.USER.START_INPUT_TIME = +new Date();
			setTimeout(function () {
				var typingTime = +new Date();
				var timeDiff = typingTime - ME.USER.START_INPUT_TIME;
				if (timeDiff >= ME.USER.TYPING_TIMER_LENGTH && ME.USER.typing) {
					ME.WOK.emit('stopTyping', {});
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
