import { ComponentRegistryOptions, IProviderConstructor, Provider } from './annotations/component';
import { injectableTargetMap } from './annotations/injectable';
import { error } from './utils/error';

// Prevent circular dependency.
enum ProviderStatus {
  INSTANTIATING,
  INSTANTIATED,
}

interface IProvider {
  status: ProviderStatus;
  instance?: any;
}

export class ProviderRegistry {
  private providerMap = new Map<IProviderConstructor, IProvider>();

  private dependencyMap = new Map<IProviderConstructor, any>();

  // Create a path that allows the provider to find its corresponding actual provider.
  private providerToClassProvider = new Map<
    IProviderConstructor | Function,
    IProviderConstructor
  >();

  private providerInstances: any[] = [];

  get providers() {
    return this.options.providers || [];
  }

  get dependencies() {
    return this.options.dependencies || [];
  }

  constructor(private component: IProviderConstructor, private options: ComponentRegistryOptions) {
    this.initializeMap();
    this.registerProviders(this.providers);
    this.registerProvider(component);
    this.providerMap.forEach((provider) => this.providerInstances.push(provider?.instance));
  }

  private initializeMap() {
    this.dependencies.forEach((dependency) =>
      this.dependencyMap.set(dependency.constructor, dependency)
    );
  }

  private registerProvider(provider: Provider, instantiatingProvider?: IProviderConstructor) {
    let Provider: IProviderConstructor | null = null;

    // Add a path only if the provider is different from the actual provider.
    if (
      typeof provider === 'object' &&
      provider.provide &&
      provider.useClass &&
      provider.provide !== provider.useClass
    ) {
      Provider = provider.useClass;
      this.providerToClassProvider.set(provider.provide, provider.useClass);
    } else if (typeof provider === 'function') {
      Provider = provider;
    }

    if (!Provider) {
      return;
    }

    // Check whether the provider is registered with injectable.
    if (this.component !== Provider && !injectableTargetMap.has(Provider)) {
      error(`${Provider.name} is not registered with injectable`);
    }

    if (this.providerMap.get(Provider)?.status === ProviderStatus.INSTANTIATED) {
      return;
    }

    if (this.providerMap.get(Provider)?.status === ProviderStatus.INSTANTIATING) {
      error(
        `Circular dependency found ${Provider.name} -> ${instantiatingProvider?.name} -> ${Provider.name}`
      );
    }

    this.providerMap.set(Provider, {
      status: ProviderStatus.INSTANTIATING,
    });

    const paramtypes: IProviderConstructor[] =
      Reflect.getMetadata('design:paramtypes', Provider) || [];

    // Register dependent providers first.
    this.registerProviders(
      paramtypes.map((paramtype) => this.getProviderType(paramtype)),
      Provider
    );

    let instance = new Provider(...paramtypes.map((paramtype) => this.getProvider(paramtype)));

    if (this.options.observable) {
      instance = this.options.observable(instance);
    }

    this.providerMap.set(Provider, {
      instance,
      status: ProviderStatus.INSTANTIATED,
    });
  }

  private registerProviders(providers: Provider[], instantiatingProvider?: IProviderConstructor) {
    providers.forEach((provider: any) => {
      this.registerProvider(provider, instantiatingProvider);
    });
  }

  private getProviderType(provider: IProviderConstructor) {
    return this.providerToClassProvider.has(provider)
      ? (this.providerToClassProvider.get(provider) as IProviderConstructor)
      : provider;
  }

  getProvider(provider: IProviderConstructor) {
    provider = this.getProviderType(provider);
    return this.providerMap.get(provider)?.instance || this.dependencyMap.get(provider);
  }

  getProviders() {
    return this.providerInstances;
  }
}
