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

export function setAnimatedNumberText(element, value) {
  if (!element) return;
  const text = String(value);
  const tokens = tokenizeAnimatedNumberText(text);
  const numbers = tokens
    .filter((token) => token.kind === 'number')
    .map((token) => numericValue(token.text));
  const previousNumbers = JSON.parse(
    element.dataset.animatedNumberValues || '[]'
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
    const clip = document.createElement('span');
    clip.className = 'animated-number-clip';
    clip.dataset.animatedNumberToken = String(numberIndex);
    clip.dataset.direction = direction;
    const visible = document.createElement('span');
    visible.className = 'animated-number-value';
    visible.textContent = token.text;
    clip.append(visible);
    fragment.append(clip);
    numberIndex += 1;
  });

  element.replaceChildren(fragment);
  element.dataset.animatedNumberText = '';
  element.dataset.animatedNumberValues = JSON.stringify(numbers);
  element.setAttribute('aria-label', text);
}
