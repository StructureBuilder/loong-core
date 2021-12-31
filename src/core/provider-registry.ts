import {
  PROVIDER_CONTEXT,
  PROVIDER_HOOK_NAMES,
  PROVIDER_WATCH,
  PROVIDER_WATCH_NAMES,
} from '../constants';
import { IClassType } from './component';
import { Context } from './context';
import { globalContext } from './global-context';

export enum ProviderType {
  DEPENDENCY = 'dependency',
  LOCAL = 'local',
}

export interface IProviderValue {
  type: ProviderType;
  provider: any;
}

export type ProviderMap = Map<IClassType, IProviderValue>;

export type DependencyMap = Map<IClassType, any>;

export class ProviderRegistry {
  private providerMap: ProviderMap = new Map();

  constructor(
    private props: any,
    private component: IClassType,
    private dependencyMap: DependencyMap = new Map(),
    private providers: IClassType[] = []
  ) {
    this.setDependencyMap();
    globalContext.setContext({
      props: this.props,
    });
    this.register(this.providers);
    this.register(this.component);
    this.bindContext();
    globalContext.clearContext();
  }

  private setDependencyMap() {
    this.dependencyMap.forEach((value, key) => {
      this.providerMap.set(key, {
        type: ProviderType.DEPENDENCY,
        provider: value,
      });
    });
  }

  private internalRegister(Provider: IClassType) {
    const paramtypes: IClassType[] = Reflect.getMetadata('design:paramtypes', Provider) || [];
    const provider = new Provider(
      ...paramtypes.map((paramtype) => this.getProvider(paramtype)?.provider)
    );
    this.providerMap.set(Provider, {
      provider,
      type: ProviderType.LOCAL,
    });
    provider[PROVIDER_HOOK_NAMES]?.forEach(([methodName, hookName]: [string, string]) => {
      globalContext.addHook(hookName, provider[methodName]);
    });
    provider[PROVIDER_WATCH_NAMES]?.forEach((methodName: string) => provider[methodName]());
  }

  private bindContext() {
    const component = this.getProvider(this.component)?.provider;
    const context = new Context(globalContext.getProps(), globalContext.getHooks());
    this.providerMap.forEach(({ type, provider }) => {
      if (type === ProviderType.LOCAL) {
        provider[PROVIDER_CONTEXT] = context;
        if (provider[PROVIDER_WATCH]) {
          context.collectWatchContext(provider[PROVIDER_WATCH]);
        }
      }
    });
    component[PROVIDER_CONTEXT] = context;
  }

  private register(providers: IClassType | IClassType[]) {
    if (!Array.isArray(providers)) {
      providers = [providers];
    }
    providers.forEach((provider: any) => {
      this.internalRegister(provider);
    });
  }

  getProviderMap(): DependencyMap {
    const entries: [any, IProviderValue][] = [];
    this.providerMap.forEach((value, key) => {
      entries.push([key, value.provider]);
    });
    return new Map(entries);
  }

  getProvider(provider: IClassType) {
    return this.providerMap.get(provider);
  }

  getProviders() {
    return Array.from(this.providerMap.values());
  }
}
