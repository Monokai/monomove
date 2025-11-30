export default (value = 0) => (x: number, deltaSeconds = 0, smooth = 0.95): number => {
	value = x + (value - x) * smooth ** deltaSeconds;

	return value;
}