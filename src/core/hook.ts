import { PROVIDER_HOOK_NAMES } from '../constants';

export function Hook(hookName?: string): any {
  return (target: any, key: string, { value }: PropertyDescriptor) => {
    if (!hookName) {
      hookName = key;
    }
    if (!target[PROVIDER_HOOK_NAMES]) {
      target[PROVIDER_HOOK_NAMES] = [];
    }
    target[PROVIDER_HOOK_NAMES].push([key, hookName]);

    return {
      get() {
        return value.bind(this);
      },
    };
  };
}
