import {
  curvePath,
  curveMarkerPercent,
  initializeRangeCurves,
} from './range-curves.js';

describe('research range curves', () => {
  test('maps values to their honest position inside a cited range', () => {
    expect(curveMarkerPercent(7, 7, 14)).toBe(0);
    expect(curveMarkerPercent(10.5, 7, 14)).toBe(50);
    expect(curveMarkerPercent(14, 7, 14)).toBe(100);
    expect(curveMarkerPercent(20, 7, 14)).toBe(100);
  });

  test('keeps a curve marker synchronized with its calculator control', () => {
    document.body.innerHTML = `
      <div id="vsl-nouislider"></div>
      <figure class="range-curve" data-parameter="vsl">
        <svg><path class="range-curve-fill"></path><path class="range-curve-line"></path></svg>
        <span class="range-curve-marker"></span>
        <output class="range-curve-current"></output>
      </figure>
    `;
    let updateHandler;
    const slider = document.getElementById('vsl-nouislider');
    slider.noUiSlider = {
      on: (event, handler) => {
        if (event === 'update.rangeCurve') updateHandler = handler;
      },
    };
    const calculator = {
      parameters: { vsl: 10.5 },
      sliderConfigs: { vsl: { range: { min: 7, max: 14 } } },
      formatParameter: (_parameter, value) => `$${Number(value).toFixed(1)}M`,
    };

    initializeRangeCurves(calculator);

    const marker = document.querySelector('.range-curve-marker');
    const line = document.querySelector('.range-curve-line');
    const initialPath = line.getAttribute('d');
    expect(marker.style.left).toBe('50%');
    expect(document.querySelector('.range-curve-current')).toHaveTextContent(
      '$10.5M'
    );

    updateHandler(['14']);
    expect(marker.style.left).toBe('100%');
    expect(line.getAttribute('d')).not.toBe(initialPath);
    expect(document.querySelector('.range-curve-current')).toHaveTextContent(
      '$14.0M'
    );
  });

  test('labels paper choices, guards missing URLs, and synchronizes selection', () => {
    document.body.innerHTML = `
      <article class="assumption">
        <label for="vsl-nouislider">Public value used for one life</label>
        <div id="vsl-nouislider"></div>
        <figure class="range-curve" data-parameter="vsl">
          <svg><path class="range-curve-fill"></path><path class="range-curve-line"></path></svg>
          <span class="range-curve-marker"></span>
          <output class="range-curve-current"></output>
        </figure>
      </article>
    `;
    const slider = document.getElementById('vsl-nouislider');
    slider.noUiSlider = { on: () => {} };
    const applied = [];
    const calculator = {
      parameters: { vsl: 10.5 },
      sliderConfigs: { vsl: { range: { min: 7, max: 14 } } },
      researchCitations: {
        vsl: {
          studies: [
            {
              modelValue: 10.5,
              shortLabel: 'Linked paper',
              value: 'Reported finding',
              valueBasis: 'Direct estimate',
              url: 'https://example.com/paper',
            },
            {
              modelValue: 14,
              shortLabel: 'Archived paper',
              value: 'Archived finding',
              valueBasis: 'Upper estimate',
            },
          ],
        },
      },
      formatParameter: (_parameter, value) => `$${Number(value).toFixed(1)}M`,
      applyResearchStudy: (_parameter, studyIndex) => {
        applied.push(studyIndex);
        return true;
      },
    };

    initializeRangeCurves(calculator);

    const region = document.querySelector('.study-choices');
    const choices = [...document.querySelectorAll('.study-choice')];
    expect(region).toHaveAttribute(
      'aria-label',
      'Paper values for Public value used for one life'
    );
    expect(document.querySelectorAll('.study-choice-item a')).toHaveLength(1);
    expect(region.innerHTML).not.toContain('undefined');
    expect(choices[0]).toHaveAttribute('aria-pressed', 'true');

    choices[1].click();
    expect(applied).toEqual([1]);
    expect(choices[1]).toHaveAttribute('aria-pressed', 'true');
  });

  test('moves a bell curve peak across the fixed research range', () => {
    expect(curvePath(15)).not.toBe(curvePath(85));
    expect(curvePath(15)).toMatch(/^M 0 90 L /);
    const peakX = (percent) =>
      curvePath(percent)
        .replace(/^M 0 90 L /, '')
        .split(' L ')
        .map((point) => point.split(' ').map(Number))
        .reduce((peak, point) => (point[1] < peak[1] ? point : peak))[0];

    expect(peakX(15)).toBeLessThan(peakX(85));
    expect(peakX(0)).toBe(0);
    expect(peakX(50)).toBe(200);
    expect(peakX(100)).toBe(400);
  });
});
