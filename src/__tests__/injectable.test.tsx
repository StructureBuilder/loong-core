import { render, fireEvent, screen } from '@testing-library/react';
import { App } from './component.test';

describe('Injectable', () => {
  test('Using injected services', () => {
    render(<App />);

    expect(screen.getByTestId('service-count')).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('service-increase-button'));

    expect(screen.getByTestId('service-count')).toHaveTextContent('1');
  });
});
