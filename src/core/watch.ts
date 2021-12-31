import { PROVIDER_WATCH, PROVIDER_WATCH_NAMES } from '../constants';
import { WatchContext, WatchType } from './watch-context';

export type Data = ($this: any) => boolean | any[];

export function Watch(data: Data): any;
export function Watch(...names: string[]): any;
export function Watch(...args: (Data | string)[]): any {
  return (target: any, key: string, { value }: PropertyDescriptor) => {
    if (!target[PROVIDER_WATCH_NAMES]) {
      target[PROVIDER_WATCH_NAMES] = [];
    }
    target[PROVIDER_WATCH_NAMES].push(key);

    return {
      value(this: any) {
        if (!this[PROVIDER_WATCH]) {
          this[PROVIDER_WATCH] = new WatchContext(this);
        }
        this[PROVIDER_WATCH].registerWatcher(
          typeof args[0] === 'function' ? WatchType.PREDICATE : WatchType.DEPENDENCY,
          value.bind(this),
          args[0] as Data,
          args as string[],
        );
      },
    };
  };
}
