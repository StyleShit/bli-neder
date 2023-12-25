export type ResolveCallback<T = any> = (value: T | PromiseLike<T>) => void;

export type RejectCallback = (reason?: any) => void;

export type Settled<T> =
	| { status: 'fulfilled'; value: T }
	| { status: 'rejected'; reason: any };
