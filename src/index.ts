import { RejectCallback, ResolveCallback } from './types';
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
	): PromiseLike<TResult1 | TResult2> {
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
