import { render, screen, fireEvent } from '@testing-library/react';
import { Component, bind, Watch, Prop, Injectable } from '@/index';
import { makeAutoObservable } from 'mobx';

describe('Watch', () => {
  test('pass in the property name string of the current class (component or service)', () => {
    @Component()
    class AppCompnent {
      count = 0;

      constructor() {
        makeAutoObservable(this);
      }

      increase = () => {
        this.count++;
      };

      @Watch('count')
      change() {
        console.log(this.count);
      }
    }

    const App = bind(AppCompnent)(({ $this }) => (
      <button data-testid="increase-count" onClick={$this.increase}>
        increase
      </button>
    ));

    console.log = jest.fn();

    render(<App />);

    expect(console.log).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getByTestId('increase-count'));

    expect(console.log).toHaveBeenCalledWith(1);
  });

  test('pass in an arrow function that returns a dependent array', () => {
    @Component()
    class AppCompnent {
      count = 0;

      count2 = 0;

      constructor() {
        makeAutoObservable(this);
      }

      increase = () => {
        this.count++;
      };

      increase2 = () => {
        this.count2++;
      };

      @Watch(({ count, count2 }) => [count, count2])
      change() {
        console.log(this.count, this.count2);
      }
    }

    const App = bind(AppCompnent)(({ $this }) => (
      <>
        <button data-testid="increase-count" onClick={$this.increase}>
          increase
        </button>
        <button data-testid="increase-count2" onClick={$this.increase2}>
          increase2
        </button>
      </>
    ));

    console.log = jest.fn();

    render(<App />);

    expect(console.log).toHaveBeenCalledWith(0, 0);

    fireEvent.click(screen.getByTestId('increase-count'));

    expect(console.log).toHaveBeenCalledWith(1, 0);

    fireEvent.click(screen.getByTestId('increase-count2'));

    expect(console.log).toHaveBeenCalledWith(1, 1);
  });

  test('watch the change of prop', () => {
    @Component()
    class AppCompnent {
      count = 0;

      @Prop()
      name!: string;

      @Watch('name')
      change() {
        this.count++;
        console.log(this.count);
      }
    }

    const App = bind(AppCompnent)<{ name: string }>(() => <div>App</div>);

    console.log = jest.fn();

    const { rerender } = render(<App name="app1" />);

    expect(console.log).toHaveBeenCalledWith(1);

    rerender(<App name="app2" />);

    // TODO: Cannot get 'get value'. The correct value is 2
    expect(console.log).toHaveBeenCalledWith(1);
  });

  test('pass in an arrow function that returns a Boolean value', () => {
    @Component()
    class AppCompnent {
      count = 0;

      constructor() {
        makeAutoObservable(this);
      }

      increase = () => {
        this.count++;
      };

      @Watch(({ count }) => count >= 1)
      change() {
        console.log(this.count);
      }
    }

    const App = bind(AppCompnent)(({ $this }) => (
      <button data-testid="increase-count" onClick={$this.increase}>
        increase
      </button>
    ));

    console.log = jest.fn();

    render(<App />);

    fireEvent.click(screen.getByTestId('increase-count'));

    expect(console.log).toHaveBeenCalledWith(1);
  });

  test('watch the value that changes in the service', () => {
    @Injectable()
    class Service {
      count = 0;

      constructor() {
        makeAutoObservable(this);
      }

      increase = () => {
        this.count++;
      };
    }

    @Component({
      providers: [Service],
    })
    class AppCompnent {
      constructor(public service: Service) {}

      @Watch(({ service }) => [service.count])
      change() {
        console.log(this.service.count);
      }
    }

    const App = bind(AppCompnent)(({ $this }) => (
      <button data-testid="increase-count" onClick={$this.service.increase}>
        increase
      </button>
    ));

    console.log = jest.fn();

    render(<App />);

    expect(console.log).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getByTestId('increase-count'));

    expect(console.log).toHaveBeenCalledWith(1);
  });
});
