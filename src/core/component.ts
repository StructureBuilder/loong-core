import { PROVIDER_CONTEXT } from '../constants';
import { Context } from './context';
import { DependencyMap, ProviderMap, ProviderRegistry } from './provider-registry';

export interface IClassType extends Function {
  new (...args: any[]): any;
}

export interface IComponent<T extends IClassType = any, P = any> extends IClassType {
  createComponent?: (props: P, dependencyMap: ProviderMap) => ICreateComponentResult<T, P>;
}

export interface ICreateComponentResult<T extends IClassType = any, P = any> {
  component: InstanceType<T>;
  invokeHook: (hookName: string, ...args: any[]) => void;
  dependencyMap: DependencyMap;
  setProps: (props: P) => void;
  destroy: () => void;
  useWatcher: () => void;
}

interface IComponentOptions {
  providers: IClassType[];
}

export function Component<T extends IClassType>(options?: IComponentOptions) {
  return (CurrentComponent: IComponent<T>) => {
    CurrentComponent.createComponent = (props, dependencyMap) => {
      const providerRegistry = new ProviderRegistry(
        props,
        CurrentComponent,
        dependencyMap,
        options?.providers
      );
      const component = providerRegistry.getProvider(CurrentComponent)?.provider;
      const context = component[PROVIDER_CONTEXT] as Context;
      return {
        component,
        dependencyMap: providerRegistry.getProviderMap(),
        setProps: context.setProps,
        destroy: context.destroy,
        useWatcher: context.useWatcher,
        invokeHook(hookName: string, ...args: any[]) {
          context
            .getHooks()
            .get(hookName)
            ?.emit(...args);
        },
      };
    };
    return CurrentComponent;
  };
}
