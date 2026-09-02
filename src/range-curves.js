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

function createCurveGraphic() {
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('viewBox', '0 0 400 90');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const fill = document.createElementNS(namespace, 'path');
  fill.classList.add('range-curve-fill');
  const line = document.createElementNS(namespace, 'path');
  line.classList.add('range-curve-line');
  svg.append(fill, line);
  return { svg, fill, line };
}

const EVIDENCE_ROLES = {
  vsl: 'Government valuation',
  suicides: 'National trend estimate',
  attribution: 'Exposure study and working assumption',
  depression: 'Population estimate',
  yld: 'Disease burden estimate',
  qol: 'Health utility estimate',
  healthcare: 'Care cost estimate',
  productivity: 'Work loss estimate',
  duration: 'Duration estimate',
};

function totalWithParameter(calculator, parameter, value) {
  const previous = calculator.parameters[parameter];
  calculator.parameters[parameter] = value;
  const total = calculator.calculateTotalEconomicImpact().total;
  calculator.parameters[parameter] = previous;
  return total;
}

function createEvidenceReceipt(curve, parameter, calculator, selectable) {
  const receipt = document.createElement('section');
  receipt.className = 'evidence-receipt';
  receipt.dataset.parameter = parameter;
  receipt.setAttribute('aria-label', 'How this evidence enters the estimate');

  const heading = document.createElement('p');
  heading.className = 'evidence-receipt-heading';
  const headingLabel = document.createElement('span');
  headingLabel.textContent = 'Current anchor';
  const headingValue = document.createElement('strong');
  headingValue.dataset.receiptStudy = '';
  heading.append(headingLabel, headingValue);

  const facts = document.createElement('dl');
  const fields = [
    ['Evidence role', 'role'],
    ['Anchor says', 'finding'],
    ['Model uses', 'mapping'],
  ];
  for (const [label, key] of fields) {
    const item = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.dataset[`receipt${key[0].toUpperCase()}${key.slice(1)}`] = '';
    item.append(term, description);
    facts.append(item);
  }
  receipt.append(heading, facts);

  const update = () => {
    const selectedIndex = Number(curve.dataset.selectedStudyIndex);
    const selected = selectable.find(
      ({ studyIndex }) => studyIndex === selectedIndex
    )?.study;
    if (!selected) return;
    headingValue.textContent = selected.shortLabel;
    receipt.querySelector('[data-receipt-role]').textContent =
      selected.evidenceRole || EVIDENCE_ROLES[parameter];
    receipt.querySelector('[data-receipt-finding]').textContent =
      selected.value;
    receipt.querySelector('[data-receipt-mapping]').textContent =
      calculator.formatParameter(parameter, selected.modelValue);
  };

  return { receipt, update };
}

function createStudyButton(
  study,
  parameter,
  studyIndex,
  calculator,
  className
) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.dataset.studyIndex = String(studyIndex);
  button.dataset.modelValue = String(study.modelValue);
  const formattedValue = calculator.formatParameter(
    parameter,
    study.modelValue
  );
  const name = document.createElement('span');
  name.textContent = study.shortLabel;
  const value = document.createElement('strong');
  value.textContent = `Use ${formattedValue}`;
  const finding = document.createElement('span');
  finding.className = 'study-choice-finding';
  finding.textContent = study.value;
  const basis = document.createElement('small');
  basis.append(document.createTextNode(study.valueBasis));
  const state = document.createElement('span');
  state.className = 'study-choice-state';
  state.setAttribute('aria-hidden', 'true');
  basis.append(state);
  button.append(name, value, finding, basis);
  return button;
}

function createContextStudyRow(study) {
  const item = document.createElement('article');
  item.className = 'study-choice-item study-choice-item--context';
  const context = document.createElement('div');
  context.className = 'context-study';
  const name = document.createElement('span');
  name.textContent = study.shortLabel;
  const role = document.createElement('strong');
  role.textContent = 'Context only';
  const finding = document.createElement('span');
  finding.className = 'study-choice-finding';
  finding.textContent = study.value;
  const basis = document.createElement('small');
  basis.textContent = study.valueBasis;
  context.append(name, role, finding, basis);
  item.append(context);
  if (study.url) {
    const sourceButton = document.createElement('button');
    sourceButton.type = 'button';
    sourceButton.className = 'research-source-trigger';
    sourceButton.dataset.researchPackUrl = study.url;
    sourceButton.textContent = 'Get source';
    item.append(sourceButton);
  }
  return item;
}

