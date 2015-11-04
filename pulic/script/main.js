$(document).ready(function () {
	var USERNAME = '',
		$window = $(window),
		$joinBtn = $('#joinBtn'),
		$joinInput = $('#joinInput'),
		$login = $('div.login'),
		$main = $('div.main'),
		$handlePenle = $('ul.handle-panel'),
		$groupChatPanel = $('div.group-chat-panel');
	var chatWorkes=new Worker('script/chatWorker.js');
	chatWorkes.postMessage('this is test msg');
	(function init() {
		$window.keydown(function (event) {
			/*按键没有特殊的按键的影响*/
			if (!(event.ctrlKey || event.metaKey || event.altKey)) {
				$joinInput.focus();
			}
			if (event.which === 13) {
				USERNAME = cleanInput($joinInput.val());
				$login.fadeOut(1000, function () {
					$login.css({
						display: 'none'
					});
					$main.fadeIn(500);
					initChatRoom();
				});
			}
		});
	})();

	function initChatRoom() {
		$handlePenle.on('click', 'li', function (event) {
			var $this =$(this);
			var temp = $groupChatPanel.fadeToggle(500);
		});
	}
	//用于清除危险字符用的
	function cleanInput(input) {
		return $('<div/>').text(input).text();
	};


});
