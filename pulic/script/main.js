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
		WOK: (function () {
			return {
				emit: function () {},
				on: function () {},
				trigger: function () {},
				off: function () {}
			};
		}())

	};
	(function init() {
		ME.DOM.$window.keydown(function (event) {
			/*按键没有特殊的按键的影响*/
			if (!(event.ctrlKey || event.metaKey || event.altKey)) {
				ME.DOM.$joinInput.focus();
			}
			if (event.which === 13) {
				ME.DOM.$login.hide(500, function () {
					ME.DOM.$main.show(500);
				});
				initHandelPanel();
				initGame(cleanInput(ME.DOM.$joinInput));
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
			if(!!!panelName)return;
			var $panel = Panles[panelName];
			$this.removeClass('prompt');
			$panel.slideToggle(500);
		});
		/*而后还可以写一下与消息同志的机制*/
	}

	function initLogin(username) {
		ME.USER.username = username;
		/*emit login*/
	};
	//  初始化聊天室，这里有与后台交互的功能
	function initChatRoom() {

	};
	//	初始化用户角色地图，这里也有
	function initGame() {
		//1.先显示出游戏角色
	}

	function penelAnimateCtrl() {

	}
	//  用于清除危险字符用的
	function cleanInput(input) {
		return $('<div/>').text(input).text();
	};


});
