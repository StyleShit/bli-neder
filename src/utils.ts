export function isPromiseLike(value: unknown): value is PromiseLike<any> {
	return (
		!!value &&
		typeof value === 'object' &&
		'then' in value &&
		typeof value.then === 'function'
	);
}
