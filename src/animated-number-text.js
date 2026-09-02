const NUMBER_TOKEN = /[+−-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?/g;

// Vanilla adapter for the design system's compact AnimatedNumberText contract.
// Live derived values settle directionally; static research copy stays still.

export function tokenizeAnimatedNumberText(input) {
  const text = String(input);
  const tokens = [];
  let cursor = 0;

  for (const match of text.matchAll(NUMBER_TOKEN)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      tokens.push({ kind: 'text', text: text.slice(cursor, index) });
    }
    tokens.push({ kind: 'number', text: match[0] });
    cursor = index + match[0].length;
  }

  if (cursor < text.length) {
    tokens.push({ kind: 'text', text: text.slice(cursor) });
  }
  return tokens.length ? tokens : [{ kind: 'text', text }];
}

function numericValue(text) {
  return Number(text.replaceAll(',', '').replace('−', '-'));
}

function digitPlaces(text) {
  const decimalIndex = text.indexOf('.');
  const integerText = decimalIndex === -1 ? text : text.slice(0, decimalIndex);
  const integerDigits = [...integerText].filter((character) => /\d/.test(character))
    .length;
  let digitIndex = 0;

  return [...text].map((character) => {
    if (!/\d/.test(character)) return { character };
    const placeValue = 10 ** (integerDigits - digitIndex - 1);
    digitIndex += 1;
    return { character, placeValue };
  });
}

function wheelPosition(value, placeValue) {
  return Math.floor(Math.abs(value) / placeValue + Number.EPSILON * 10);
}

function createAnimatedNumberToken(
  token,
  tokenIndex,
  previousText,
  direction,
  previousValue,
  currentValue
) {
  const wrapper = document.createElement('span');
  wrapper.className = 'animated-number-token';
  wrapper.dataset.animatedNumberToken = String(tokenIndex);
  wrapper.dataset.direction = direction;

  let digitIndex = 0;

  for (const { character, placeValue } of digitPlaces(token.text)) {
    if (!/\d/.test(character)) {
      wrapper.append(document.createTextNode(character));
      continue;
    }

    const previousPosition = wheelPosition(previousValue || 0, placeValue);
    const currentPosition = wheelPosition(currentValue, placeValue);
    const wheelSteps =
      previousText == null ? 0 : Math.abs(currentPosition - previousPosition);
    const digitDirection =
      previousText != null && wheelSteps > 0 ? direction : 'none';
    const clip = document.createElement('span');
    clip.className = 'animated-number-clip';
    clip.dataset.animatedNumberDigit = `${tokenIndex}-${digitIndex}`;
    clip.dataset.direction = digitDirection;
    clip.dataset.placeValue = String(placeValue);
    clip.dataset.wheelSteps = String(wheelSteps);
    clip.dataset.previousDigit = String(previousPosition % 10);
    const visible = document.createElement('span');
    visible.className = 'animated-number-value';
    visible.textContent = character;
    clip.append(visible);
    wrapper.append(clip);
    digitIndex += 1;
  }

  return wrapper;
}

export function setAnimatedNumberText(element, value) {
  if (!element) return;
  const text = String(value);
  if (
    element.hasAttribute('data-animated-number-text') &&
    element.getAttribute('aria-label') === text
  ) {
    return;
  }
  const tokens = tokenizeAnimatedNumberText(text);
  const numbers = tokens
    .filter((token) => token.kind === 'number')
    .map((token) => numericValue(token.text));
  const previousNumbers = JSON.parse(
    element.dataset.animatedNumberValues || '[]'
  );
  const previousTokens = JSON.parse(
    element.dataset.animatedNumberTokens || '[]'
  );
  let numberIndex = 0;
  const fragment = document.createDocumentFragment();

  tokens.forEach((token) => {
    if (token.kind === 'text') {
      fragment.append(document.createTextNode(token.text));
      return;
    }

    const previous = previousNumbers[numberIndex];
    const current = numbers[numberIndex];
    const direction =
      previous == null || current === previous
        ? 'none'
        : current > previous
          ? 'up'
          : 'down';
    fragment.append(
      createAnimatedNumberToken(
        token,
        numberIndex,
        previousTokens[numberIndex],
        direction,
        previous,
        current
      )
    );
    numberIndex += 1;
  });

  element.replaceChildren(fragment);
  element.dataset.animatedNumberText = '';
  element.dataset.animatedNumberValues = JSON.stringify(numbers);
  element.dataset.animatedNumberTokens = JSON.stringify(
    tokens.filter((token) => token.kind === 'number').map((token) => token.text)
  );
  element.setAttribute('aria-label', text);
}
