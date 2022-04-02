import { useEffect, useMemo } from 'react';
import { observe, unobserve } from '..';
import { useForceUpdate } from './hooks/use-force-update';

export function observer<P extends object>(Component: React.FunctionComponent<P>) {
  return (...args: any[]) => {
    const forceUpdate = useForceUpdate();
    const render = useMemo(
      () =>
        observe(Component, {
          lazy: true,
          scheduler: forceUpdate,
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    useEffect(() => {
      return () => {
        unobserve(render);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return render(...args);
  };
}
