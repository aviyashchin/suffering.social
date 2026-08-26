import {
  setAnimatedNumberText,
  tokenizeAnimatedNumberText,
} from './animated-number-text.js';

describe('animated number text', () => {
  test('preserves formatted text while isolating each numeric token', () => {
    expect(tokenizeAnimatedNumberText('50K × 18% = $122.1B')).toEqual([
      { kind: 'number', text: '50' },
      { kind: 'text', text: 'K × ' },
      { kind: 'number', text: '18' },
      { kind: 'text', text: '% = $' },
      { kind: 'number', text: '122.1' },
      { kind: 'text', text: 'B' },
    ]);
  });

  test('marks changed values with their direction and keeps one accessible value', () => {
    const output = document.createElement('output');

    setAnimatedNumberText(output, '$100');
    setAnimatedNumberText(output, '$125');

    expect(output).toHaveTextContent('$125');
    expect(output).toHaveAttribute('aria-label', '$125');
    expect(output.querySelectorAll('[data-animated-number-token]')).toHaveLength(1);
    expect(output.querySelector('[data-animated-number-token]')).toHaveAttribute(
      'data-direction',
      'up'
    );

    setAnimatedNumberText(output, '$90');
    expect(output.querySelector('[data-animated-number-token]')).toHaveAttribute(
      'data-direction',
      'down'
    );
  });

  test('does not animate numeric tokens that did not change', () => {
    const output = document.createElement('output');
    setAnimatedNumberText(output, '5M × 6 years = $100B');
    setAnimatedNumberText(output, '5M × 7 years = $100B');

    const directions = [...output.querySelectorAll('[data-animated-number-token]')]
      .map((token) => token.dataset.direction);
    expect(directions).toEqual(['none', 'up', 'none']);
  });
});
