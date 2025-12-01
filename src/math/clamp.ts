export function clamp(val: number, min: number, max: number = Number.MAX_VALUE): number {
	return val < min ? min : (val > max ? max : val);
}
