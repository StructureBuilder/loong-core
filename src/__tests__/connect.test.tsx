import { render } from '@testing-library/react';
import { App, AppComponent } from './component.test';

describe('Component', () => {
  test('$this is an instance of the connected component', () => {
    const onMount = jest.fn();

    render(<App onChildMount={onMount} />);

    expect(onMount).toHaveBeenCalledWith(AppComponent);
  });
});
