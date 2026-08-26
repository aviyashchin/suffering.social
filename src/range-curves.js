export function curveMarkerPercent(value, minimum, maximum) {
  if (!Number.isFinite(value) || maximum <= minimum) return 0;
  return Math.min(
    100,
    Math.max(0, ((value - minimum) / (maximum - minimum)) * 100)
  );
}

export function curvePath(percent, width = 400, height = 90) {
  const clampedPercent = Math.min(100, Math.max(0, Number(percent) || 0));
  const center = (clampedPercent / 100) * width;
  const spread = width * 0.13;
  const baseline = height - 6;
  const amplitude = height - 18;
  const points = [];

  for (let x = 0; x <= width; x += 8) {
    const density = Math.exp(-0.5 * ((x - center) / spread) ** 2);
    points.push(`${x} ${(baseline - density * amplitude).toFixed(2)}`);
  }

  return `M 0 ${height} L ${points.join(' L ')}`;
}

function createStudyButton(study, parameter, studyIndex, calculator, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.dataset.studyIndex = String(studyIndex);
  button.dataset.modelValue = String(study.modelValue);
  const formattedValue = calculator.formatParameter(parameter, study.modelValue);
  const name = document.createElement('span');
  name.textContent = study.shortLabel;
  const value = document.createElement('strong');
  value.textContent = `Use ${formattedValue}`;
  button.append(name, value);
  return button;
}

function addStudyChoices(curve, plot, parameter, calculator, render) {
  const studies = calculator.researchCitations?.[parameter]?.studies || [];
  const selectable = studies
    .map((study, studyIndex) => ({ study, studyIndex }))
    .filter(({ study }) => Number.isFinite(study.modelValue));
  if (selectable.length === 0) return;

  const choices = document.createElement('section');
  choices.className = 'study-choices';
  const parameterLabel =
    curve.closest('.assumption')?.querySelector('label')?.textContent?.trim() ||
    parameter;
  choices.setAttribute('aria-label', `Paper values for ${parameterLabel}`);
  const heading = document.createElement('p');
  heading.className = 'study-choices-heading';
  heading.textContent = 'Try a paper in the model';
  const list = document.createElement('div');
  list.className = 'study-choice-list';

  selectable.forEach(({ study, studyIndex }) => {
    const percent = curveMarkerPercent(
      study.modelValue,
      calculator.sliderConfigs[parameter].range.min,
      calculator.sliderConfigs[parameter].range.max
    );
    const point = document.createElement('span');
    point.className = 'study-point';
    point.dataset.modelValue = String(study.modelValue);
    point.title = `${study.shortLabel}: ${calculator.formatParameter(
      parameter,
      study.modelValue
    )}`;
    point.setAttribute('aria-hidden', 'true');
    point.style.left = `${percent}%`;
    plot.append(point);

    const item = document.createElement('article');
    item.className = 'study-choice-item';
    const button = createStudyButton(
      study,
      parameter,
      studyIndex,
      calculator,
      'study-choice'
    );
    const finding = document.createElement('p');
    finding.className = 'study-choice-finding';
    finding.textContent = `Paper finding: ${study.value}`;
    const basis = document.createElement('small');
    basis.textContent = `Model value: ${study.valueBasis}`;
    item.append(button, finding, basis);
    if (study.url) {
      const link = document.createElement('a');
      link.href = study.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Read paper';
      item.append(link);
    }
    list.append(item);

    const apply = () => {
      if (calculator.applyResearchStudy(parameter, studyIndex)) {
        render(study.modelValue);
      }
    };
    button.addEventListener('click', apply);
  });

  const note = document.createElement('p');
  note.className = 'study-mapping-note';
  note.textContent =
    'The paper finding and the calculator input are not always the same measure. Each button labels how the model value was chosen.';
  choices.append(heading, list, note);
  curve.append(choices);
}

export function initializeRangeCurves(calculator) {
  document.querySelectorAll('.range-curve[data-parameter]').forEach((curve) => {
    const parameter = curve.dataset.parameter;
    const config = calculator.sliderConfigs[parameter];
    const slider = document.getElementById(`${parameter}-nouislider`);
    const marker = curve.querySelector('.range-curve-marker');
    const current = curve.querySelector('.range-curve-current');
    const line = curve.querySelector('.range-curve-line');
    const fill = curve.querySelector('.range-curve-fill');
    if (!config || !slider?.noUiSlider || !marker || !current || !line || !fill) {
      return;
    }

    const plot = document.createElement('div');
    plot.className = 'range-curve-plot';
    [...curve.children].forEach((child) => plot.append(child));
    curve.append(plot);

    const render = (value) => {
      const numericValue = Number(value);
      const percent = curveMarkerPercent(
        numericValue,
        config.range.min,
        config.range.max
      );
      const path = curvePath(percent);
      marker.style.left = `${percent}%`;
      current.style.left = `${Math.min(92, Math.max(8, percent))}%`;
      current.textContent = calculator.formatParameter(parameter, numericValue);
      line.setAttribute('d', path);
      fill.setAttribute('d', `${path} L 400 90 Z`);
      curve
        .querySelectorAll('.study-choice, .study-point')
        .forEach((choice) => {
          const isActive =
            Math.abs(Number(choice.dataset.modelValue) - numericValue) < 0.001;
          if (choice.classList.contains('study-choice')) {
            choice.setAttribute('aria-pressed', String(isActive));
          } else {
            choice.classList.toggle('is-active', isActive);
          }
        });
    };

    addStudyChoices(curve, plot, parameter, calculator, render);
    render(calculator.parameters[parameter]);
    slider.noUiSlider.on('update.rangeCurve', (values) => render(values[0]));
  });
}
