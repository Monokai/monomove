export default (function() {
	const _vendors = ['webkit', 'moz'];

	let _lastTime = 0;

	for (let x = 0; x < _vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[`${_vendors[x]}'RequestAnimationFrame`];
		window.cancelAnimationFrame = window[`${_vendors[x]}'CancelAnimationFrame`] || window[`${_vendors[x]}CancelRequestAnimationFrame`];
	}

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback) {
			const currentTime = new Date().getTime();
			const timeToCall = Math.max(0, 16 - (currentTime - _lastTime));
			const id = window.setTimeout(() => {
				callback(currentTime + timeToCall);
			}, timeToCall);
			_lastTime = currentTime + timeToCall;

			return id;
		};
	}

	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
})();
