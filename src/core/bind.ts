import { observer } from 'mobx-react-lite';
import {
  createContext,
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
  useEffect,
  useState,
} from 'react';
import { IComponent, ICreateComponentResult } from './component';
import { DependencyMap } from './provider-registry';

export interface IBindContextValue<T = any> {
  dependencyMap: DependencyMap;
  $this: T;
}

export const BindContext = createContext<IBindContextValue>({
  dependencyMap: new Map(),
  $this: null,
});

export type PropsWith$This<T extends IComponent, P = Record<string, never>> = {
  $this: InstanceType<T>;
} & PropsWithChildren<P>;

export type PropsWithout$This<P> = Omit<P, '$this'>;

export type BoundProps<TBinder> = TBinder extends (
  ReactComponent:
    | FunctionComponent<PropsWith$This<infer T, Record<string, never>>>
    | ForwardRefRenderFunction<
        Record<string, never>,
        PropsWith$This<infer T, Record<string, never>>
      >,
  options?: IBinderOptions
) => any
  ? {
      $this: InstanceType<T>;
    }
  : never;

export interface IBinderOptions {
  forwardRef?: boolean;
}

export function createBind(initializer?: (result: ICreateComponentResult) => void) {
  function bind<T extends IComponent>(Component: T) {
    function binder<P extends object, TRef = Record<string, never>>(
      ReactComponent: ForwardRefRenderFunction<TRef, PropsWith$This<T, P>>,
      options?: IBinderOptions
    ): ForwardRefExoticComponent<
      PropsWithChildren<PropsWithoutRef<PropsWithout$This<P>>> & RefAttributes<TRef>
    >;
    function binder<P extends object>(
      ReactComponent: FunctionComponent<PropsWith$This<T, P>>,
      options?: IBinderOptions
    ): FunctionComponent<PropsWithout$This<P>>;
    function binder<P extends object, TRef = Record<string, never>>(
      ReactComponent:
        | FunctionComponent<PropsWith$This<T, P>>
        | ForwardRefRenderFunction<TRef, PropsWith$This<T, P>>,
      options?: IBinderOptions
    ) {
      ReactComponent = observer(ReactComponent, options);

      const WrappedComponent = (props: PropsWithChildren<PropsWithout$This<P>>, ref: Ref<TRef>) => {
        const context = useContext(BindContext);
        const [result] = useState(() =>
          (
            Component as Required<IComponent<T, PropsWithChildren<PropsWithout$This<P>>>>
          ).createComponent(props, context.dependencyMap)
        );
        const { component, dependencyMap, setProps, destroy, useWatcher, invokeHook } = result;
        const restProps: PropsWithChildren<PropsWithout$This<P>> & RefAttributes<TRef> = {
          ...props,
        };
        if (options?.forwardRef) {
          restProps.ref = ref;
        }
        setProps(props);
        useEffect(() => {
          invokeHook('mounted');
          useWatcher();
          return () => {
            invokeHook('unmount');
            destroy();
          };
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);
        initializer?.(result);
        return createElement(
          BindContext.Provider,
          {
            value: {
              dependencyMap,
              $this: component,
            },
          },
          createElement(ReactComponent, {
            $this: component,
            ...restProps,
          } as PropsWithChildren<PropsWith$This<T, P>>)
        );
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

    return binder;
  }

  return bind;
}

export const bind = createBind();
