import { RejectCallback, ResolveCallback, Settled } from './types';
import { isPromiseLike } from './utils';

const PENDING = Symbol('pending');
const FULFILLED = Symbol('fulfilled');
const REJECTED = Symbol('rejected');

type State = typeof PENDING | typeof FULFILLED | typeof REJECTED;

export class BliNeder<T> implements PromiseLike<T> {
	private state: State = PENDING;
	private value: T | Awaited<T> | undefined = undefined;
	private resolveCallbacks: ResolveCallback[] = [];
	private rejectCallbacks: RejectCallback[] = [];

	constructor(
		executor: (resolve: ResolveCallback<T>, reject: RejectCallback) => void,
	) {
		const resolve: ResolveCallback<T> = (value) => {
			if (this.state !== PENDING) {
				return;
			}

			if (isPromiseLike(value)) {
				value.then(resolve, reject);
				return;
			}

			this.state = FULFILLED;
			this.value = value;

			this.resolveNext();
		};

		const reject: RejectCallback = (reason) => {
			if (this.state !== PENDING) {
				return;
			}

			this.state = REJECTED;
			this.value = reason;

			this.rejectNext();
		};

		try {
			executor(resolve, reject);
		} catch (e) {
			reject(e);
		}
	}

	then<TResult1 = T, TResult2 = never>(
		onFulfilled?:
			| ((value: T) => TResult1 | PromiseLike<TResult1>)
			| undefined
			| null,
		onRejected?:
			| ((reason: any) => TResult2 | PromiseLike<TResult2>)
			| undefined
			| null,
	): BliNeder<TResult1 | TResult2> {
		return new BliNeder<TResult1 | TResult2>((resolve, reject) => {
			const wrappedOnFulfilled = (value: T) => {
				if (!onFulfilled) {
					resolve(value as TResult1 | PromiseLike<TResult1>);
					return;
				}

				try {
					resolve(onFulfilled(value));
				} catch (e) {
					reject(e);
				}
			};

			const wrappedOnRejected: RejectCallback = (value) => {
				if (!onRejected) {
					reject(value);
					return;
				}

				try {
					resolve(onRejected(value));
				} catch (e) {
					reject(e);
				}
			};

			this.resolveCallbacks.push(wrappedOnFulfilled);
			this.rejectCallbacks.push(wrappedOnRejected);
		});
	}

	catch<TResult = never>(
		onRejected?:
			| ((reason: any) => TResult | PromiseLike<TResult>)
			| undefined
			| null,
	): PromiseLike<T | TResult> {
		return this.then(null, onRejected);
	}

	finally(onFinally?: (() => void) | undefined | null): PromiseLike<T> {
		return this.then(
			(value) => {
				onFinally?.();
				return value;
			},
			(reason) => {
				onFinally?.();
				throw reason;
			},
		);
	}

	static resolve<T>(value: T | PromiseLike<T>): BliNeder<T> {
		return new BliNeder<T>((resolve) => {
			resolve(value);
		});
	}

	static reject<T = never>(reason: T): BliNeder<T> {
		return new BliNeder<T>((_, reject) => reject(reason));
	}

	static all<T extends PromiseLike<any>[]>(promises: T) {
		const results: Awaited<T[number]>[] = [];

		return new BliNeder((resolve) => {
			promises.forEach((promise, i) => {
				promise.then((value) => {
					results[i] = value;

					if (results.length === promises.length) {
						resolve(results);
					}
				});
			});
		});
	}

	static allSettled<T extends PromiseLike<any>[]>(
		promises: T,
	): BliNeder<Settled<T>[]> {
		const results: Settled<T>[] = [];

		return new BliNeder((resolve) => {
			promises.forEach((promise, i) => {
				const onFulfilled = (value: T) => {
					results[i] = { status: 'fulfilled', value };

					resolveIfNeeded();
				};

				const onRejected = (reason: any) => {
					results[i] = { status: 'rejected', reason };

					resolveIfNeeded();
				};

				const resolveIfNeeded = () => {
					if (results.length === promises.length) {
						resolve(results);
					}
				};

				promise.then(onFulfilled, onRejected);
			});
		});
	}

	private resolveNext() {
		queueMicrotask(() => {
			this.resolveCallbacks.forEach((cb) => cb(this.value));
		});
	}

	private rejectNext() {
		queueMicrotask(() => {
			this.rejectCallbacks.forEach((cb) => cb(this.value));
		});
	}
}
