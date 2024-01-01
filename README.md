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
const raceBliNeders = BliNeder.race([resolvedNeder, rejectedNeder]);

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

## Available Nethods

-   `BliNeder.prototype.then(onFulfilled, onRejected)`

-   `BliNeder.prototype.catch(onRejected)`

-   `BliNeder.prototype.finally(onFinally)`

-   `BliNeder.resolve(value)`

-   `BliNeder.reject(reason)`

-   `BliNeder.all(promises)`

-   `BliNeder.allSettled(promises)`

-   `BliNeder.race(promises)`
