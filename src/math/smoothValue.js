export default (value = 0) => (x, deltaSeconds = 0, smooth = 0.95) => {
	value = x + (value - x) * smooth ** deltaSeconds;

	return value;
}
