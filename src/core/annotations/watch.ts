import { IProviderConstructor } from './component';

export interface IWatchParameters {
  predicate?: Predicate;
  names?: string[];
}

export const targetToWatchNameAndKeys = new WeakMap<
  IProviderConstructor,
  [string | symbol, IWatchParameters][]
>();

export type Predicate<T = any> = ($this: T) => boolean | (keyof T)[];

export function Watch(predicate: Predicate): MethodDecorator;
export function Watch(...names: string[]): MethodDecorator;
export function Watch(...args: (Predicate | string)[]): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (!targetToWatchNameAndKeys.has(target.constructor)) {
      targetToWatchNameAndKeys.set(target.constructor, []);
    }
    const parameters: IWatchParameters = {};
    if (typeof args[0] === 'function') {
      parameters.predicate = args[0];
    } else {
      parameters.names = args as string[];
    }
    targetToWatchNameAndKeys.get(target.constructor)?.push([propertyKey, parameters]);

    return descriptor;
  };
}
