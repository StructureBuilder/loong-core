import { autorun, IReactionDisposer } from 'mobx';
import { Data } from './watch';

export enum WatchType {
  DEPENDENCY,
  PREDICATE
}

class Watcher {
  private dependencyList: any[] = [];

  private needObservedProps = false;

  private firstDependency = true;

  private firstRun = true;

  private disposer?: IReactionDisposer;

  constructor(
    private watchContext: WatchContext,
    private scope: any,
    private type: WatchType,
    private effect: () => void,
    private predicate: Data,
    private names: string[],
  ) {}

  private wrapper<T extends(() => any)>(fn: T): ReturnType<T> {
    this.watchContext.setCurrentWatcher(this);
    const result = fn();
    this.watchContext.clearCurrentWatcher();
    return result;
  }

  private checkDependencyList(currentDependencyList: any[]) {
    if (
      this.firstDependency
      || currentDependencyList.some(
        (dependency, index) => this.dependencyList[index] !== dependency,
      )
    ) {
      this.firstDependency = false;
      this.dependencyList = currentDependencyList;
      return true;
    }
    return false;
  }

  private runner = () => {
    const effect = this.effect.bind(this.scope);
    if (this.type === WatchType.PREDICATE) {
      const result = this.wrapper(() => this.predicate(this.scope));
      if (
        (Array.isArray(result) && this.checkDependencyList(result))
        || (typeof result === 'boolean' && result)
      ) {
        effect();
      }
      return;
    }
    const currentDependencyList = this.wrapper(() => this.names.map(name => this.scope[name]));
    if (
      this.type === WatchType.DEPENDENCY && this.checkDependencyList(currentDependencyList)
    ) {
      effect();
    }
  }

  private runAfterCheckObservedProps() {
    if (this.needObservedProps) {
      this.runner();
    }
  }

  checkNeedObservedProps() {
    this.needObservedProps = true;
  }

  useWatcher() {
    this.disposer = autorun(this.runner);
  }

  manualRun() {
    if (this.firstRun) {
      // Don't run for the first time, because autorun will automatically observe
      this.firstRun = false;
      return;
    }
    if (!this.disposer) {
      return;
    }
    this.runAfterCheckObservedProps();
  }

  destroy() {
    this.disposer?.();
  }
}

export class WatchContext {
  private currentWatcher?: Watcher;

  private watcherList: Watcher[] = [];

  constructor(private scope: any) {}

  setCurrentWatcher(watcher: Watcher) {
    this.currentWatcher = watcher;
  }

  clearCurrentWatcher() {
    this.currentWatcher = undefined;
  }

  getCurrentWatcher() {
    return this.currentWatcher as Watcher;
  }

  registerWatcher(
    type: WatchType,
    effect: () => void,
    predicate: Data,
    names: string[],
  ) {
    this.watcherList.push(
      new Watcher(
        this,
        this.scope,
        type,
        effect,
        predicate,
        names,
      ),
    );
  }

  runAllWatcher() {
    this.watcherList.forEach(watcher => watcher.manualRun());
  }

  useAllWatcher() {
    this.watcherList.forEach(watcher => watcher.useWatcher());
  }

  destroy() {
    this.watcherList.forEach(watcher => watcher.destroy());
  }
}
