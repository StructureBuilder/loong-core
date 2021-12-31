import { render, fireEvent, screen } from '@testing-library/react';
import { App } from './component.test';

describe('binding', () => {
  test('get data through $this', () => {
    render(<App />);

    expect(screen.getByTestId('count')).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('increase-button'));

    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});
