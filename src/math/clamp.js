export default function(val, min, max = Number.MAX_VALUE) {
	return val < min ? min : (val > max ? max : val);
}