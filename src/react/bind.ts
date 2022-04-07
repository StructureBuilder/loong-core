import { observable, observe, unobserve } from '@/observer';
import { IObservableOptions } from '@/observer/observable';
import { createBind } from '@/react-pure';
import { checkAction } from './check-action';
import { observer } from './observer';

export const bind = createBind({
  view: observer,
  observable(target, options?: IObservableOptions) {
    return observable(target, {
      checkAction,
      ...options,
    });
  },
  observe(observeFunction) {
    const runner = observe(observeFunction);

    return () => {
      unobserve(runner);
    };
  },
});
