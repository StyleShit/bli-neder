import { describe, expect, it } from 'vitest';
import { BliNeder } from '../index';

describe('BliNeder', () => {
	it('should resolve a static value in the constructor', () => {
		// Arrange & Act.
		const neder = new BliNeder((resolve) => {
			resolve(42);
		});

		// Assert.
		return expect(neder).resolves.toBe(42);
	});

	it('should reject a static value in the constructor', () => {
		// Arrange & Act.
		const neder = new BliNeder((_, reject) => {
			reject(42);
		});

		// Assert.
		return expect(neder).rejects.toBe(42);
	});

	it('should resolve a promise in the constructor', () => {
		// Arrange & Act.
		const neder = new BliNeder((resolve) => {
			resolve(Promise.resolve(42));
		});

		// Assert.
		return expect(neder).resolves.toBe(42);
	});

	it('should resolve in then with onFulfilled', () => {
		// Arrange.
		const neder = new BliNeder<number>((resolve) => {
			setTimeout(() => {
				resolve(42);
			}, 100);
		});

		// Act.
		const onFulfilled = (value: number) => value * 2;

		const then = neder.then(onFulfilled);

		// Assert.
		return expect(then).resolves.toBe(84);
	});

	it('should catch in then with onFulfilled and onRejected', async () => {
		// Arrange.
		const neder = new BliNeder<number>((_, reject) => {
			setTimeout(() => {
				reject(42);
			}, 100);
		});

		// Act.
		const onFulfilled = (value: number) => value * 1;
		const onRejected = (value: number) => value * 2;

		const value = await neder.then(onFulfilled, onRejected);

		// Assert.
		return expect(value).toBe(84);
	});

	it('should catch in then with nullish onFulfilled and onRejected', async () => {
		// Arrange.
		const neder = new BliNeder<number>((_, reject) => {
			setTimeout(() => {
				reject(42);
			}, 100);
		});

		// Act.
		const onFulfilled = null;
		const onRejected = (value: number) => value * 2;

		const value = await neder.then(onFulfilled, onRejected);

		// Assert.
		return expect(value).toBe(84);
	});

	it('should catch in catch method', async () => {
		// Arrange.
		const neder = new BliNeder<number>((_, reject) => {
			reject(42);
		});

		// Act.
		const value = await neder.catch((value) => value * 2);

		// Assert.
		return expect(value).toBe(84);
	});

	it('should await then with resolution', async () => {
		// Arrange.
		const neder = new BliNeder<number>((resolve) => {
			setTimeout(() => {
				resolve(42);
			}, 100);
		});

		// Act.
		const value = await neder.then((value) => value * 2);

		// Assert.
		expect(value).toBe(84);
	});

	it('should await then with rejection', async () => {
		// Arrange.
		const neder = new BliNeder<number>((_, reject) => {
			setTimeout(() => {
				reject(42);
			}, 100);
		});

		// Act.
		const onFulfilled = null;
		const onRejected = (value: number) => value * 2;

		const value = await neder.then(onFulfilled, onRejected);

		// Assert.
		expect(value).toBe(84);
	});

	it('should throw in then without onRejected', async () => {
		// Arrange.
		const neder = new BliNeder<number>((_, reject) => {
			setTimeout(() => {
				reject(42);
			}, 100);
		});

		// Act.
		const onFulfilled = null;
		const onRejected = null;

		// Assert.
		expect.assertions(1);

		try {
			await neder.then(onFulfilled, onRejected);
		} catch (e) {
			expect(e).toBe(42);
		}
	});

	it('should support chaining', async () => {
		// Arrange.
		const neder = new BliNeder<number>((resolve) => {
			setTimeout(() => {
				resolve(1);
			}, 100);
		});

		// Act.
		const value = await neder
			.then((value) => value * 2)
			.then((value) => value * 3)
			.then((value) => value * 4);

		// Assert.
		expect(value).toBe(24);
	});

	it('should support chaining with rejection', async () => {
		// Arrange.
		const neder = new BliNeder<number>((resolve) => {
			setTimeout(() => {
				resolve(1);
			}, 100);
		});

		// Act.
		const value = await neder
			.then((value) => value * 2)
			.then(() => {
				throw new Error('3');
			})
			.catch((reason) => parseInt(reason.message))
			.then((value) => value * 4);

		// Assert.
		expect(value).toBe(12);
	});

	it('should support returning a PromiseLike that resolves', async () => {
		// Arrange.
		const neder = new BliNeder<number>((resolve) => {
			setTimeout(() => {
				resolve(1);
			}, 100);
		});

		// Act.
		const value = await neder
			.then((value) => value * 2)
			.then((value) => Promise.resolve(value * 3))
			.then((value) => new BliNeder((resolve) => resolve(value * 4)));

		// Assert.
		expect(value).toBe(24);
	});

	it('should support returning a PromiseLike that rejects', async () => {
		// Arrange.
		const neder = new BliNeder<number>((resolve) => {
			setTimeout(() => {
				resolve(1);
			}, 100);
		});

		// Act.
		const value = await neder
			.then(
				(value) =>
					new BliNeder<number>((resolve) => resolve(value * 2)),
			)
			.then((value) => Promise.reject(value * 3))
			.then(null, (value) => value * 4);

		// Assert.
		expect(value).toBe(24);
	});

	it('should run the finally method after resolution without changing the resolve value', async () => {
		// Arrange.
		let number = 0;

		// Act.
		const value = await new BliNeder<number>((resolve) => {
			resolve(42);
		}).finally(() => {
			number = 42;

			return 1;
		});

		// Assert.
		expect(number).toBe(42);
		expect(value).toBe(42);
	});

	it('should run the finally method after rejection without changing the reject value', async () => {
		// Arrange.
		let number = 0;

		// Act & Assert.
		expect.assertions(2);

		try {
			await new BliNeder<number>((_, reject) => {
				reject(42);
			}).finally(() => {
				number = 42;

				return 1;
			});
		} catch (e) {
			expect(e).toBe(42);
		}

		// Assert.
		expect(number).toBe(42);
	});

	it('should resolve using a static method', async () => {
		// Arrange & Act.
		const neder = BliNeder.resolve(42);

		// Assert.
		return expect(neder).resolves.toBe(42);
	});

	it('should await resolve using a static method', async () => {
		// Act.
		const neder = await BliNeder.resolve(42);

		// Assert.
		expect(neder).toBe(42);
	});

	it('should reject using a static method', async () => {
		// Arrange & Act.
		const neder = BliNeder.reject(42);

		// Assert.
		return expect(neder).rejects.toBe(42);
	});

	it('should await reject using a static method', async () => {
		// Expect.
		expect.assertions(1);

		// Act.
		try {
			await BliNeder.reject(42);
		} catch (e) {
			// Assert.
			expect(e).toBe(42);
		}
	});

	it('should support chaining after resolving with static method', async () => {
		// Arrange & Act.
		const value = await BliNeder.resolve(1)
			.then((value) => value * 2)
			.then((value) => value * 3)
			.then((value) => value * 4);

		// Assert.
		expect(value).toBe(24);
	});

	it('should support chaining after rejecting with static method', async () => {
		// Arrange & Act.
		const value = await BliNeder.reject(1)
			.then((value) => value * 2)
			.catch((value) => value * 3)
			.then((value) => value * 4);

		// Assert.
		expect(value).toBe(12);
	});

	it('should wait for all PromiseLikes to resolve with the all method', async () => {
		// Arrange.
		const promises = [
			Promise.resolve(1),
			BliNeder.resolve(2),
			new Promise((resolve) => resolve(3)),
			new BliNeder((resolve) => resolve(4)),
		];

		// Act.
		const values = await BliNeder.all(promises);

		// Assert.
		expect(values).toEqual([1, 2, 3, 4]);
	});

	it('should resolve immediately when passing an empty array to the all method', async () => {
		// Act.
		const values = await BliNeder.all([]);

		// Assert.
		expect(values).toEqual([]);
	});

	it('should wait for all PromiseLikes to settle with the allSettled method', async () => {
		// Arrange.
		const promises = [
			Promise.resolve(1),
			BliNeder.reject('error 1'),
			new Promise((_, reject) => reject('error 2')),
			new BliNeder((resolve) => resolve(4)),
		];

		// Act.
		const values = await BliNeder.allSettled(promises);

		// Assert.
		expect(values).toEqual([
			{ status: 'fulfilled', value: 1 },
			{ status: 'rejected', reason: 'error 1' },
			{ status: 'rejected', reason: 'error 2' },
			{ status: 'fulfilled', value: 4 },
		]);
	});

	it('should wait for the first PromiseLike to resolve with the race method', async () => {
		// Arrange.
		const promises = [
			new BliNeder((_, reject) => setTimeout(() => reject(1), 200)),
			new Promise((resolve) => setTimeout(() => resolve(2), 100)),
			new Promise((resolve) => setTimeout(() => resolve(3), 300)),
		];

		// Act.
		const value = await BliNeder.race(promises);

		// Assert.
		expect(value).toBe(2);
	});

	it('should wait for the first PromiseLike to reject with the race method', () => {
		// Arrange.
		const promises = [
			new Promise((resolve) => setTimeout(() => resolve(1), 200)),
			new BliNeder((_, reject) => setTimeout(() => reject(2), 100)),
			new Promise((resolve) => setTimeout(() => resolve(3), 300)),
		];

		// Act & Assert.
		expect(() => BliNeder.race(promises)).rejects.toBe(2);
	});

	it('should wait for the first PromiseLike to resolve with the any method', async () => {
		// Arrange.
		const promises = [
			new Promise((_, reject) => setTimeout(() => reject(1), 100)),
			new Promise((resolve) => setTimeout(() => resolve(2), 200)),
			new Promise((resolve) => setTimeout(() => resolve(3), 300)),
		];

		// Act.
		const value = await BliNeder.any(promises);

		// Assert.
		expect(value).toBe(2);
	});

	it('should wait for all PromiseLikes to reject with the any method', async () => {
		// Arrange.
		const promises = [
			new BliNeder((_, reject) => reject(1)),
			new Promise((_, reject) => reject(2)),
			new Promise((_, reject) => reject(3)),
		];

		// Act & Assert.
		expect.assertions(2);

		try {
			await BliNeder.any(promises);
		} catch (e: any) {
			expect(e).instanceOf(AggregateError);
			expect(e.errors).toEqual([1, 2, 3]);
		}
	});

	it('should reject if the PromiseLikes array is empty when using the any method', () => {
		// Act & Assert.
		expect.assertions(2);

		BliNeder.any([]).catch((e: any) => {
			expect(e).instanceOf(AggregateError);
			expect(e.message).toBe('No Promise in BliNeder.any was resolved');
		});
	});

	it('should run the constructor executor synchronously', async () => {
		// Arrange.
		let number = 0;

		// Act.
		new BliNeder<number>((resolve) => {
			number = 42;

			resolve(42);
		});

		// Assert.
		expect(number).toBe(42);
	});

	it('should execute the chain asynchronously', async () => {
		// Arrange.
		let number = 0;

		// Act.
		new BliNeder<number>((resolve) => {
			resolve(42);
		}).then((value) => {
			number = value;

			return value;
		});

		// Assert.
		expect(number).toBe(0);
	});
});
