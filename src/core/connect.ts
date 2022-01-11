import { observer } from 'mobx-react-lite';
import {
  createElement,
  forwardRef,
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  FunctionComponent,
  PropsWithChildren,
  PropsWithoutRef,
  Ref,
  RefAttributes,
  useContext,
} from 'react';
import { IBindContextValue, PropsWithout$This } from '..';
import { BindContext } from './bind';

type PropsWith$This<T, P> = {
  $this: T;
} & PropsWithChildren<P>;

interface IConnectOptions {
  forwardRef?: boolean;
}

export function connect<T, P extends object = Record<string, unknown>>(
  ReactComponent: FunctionComponent<PropsWith$This<T, P>>,
  options?: IConnectOptions
): FunctionComponent<PropsWithout$This<P>>;
export function connect<
  T,
  P extends object = Record<string, unknown>,
  TRef = Record<string, never>
>(
  ReactComponent: ForwardRefRenderFunction<TRef, PropsWith$This<T, P>>,
  options?: IConnectOptions
): ForwardRefExoticComponent<
  PropsWithChildren<PropsWithoutRef<PropsWithout$This<P>>> & RefAttributes<TRef>
>;
export function connect<
  T,
  P extends object = Record<string, unknown>,
  TRef = Record<string, never>
>(
  ReactComponent:
    | ForwardRefRenderFunction<TRef, PropsWith$This<T, P>>
    | FunctionComponent<PropsWith$This<T, P>>,
  options?: IConnectOptions
) {
  ReactComponent = observer(ReactComponent, options);
  const WrappedComponent = (props: PropsWithChildren<PropsWithout$This<P>>, ref: Ref<TRef>) => {
    const { $this } = useContext<IBindContextValue<T>>(BindContext);
    const restProps: PropsWithChildren<PropsWithout$This<P>> & RefAttributes<TRef> = { ...props };
    if (options?.forwardRef) {
      restProps.ref = ref;
    }
    return createElement(ReactComponent, {
      $this,
      ...restProps,
    } as PropsWithChildren<PropsWith$This<T, P>> & RefAttributes<TRef>);
  };
  WrappedComponent.displayName = ReactComponent.displayName;
  if ((ReactComponent as FunctionComponent<PropsWith$This<T, P>>).contextTypes) {
    WrappedComponent.contextTypes = (
      ReactComponent as FunctionComponent<PropsWith$This<T, P>>
    ).contextTypes;
  }

  if (options?.forwardRef) {
    return forwardRef(WrappedComponent);
  }

  return WrappedComponent;
}
