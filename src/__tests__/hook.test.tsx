import { render } from '@testing-library/react';
import { Component, Hook, Injectable, bind } from '@/index';

describe('Hook', () => {
  test('trigger hook on component', () => {
    @Component()
    class AppCompnent {
      @Hook()
      mounted() {
        console.log('mounted');
      }

      @Hook()
      unmount() {
        console.log('unmount');
      }
    }

    const App = bind(AppCompnent)(() => <div>App</div>);

    console.log = jest.fn();

    const { unmount } = render(<App />);

    expect(console.log).toHaveBeenCalledWith('mounted');

    unmount();

    expect(console.log).toHaveBeenCalledWith('unmount');
  });

  test('trigger alias hook', () => {
    @Component()
    class AppCompnent {
      @Hook('mounted')
      mountedAlias() {
        console.log('mountedAlias');
      }

      @Hook('unmount')
      unmountAlias() {
        console.log('unmountAlias');
      }
    }

    const App = bind(AppCompnent)(() => <div>App</div>);

    console.log = jest.fn();

    const { unmount } = render(<App />);

    expect(console.log).toHaveBeenCalledWith('mountedAlias');

    unmount();

    expect(console.log).toHaveBeenCalledWith('unmountAlias');
  });

  test('trigger hook on service', () => {
    @Injectable()
    class Service {
      @Hook()
      mounted() {
        console.log('mounted');
      }

      @Hook()
      unmount() {
        console.log('unmount');
      }
    }

    @Component({
      providers: [Service],
    })
    class AppCompnent {}

    const App = bind(AppCompnent)(() => <div>App</div>);

    console.log = jest.fn();

    const { unmount } = render(<App />);

    expect(console.log).toHaveBeenCalledWith('mounted');

    unmount();

    expect(console.log).toHaveBeenCalledWith('unmount');
  });
});
