export default new class {

	constructor() {
		this.tweens = [];
		this.deadTweens = [];
		this.time = 0;
	}

	getAll() {
		return this.tweens;
	}

	removeAll() {
		this.tweens.forEach(tween => {
			tween.isPlaying = false;
		});

		this.tweens.length = 0;
	}

	add(tween) {
		this.tweens.push(tween);
	}

	remove(tween) {
		const i = this.tweens.indexOf(tween);

		if (i !== -1) {
			this.tweens.splice(i, 1);
		}
	}

	removeDeadTween(tween) {
		if (!tween.isPlaying) {
			this.remove(tween);
		}
	}

	updateTween(tween) {
		if (!tween.update(this.time)) {
			this.deadTweens.push(tween);
		}
	}

	onlyHasDelayedTweens(time) {
		return this.tweens.length > 0 && this.tweens.every(t => time < t.startTime);
	}

	onTick(time) {
		if (this.tweens.length === 0) {
			return false;
		}

		this.time = time;

		this.deadTweens.length = 0;

		this.tweens.forEach(this.updateTween, this);
		this.deadTweens.forEach(this.removeDeadTween, this);

		return true;
	}

}();
