$(function() {
	$('#timerb').click(function() {
		var sec = $('#detik').val();
		var timer = new CountDownTimer(sec);
		var timeObj = CountDownTimer.parse(sec);

		format(timeObj.minutes, timeObj.seconds);
		timer.onTick(format);
		timer.start();
	});

	function format(minutes, seconds) {
		minutes = minutes < 10 ? '0' + minutes : minutes;
		seconds = seconds < 10 ? '0' + seconds : seconds;

		var display = document.querySelector('#time');
		display.textContent = minutes + ':' + seconds;
	}
});
