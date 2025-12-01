export const smoothValue =
	(value = 0) =>
	(x: number, deltaSeconds = 0, smooth = 0.95): number =>
		x + (value - x) * smooth ** deltaSeconds;
