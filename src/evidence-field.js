const COMPONENT_KEYS = ['mortality', 'mental', 'productivity'];
const FALLBACK_COLORS = ['#b01835', '#67518b', '#3f7459'];

export function normalizeContributions(results = {}) {
  const values = COMPONENT_KEYS.map((key) =>
    Math.max(0, Number(results[key]) || 0)
  );
  const total = values.reduce((sum, value) => sum + value, 0);
  return total > 0 ? values.map((value) => value / total) : [0, 0, 0];
}

export function smoothValue(current, target, amount) {
  return current + (target - current) * Math.min(1, Math.max(0, amount));
}

export function gaussianDensity(value, mean, deviation) {
  if (!Number.isFinite(deviation) || deviation <= 0) return 0;
  return Math.exp(-0.5 * ((value - mean) / deviation) ** 2);
}

function resolveColors(canvas) {
  const styles = getComputedStyle(canvas);
  return [
    styles.getPropertyValue('--category-lives').trim(),
    styles.getPropertyValue('--category-health').trim(),
    styles.getPropertyValue('--category-economic').trim(),
  ].map((color, index) => color || FALLBACK_COLORS[index]);
}

function drawNormalCurve(
  context,
  width,
  height,
  share,
  index,
  color,
  pointer,
  phase
) {
  const baseline = height * 0.79;
  const mean = 0.5 + (index - 1) * 0.012 + pointer.x * 0.025;
  const deviation =
    0.105 +
    index * 0.044 +
    share * 0.025 +
    Math.sin(phase + index) * 0.0025;
  const amplitude = height * (0.3 + share * 0.42);
  const points = 160;

  context.beginPath();
  for (let point = 0; point <= points; point += 1) {
    const progress = point / points;
    const x = progress * width;
    const density = gaussianDensity(progress, mean, deviation);
    const y = baseline - density * amplitude;
    if (point === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.strokeStyle = color;
  context.lineWidth = index === 0 ? 1.75 : 1.4;
  context.stroke();

  const beadProgress = (phase * 0.035 + index * 0.19) % 1;
  const beadX = beadProgress * width;
  const beadY =
    baseline - gaussianDensity(beadProgress, mean, deviation) * amplitude;
  context.beginPath();
  context.arc(beadX, beadY, 2.5, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
}

function drawField(canvas, shares, pointer, phase) {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
    canvas.width = width * ratio;
    canvas.height = height * ratio;
  }

  const context = canvas.getContext('2d');
  if (!context) return;
  const colors = resolveColors(canvas);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  context.lineCap = 'round';
  context.lineJoin = 'round';

  context.beginPath();
  context.moveTo(0, height * 0.79);
  context.lineTo(width, height * 0.79);
  context.moveTo(width * 0.5, height * 0.12);
  context.lineTo(width * 0.5, height * 0.88);
  context.strokeStyle = 'rgba(30, 28, 25, 0.16)';
  context.lineWidth = 1;
  context.stroke();

  shares.forEach((share, index) => {
    drawNormalCurve(
      context,
      width,
      height,
      share,
      index,
      colors[index],
      pointer,
      phase
    );
  });
}

export function initializeEvidenceField(calculator) {
  const canvas = document.getElementById('evidence-field-canvas');
  if (!canvas || !calculator?.calculateTotalEconomicImpact) return () => {};

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = { x: 0, targetX: 0 };
  let target = normalizeContributions(calculator.calculateTotalEconomicImpact());
  let current = [...target];
  let frame = 0;
  let visible = true;
  let startedAt = performance.now();

  const paint = (timestamp = performance.now()) => {
    current = current.map((value, index) =>
      smoothValue(value, target[index], reduceMotion ? 1 : 0.1)
    );
    pointer.x = smoothValue(
      pointer.x,
      pointer.targetX,
      reduceMotion ? 1 : 0.08
    );
    const phase = reduceMotion ? 0 : (timestamp - startedAt) / 1000;
    drawField(canvas, current, pointer, phase);
    frame = visible && !reduceMotion ? requestAnimationFrame(paint) : 0;
  };

  const requestPaint = () => {
    target = normalizeContributions(calculator.calculateTotalEconomicImpact());
    if (!frame && visible) frame = requestAnimationFrame(paint);
  };

  const handlePointer = (event) => {
    if (reduceMotion) return;
    const rect = canvas.getBoundingClientRect();
    pointer.targetX = Math.max(
      -1,
      Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1)
    );
  };

  const resetPointer = () => {
    pointer.targetX = 0;
  };

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      startedAt = performance.now();
      requestPaint();
    } else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  observer.observe(canvas);

  document.querySelectorAll('.research-slider').forEach((slider) => {
    slider.noUiSlider?.on('update.evidenceField', requestPaint);
  });
  const field = canvas.closest('.model-field');
  field?.addEventListener('pointermove', handlePointer);
  field?.addEventListener('pointerleave', resetPointer);
  window.addEventListener('resize', requestPaint, { passive: true });
  requestPaint();

  return () => {
    observer.disconnect();
    if (frame) cancelAnimationFrame(frame);
    field?.removeEventListener('pointermove', handlePointer);
    field?.removeEventListener('pointerleave', resetPointer);
    window.removeEventListener('resize', requestPaint);
  };
}
