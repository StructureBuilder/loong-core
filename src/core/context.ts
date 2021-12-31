import { Hooks } from './global-context';
import { WatchContext } from './watch-context';

export class Context {
  private watchContextList: WatchContext[] = [];

  constructor(
    private props: any = {},
    private hooks: Hooks,
  ) {}

  collectWatchContext(watchContext: WatchContext) {
    this.watchContextList.push(watchContext);
  }

  getProps() {
    return this.props;
  }

  getProp(propName: string) {
    return this.props?.[propName];
  }

  getHooks() {
    return this.hooks;
  }

  setProps = (props: any) => {
    this.props = props;
    this.watchContextList.forEach(watchContext => watchContext.runAllWatcher());
  }

  destroy = () => {
    this.watchContextList.forEach(watchContext => watchContext.destroy());
  }

  useWatcher = () => {
    this.watchContextList.forEach(watchContext => watchContext.useAllWatcher());
  }
}
