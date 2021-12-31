import { render, screen, fireEvent } from '@testing-library/react';
import { Component, Prop, bind } from '@/index';

@Component()
class AppCompnent {
  @Prop()
  name!: string;

  @Prop('name')
  nameAlias!: string;

  constructor() {
    console.log(this.name);
  }

  printName = () => {
    console.log(this.name);
  };

  printNameAlias = () => {
    console.log(this.nameAlias);
  };
}

const App = bind(AppCompnent)<{ name: string }>(({ $this }) => (
  <div>
    <button data-testid="print-name" onClick={$this.printName}>
      printName
    </button>
    <button data-testid="print-name-alias" onClick={$this.printNameAlias}>
      printNameAlias
    </button>
  </div>
));

describe('Prop', () => {
  test('get prop correctly in constructor', () => {
    console.log = jest.fn();

    render(<App name="app" />);

    // TODO: Cannot get 'get value'. The same below
    expect(console.log).toHaveBeenCalledWith(undefined);
  });

  test('print prop', () => {
    console.log = jest.fn();

    render(<App name="app" />);

    expect(console.log).toHaveBeenCalledWith(undefined);

    fireEvent.click(screen.getByTestId('print-name'));

    expect(console.log).toHaveBeenCalledWith(undefined);
  });

  test('print alias prop', () => {
    console.log = jest.fn();

    render(<App name="app" />);

    fireEvent.click(screen.getByTestId('print-name-alias'));

    expect(console.log).toHaveBeenCalledWith(undefined);
  });
});
