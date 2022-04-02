import { endBatch, startBatch } from './batch-updates';
import { ACTIONS, OPTIONS } from './constants/key-cache';
import { rawToProxyMap } from './observable';
import { disableAllowStateUpdates, enableAllowStateUpdates } from './state-updates';
import { getKeyCache, setKeyCache } from './utils/key-cache';

export function createAction(target: object, key: unknown, action: GeneratorFunction) {
  const result = getKeyCache(target, key, ACTIONS);

  if (result) {
    return result;
  }

  const autoBind = getKeyCache<boolean>(target, OPTIONS, 'autoBind');
  const strict = getKeyCache<boolean>(target, OPTIONS, 'strict');
  let scope: any;

  if (autoBind !== false) {
    const proxy = rawToProxyMap.get(target);
    scope = proxy;
  }

  const internalAction = createFlow(action, scope, strict !== false);

  setKeyCache(target, key, {
    [ACTIONS]: internalAction,
  });

  return internalAction;
}

function executeAction(action: Function, scope: any, strict: boolean, ...args: any[]) {
  try {
    enableAllowStateUpdates(strict);
    startBatch();
    return action.apply(scope, args);
  } finally {
    endBatch();
    disableAllowStateUpdates();
  }
}

function createFlow(action: GeneratorFunction, scope: any, strict: boolean) {
  return function (this: any, ...args: any[]) {
    scope = scope || this;

    return new Promise((resolve, reject) => {
      const generator = action.apply(scope, args);

      function onFulfilled(value: any) {
        return step(() => executeAction(generator.next, generator, strict, value));
      }

      function onRejected(reason: any) {
        return step(() => executeAction(generator.throw, generator, strict, reason));
      }

      function step(next: Function) {
        let result: IteratorResult<any>;

        try {
          result = next();
        } catch (error) {
          return reject(error);
        }

        if (result.done) {
          return resolve(result.value);
        }

        Promise.resolve(result).then(onFulfilled, onRejected);
      }

      onFulfilled(undefined);
    });
  };
}
