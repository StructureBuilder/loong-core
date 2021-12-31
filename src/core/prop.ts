import { PROVIDER_CONTEXT, PROVIDER_WATCH } from '../constants';
import { globalContext } from './global-context';

export function Prop(propName?: string): any {
  return (target: any, key: string) => {
    if (!propName) {
      propName = key;
    }

    return {
      get(this: any) {
        // If current watcher is existed, Watcher.needObservedProps = true
        this[PROVIDER_WATCH]?.getCurrentWatcher()?.checkNeedObservedProps();
        if (this[PROVIDER_CONTEXT]) {
          return this[PROVIDER_CONTEXT].getProp(propName);
        }
        return globalContext.getProp(propName as string);
      },
    };
  };
}
