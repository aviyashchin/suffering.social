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

  test('moves only the digit wheels whose displayed digits changed', () => {
    const output = document.createElement('output');
    setAnimatedNumberText(output, '$2,355,067,085,577');
    setAnimatedNumberText(output, '$2,355,067,085,578');

    const digits = [
      ...output.querySelectorAll('[data-animated-number-digit]'),
    ];
    expect(digits).toHaveLength(13);
    expect(
      digits.filter((digit) => digit.dataset.direction === 'up')
    ).toHaveLength(1);
    expect(
      digits.filter((digit) => digit.dataset.direction === 'none')
    ).toHaveLength(12);
    expect(output).toHaveTextContent('$2,355,067,085,578');
  });

  test('turns lower place-value wheels when a higher wheel carries', () => {
    const output = document.createElement('output');
    setAnimatedNumberText(output, '$100');
    setAnimatedNumberText(output, '$110');

    const digits = [
      ...output.querySelectorAll('[data-animated-number-digit]'),
    ];
    expect(digits.map((digit) => digit.dataset.placeValue)).toEqual([
      '100',
      '10',
      '1',
    ]);
    expect(digits.map((digit) => digit.dataset.direction)).toEqual([
      'none',
      'up',
      'up',
    ]);
    expect(digits.map((digit) => digit.dataset.wheelSteps)).toEqual([
      '0',
      '1',
      '10',
    ]);
  });

  test('preserves an active directional node across an identical formatted write', () => {
    const output = document.createElement('output');
    setAnimatedNumberText(output, '$100');
    setAnimatedNumberText(output, '$125');
    const activeToken = output.querySelector('[data-animated-number-token]');

    setAnimatedNumberText(output, '$125');

    expect(output.querySelector('[data-animated-number-token]')).toBe(activeToken);
    expect(activeToken).toHaveAttribute('data-direction', 'up');
  });
});