function addStudyChoices(curve, plot, parameter, calculator, render) {
  const studies = calculator.researchCitations?.[parameter]?.studies || [];
  const indexedStudies = studies.map((study, studyIndex) => ({
    study,
    studyIndex,
  }));
  const mappedStudies = indexedStudies
    .filter(
      ({ study }) =>
        study.mappingStatus === 'direct' && Number.isFinite(study.modelValue)
    );
  const contextualStudies = indexedStudies.filter(
    ({ study }) => study.mappingStatus !== 'direct'
  );
  const startingValue =
    calculator.scenarios?.reset?.[parameter] ??
    calculator.parameters[parameter];
  const hasExactStartingStudy = mappedStudies.some(
    ({ study }) => Math.abs(study.modelValue - startingValue) < 0.001
  );
  const baseline = {
    modelValue: startingValue,
    shortLabel: 'Starting model value',
    value: 'The value used when this page opens',
    valueBasis: 'Original model baseline',
    evidenceRole: 'Opening model assumption',
  };
  const selectable = [
    ...(hasExactStartingStudy ? [] : [{ study: baseline, studyIndex: -1 }]),
    ...mappedStudies,
  ].sort((left, right) => left.study.modelValue - right.study.modelValue);
  if (selectable.length === 0) return () => {};

  const choices = document.createElement('section');
  choices.className = 'study-choices';
  const parameterLabel =
    curve.closest('.assumption')?.querySelector('label')?.textContent?.trim() ||
    parameter;
  choices.setAttribute('aria-label', `Paper values for ${parameterLabel}`);
  const list = document.createElement('div');
  list.className = 'study-choice-list';
  const heading = document.createElement('p');
  heading.className = 'study-choices-heading';
  heading.textContent = 'Compare source values';
  const openingSelection = selectable.find(
    ({ study }) =>
      Math.abs(study.modelValue - calculator.parameters[parameter]) < 0.001
  );
  curve.dataset.selectedStudyIndex = String(
    openingSelection?.studyIndex ?? selectable[0].studyIndex
  );
  const evidenceReceipt = createEvidenceReceipt(
    curve,
    parameter,
    calculator,
    selectable
  );

  selectable.forEach(({ study, studyIndex }) => {
    const percent = curveMarkerPercent(
      study.modelValue,
      calculator.sliderConfigs[parameter].range.min,
      calculator.sliderConfigs[parameter].range.max
    );
    const point = document.createElement('span');
    point.className = 'study-point';
    point.dataset.modelValue = String(study.modelValue);
    point.dataset.studyIndex = String(studyIndex);
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
    item.append(button);
    if (study.url) {
      const sourceButton = document.createElement('button');
      sourceButton.type = 'button';
      sourceButton.className = 'research-source-trigger';
      sourceButton.dataset.researchPackUrl = study.url;
      sourceButton.textContent = 'Get source';
      item.append(sourceButton);
    }
    list.append(item);

    const apply = () => {
      const previousSelection = curve.dataset.selectedStudyIndex;
      curve.dataset.selectedStudyIndex = String(studyIndex);
      if (calculator.applyResearchStudy(parameter, studyIndex)) {
        render(study.modelValue);
      } else {
        curve.dataset.selectedStudyIndex = previousSelection;
      }
    };
    button.addEventListener('click', apply);
  });

  contextualStudies.forEach(({ study }) => {
    list.append(createContextStudyRow(study));
  });

  choices.append(evidenceReceipt.receipt);
  if (selectable.length > 1 || contextualStudies.length > 0) {
    const note = document.createElement('p');
    note.className = 'study-mapping-note';
    note.textContent =
      'Selectable rows update the model. Context rows report related findings without setting this input.';
    choices.append(heading, list, note);
  } else {
    const note = document.createElement('p');
    note.className = 'study-mapping-note';
    note.textContent =
      'No study measures this input directly. The opening value is a model assumption.';
    choices.append(note);
  }
  curve.append(choices);
  return evidenceReceipt.update;
}

export function initializeRangeCurves(calculator) {
  document.querySelectorAll('.range-curve[data-parameter]').forEach((curve) => {
    const parameter = curve.dataset.parameter;
    const config = calculator.sliderConfigs[parameter];
    const slider = document.getElementById(`${parameter}-nouislider`);
    const marker = curve.querySelector('.range-curve-marker');
    const current = curve.querySelector('.range-curve-current');
    const impact = curve.querySelector('.sensitivity-impact');
    if (!config || !slider?.noUiSlider || !marker || !current) {
      return;
    }

    const plot = document.createElement('div');
    plot.className = 'range-curve-plot';
    [...curve.children].forEach((child) => plot.append(child));
    const { svg, fill, line } = createCurveGraphic();
    plot.prepend(svg);
    curve.append(plot);

    let updateReceipt = () => {};
    if (
      impact &&
      typeof calculator.calculateTotalEconomicImpact === 'function'
    ) {
      const lowTotal = totalWithParameter(
        calculator,
        parameter,
        config.range.min
      );
      const highTotal = totalWithParameter(
        calculator,
        parameter,
        config.range.max
      );
      impact.textContent = `Total ${calculator.formatLargeNumber(
        Math.min(lowTotal, highTotal)
      )} to ${calculator.formatLargeNumber(Math.max(lowTotal, highTotal))}`;
    }
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
      curve.querySelectorAll('.study-choice').forEach((choice) => {
        const isSelected =
          choice.dataset.studyIndex === curve.dataset.selectedStudyIndex;
        const isExact =
          Math.abs(Number(choice.dataset.modelValue) - numericValue) < 0.001;
        choice.setAttribute('aria-pressed', String(isSelected));
        choice.dataset.selectionState = isSelected
          ? isExact
            ? 'exact'
            : 'adjusted'
          : 'none';
        const state = choice.querySelector('.study-choice-state');
        if (state) {
          state.textContent = isSelected
            ? isExact
              ? 'Selected'
              : 'Selected, adjusted'
            : '';
        }
      });
      curve.querySelectorAll('.study-point').forEach((point) => {
        const isSelected =
          point.dataset.studyIndex === curve.dataset.selectedStudyIndex;
        point.classList.toggle('is-active', isSelected);
        point.classList.toggle(
          'is-adjusted',
          isSelected &&
            Math.abs(Number(point.dataset.modelValue) - numericValue) >= 0.001
        );
      });
      updateReceipt(numericValue);
    };

    updateReceipt = addStudyChoices(curve, plot, parameter, calculator, render);
    render(calculator.parameters[parameter]);
    slider.noUiSlider.on('update.rangeCurve', (values) => render(values[0]));
  });
}
