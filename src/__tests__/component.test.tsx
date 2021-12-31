import { render } from '@testing-library/react';
import { bind, BoundProps, Component, connect, Injectable, Prop } from '@/index';
import { makeAutoObservable } from 'mobx';
import { FC, useEffect } from 'react';

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
// eslint-disable-next-line jest/no-export
export class AppComponent {
  count = 0;

  constructor(public service: Service) {
    makeAutoObservable(this);
  }

  increase = () => {
    this.count++;
  };
}

interface IAppProps extends PropsFromBinder {
  onMount?: (target: typeof AppComponent) => void;
  onChildMount?: (target: typeof AppComponent) => void;
}

interface IChildProps extends PropsFromBinder {
  onMount?: (target: typeof AppComponent) => void;
}

const binder = bind(AppComponent);

type PropsFromBinder = BoundProps<typeof binder>;

const Child = connect<AppComponent, IChildProps>(({ $this, onMount }) => {
  useEffect(() => {
    onMount?.((Reflect.getPrototypeOf($this) as any).constructor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>Child</div>;
});

const AppFC: FC<IAppProps> = ({ $this, onMount, onChildMount }) => {
  useEffect(() => {
    onMount?.((Reflect.getPrototypeOf($this) as any).constructor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Child onMount={onChildMount} />
      <p data-testid="count">{$this.count}</p>
      <p data-testid="service-count">{$this.service.count}</p>
      <button data-testid="increase-button" onClick={$this.increase}>
        increase
      </button>
      <button data-testid="service-increase-button" onClick={$this.service.increase}>
        service increase
      </button>
    </div>
  );
};

// eslint-disable-next-line jest/no-export
export const App = binder(AppFC);

describe('Component', () => {
  test('$this is an instance of the bound component', () => {
    const onMount = jest.fn();

    render(<App onMount={onMount} />);

    expect(onMount).toHaveBeenCalledWith(AppComponent);
  });
});
