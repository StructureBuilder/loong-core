import { EventEmitter } from './event-emitter';

interface IContextOptions {
  props: any;
}

export type Hooks = Map<string, EventEmitter>;

export class GlobalContext {
  private props: any = {};

  private hooks: Hooks = new Map();

  setContext({
    props,
  }: IContextOptions) {
    this.props = props;
  }

  clearContext() {
    this.hooks = new Map();
    this.props = {};
  }

  addHook(hookName: string, hook: (...args: any[]) => void) {
    if (!this.hooks.get(hookName)) {
      this.hooks.set(hookName, new EventEmitter());
    }
    this.hooks.get(hookName)?.add(hook);
  }

  getHooks() {
    return this.hooks;
  }

  getProps() {
    return this.props;
  }

  getProp(propName: string) {
    return this.props?.[propName];
  }
}

export const globalContext = new GlobalContext();
