# BliNeder

A jewish implementation of [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) in TypeScript.

## Installation

Install the package from npm using your favorite package manager:

```bash
npm i bli-neder
```

## Usage

Import the package in your code, and use it as you would use a regular Promise:

```typescript
import { BliNeder } from 'bli-neder';

// Basic usage:
new BliNeder((resolve, reject) => {
	resolve('Success!');
});

// Static methods:
const resolvedNeder = BliNeder.resolve('Success!');

const rejectedNeder = BliNeder.reject('Error!');

const allNeders = BliNeder.all([resolvedNeder, rejectedNeder]);

const allSettledNeders = BliNeder.allSettled([resolvedNeder, rejectedNeder]);

const racedNeders = BliNeder.race([resolvedNeder, rejectedNeder]);

const anyNeders = BliNeder.any([resolvedNeder, rejectedNeder]);

// Chaining:
BliNeder.reject('Error!')
	.then((value) => {
		return 'Success!';
	})
	.catch((error) => {
		return 'Error!';
	})
	.finally(() => {
		return 'Finally!';
	});
```

## Available Methods

-   `BliNeder.prototype.then(onFulfilled, onRejected)` - See [`Promise.prototype.then`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)

-   `BliNeder.prototype.catch(onRejected)` - See [`Promise.prototype.catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch)

-   `BliNeder.prototype.finally(onFinally)` - See [`Promise.prototype.finally`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally)

-   `BliNeder.resolve(value)` - See [`Promise.resolve`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve)

-   `BliNeder.reject(reason)` - See [`Promise.reject`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject)

-   `BliNeder.all(promises)` - See [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

-   `BliNeder.allSettled(promises)` - See [`Promise.allSettled`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)

-   `BliNeder.race(promises)` - See [`Promise.race`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)

-   `BliNeder.any(promises)` - See [`Promise.any`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)
