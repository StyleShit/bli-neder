import { describe, expect, it } from 'vitest';
import { BliNeder } from '../index';

describe('BliNeder', () => {
	describe('then', () => {
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
});
