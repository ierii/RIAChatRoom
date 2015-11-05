$(document).ready(function () {
	var ME = {
		/*用户自定义数据*/
		USER: {
			username: '',
			chatWorkes: new Worker('script/chatWorker.js')
		},
		/*dom相关*/
		DOM: {
			$window: $(window),
			$joinBtn: $('#joinBtn'),
			$joinInput: $('#joinInput'),
			$login: $('div.login'),
			$main: $('div.main'),
			$handlePenle: $('ul.handle-panel'),
			$groupChatPanel: $('div.group-chat-panel')
		},
		WOK:(function(){
			return {
				emit:function(){},
				on:function(){},
				trigger:function(){},
				off:function(){}
			};
		}())

	};
	ME.USER.chatWorkes.postMessage('this is test msg');
	(function init() {
		ME.DOM.$window.keydown(function (event) {
			/*按键没有特殊的按键的影响*/
			if (!(event.ctrlKey || event.metaKey || event.altKey)) {
				ME.DOM.$joinInput.focus();
			}
			if (event.which === 13) {
				ME.USER.username = cleanInput(ME.DOM.$joinInput.val());
				ME.DOM.$login.fadeOut(1000, function () {
					ME.DOM.$main.fadeIn(500);
					initChatRoom();
				});
			}
		});
	})();
	//  初始化聊天室，这里有与后台交互的功能
	function initChatRoom() {
		ME.DOM.$handlePenle.on('click', 'li', function (event) {
			var $this = $(this);
			var temp = ME.DOM.$groupChatPanel.slideToggle(1000);
		});
	};
	//	初始化用户角色地图，这里也有
	function initGame() {

	}
	function penelAnimateCtrl(){

	}
	//  用于清除危险字符用的
	function cleanInput(input) {
		return $('<div/>').text(input).text();
	};


});
