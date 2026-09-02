import {
  curveMarkerPercent,
  curvePath,
  initializeRangeCurves,
} from './range-curves.js';

describe('research range curves', () => {
  test('maps values to their honest position inside a cited range', () => {
    expect(curveMarkerPercent(7, 7, 14)).toBe(0);
    expect(curveMarkerPercent(10.5, 7, 14)).toBe(50);
    expect(curveMarkerPercent(14, 7, 14)).toBe(100);
    expect(curveMarkerPercent(20, 7, 14)).toBe(100);
  });

  test('keeps a sensitivity marker synchronized with its calculator control', () => {
    document.body.innerHTML = `
      <div id="vsl-nouislider"></div>
      <figure class="range-curve" data-parameter="vsl">
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
    expect(marker.style.left).toBe('50%');
    expect(document.querySelector('.range-curve-current')).toHaveTextContent(
      '$10.5M'
    );
    expect(document.querySelector('.range-curve-line')).not.toBeNull();
    expect(document.querySelector('.range-curve-fill')).not.toBeNull();
    expect(document.querySelector('.study-choices details')).toBeNull();
    expect(document.querySelector('.study-choices')).toHaveTextContent(
      'No study measures this input directly'
    );

    updateHandler(['14']);
    expect(marker.style.left).toBe('100%');
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
          <span class="range-curve-marker"></span>
          <output class="range-curve-current"></output>
        </figure>
      </article>
    `;
    let updateHandler;
    const slider = document.getElementById('vsl-nouislider');
    slider.noUiSlider = {
      on: (event, handler) => {
        if (event === 'update.rangeCurve') updateHandler = handler;
      },
    };
    const applied = [];
    const calculator = {
      parameters: { vsl: 11 },
      scenarios: { reset: { vsl: 11 } },
      sliderConfigs: { vsl: { range: { min: 7, max: 14 } } },
      researchCitations: {
        vsl: {
          studies: [
            {
              modelValue: 14,
              mappingStatus: 'context',
              shortLabel: 'Archived paper',
              value: 'Archived finding',
              valueBasis: 'Upper estimate',
            },
            {
              modelValue: 10.5,
              mappingStatus: 'direct',
              shortLabel: 'Linked paper',
              value: 'Reported finding',
              valueBasis: 'Direct estimate',
              url: 'https://example.com/paper',
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
    expect(
      document.querySelectorAll('.study-choice-item [data-research-pack-url]')
    ).toHaveLength(1);
    expect(region.innerHTML).not.toContain('undefined');
    expect(region.querySelector('details')).toBeNull();
    expect(region).toHaveTextContent('Compare source values');
    expect(region).toHaveTextContent('Archived paper');
    expect(region).toHaveTextContent('Context only');
    expect(choices).toHaveLength(2);
    expect(choices.map((choice) => Number(choice.dataset.modelValue))).toEqual([
      10.5,
      11,
    ]);
    expect(choices[1]).toHaveAttribute('aria-pressed', 'true');
    expect(choices[1]).toHaveTextContent('Starting model value');
    expect(region).toHaveTextContent('Selectable rows update the model');
    expect(region.querySelectorAll('.evidence-receipt dt')).toHaveLength(3);

    choices[0].click();
    expect(applied).toEqual([1]);
    expect(choices[0]).toHaveAttribute('aria-pressed', 'true');
    expect(choices[0]).toHaveAttribute('data-selection-state', 'exact');

    updateHandler(['13']);
    expect(choices[0]).toHaveAttribute('aria-pressed', 'true');
    expect(choices[0]).toHaveAttribute('data-selection-state', 'adjusted');
  });

  test('moves an illustrative normal curve across the fixed model range', () => {
    expect(curvePath(15)).not.toBe(curvePath(85));
    expect(curvePath(15)).toMatch(/^M 0 90 L /);
  });
});
