export const smoothValue =
	(value = 0) =>
	(x: number, deltaMS = 0, smooth = 0.95): number => {
		// normalizing to 60fps reference, frame lag compensation via exponential decay
		const smoothing = smooth ** ((deltaMS * 60) / 1000);

		value = value * smoothing + x * (1 - smoothing);

		return value;
	};
