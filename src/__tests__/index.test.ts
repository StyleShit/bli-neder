import { describe, expect, it } from 'vitest';
import helloWorld from '../index';

describe('BliNeder', () => {
	it('should return "Hello World!"', () => {
		expect(helloWorld()).toBe('Hello World!');
	});
});
