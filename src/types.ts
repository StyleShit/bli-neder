export type ResolveCallback<T = any> = (value: T | PromiseLike<T>) => void;

export type RejectCallback = (reason?: any) => void;
