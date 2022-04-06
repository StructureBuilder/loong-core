import { observable, autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import { createBind } from '@/react-pure';

export const bind = createBind({
  observable,
  view: observer,
  observe: (observeFunction) => {
    const disposer = autorun(observeFunction);

    return disposer;
  },
});
