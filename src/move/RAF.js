export default (function RAF() {
	const vendors = ['webkit', 'moz'];

	let lastTime = 0;

	for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[`${vendors[x]}'RequestAnimationFrame`];
		window.cancelAnimationFrame = window[`${vendors[x]}'CancelAnimationFrame`] || window[`${vendors[x]}CancelRequestAnimationFrame`];
	}

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function requestAnimationFrame(callback) {
			const currentTime = new Date().getTime();
			const timeToCall = Math.max(0, 16 - (currentTime - lastTime));
			const id = window.setTimeout(() => {
				callback(currentTime + timeToCall);
			}, timeToCall);

			lastTime = currentTime + timeToCall;

			return id;
		};
	}

	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function cancelAnimationFrame(id) {
			clearTimeout(id);
		};
	}
})();
