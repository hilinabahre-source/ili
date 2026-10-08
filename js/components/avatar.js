import { mount } from "https://embed.bodydbl.com/1.0.2/viewer.js";

let viewer;
let debounceTimer;
let currentUnit = 'metric';

export const lengthFieldIds = [
  'shoulderWidth', 'neckToWaistBack', 'neckToWaistFront',
  'chestGirth', 'underbustGirth', 'armLength', 'bicepGirth',
  'waistGirth', 'hipGirth', 'thighGirth', 'crotchHeight'
];

const CM_PER_IN = 2.54;
const KG_PER_LB = 0.45359237;

function toMetricLength(value) {
  return currentUnit === 'imperial' ? value * CM_PER_IN : value;
}
function toMetricWeight(value) {
  return currentUnit === 'imperial' ? value * KG_PER_LB : value;
}

function updateUnitLabels() {
  const lengthLabel = currentUnit === 'imperial' ? 'in' : 'cm';
  const weightLabel = currentUnit === 'imperial' ? 'lb' : 'kg';
  document.querySelectorAll('.bd-unit-length').forEach(el => el.textContent = lengthLabel);
  document.querySelectorAll('.bd-unit-weight').forEach(el => el.textContent = weightLabel);
}

function convertDisplayedValues(fromUnit, toUnit) {
  const heightInput = document.getElementById('bd-height');
  if (heightInput.value !== '') {
    const raw = parseFloat(heightInput.value);
    const cm = fromUnit === 'imperial' ? raw * CM_PER_IN : raw;
    heightInput.value = (toUnit === 'imperial' ? cm / CM_PER_IN : cm).toFixed(1);
  }
  const weightInput = document.getElementById('bd-weight');
  if (weightInput.value !== '') {
    const raw = parseFloat(weightInput.value);
    const kg = fromUnit === 'imperial' ? raw * KG_PER_LB : raw;
    weightInput.value = (toUnit === 'imperial' ? kg / KG_PER_LB : kg).toFixed(1);
  }
  lengthFieldIds.forEach(id => {
    const input = document.getElementById('bd-' + id);
    if (input.value !== '') {
      const raw = parseFloat(input.value);
      const cm = fromUnit === 'imperial' ? raw * CM_PER_IN : raw;
      input.value = (toUnit === 'imperial' ? cm / CM_PER_IN : cm).toFixed(1);
    }
  });
}

export function collectProfile() {
  const gender = document.getElementById('bd-gender').value;
  const fields = {};

  const heightVal = document.getElementById('bd-height').value;
  if (heightVal !== '') fields.height = toMetricLength(parseFloat(heightVal));

  const weightVal = document.getElementById('bd-weight').value;
  if (weightVal !== '') fields.weight = toMetricWeight(parseFloat(weightVal));

  lengthFieldIds.forEach(id => {
    const val = document.getElementById('bd-' + id).value;
    if (val !== '') fields[id] = toMetricLength(parseFloat(val));
  });

  return { schemaVersion: 1, gender, unitSystem: 'metric', fields };
}

// Exposed so other parts of the site (like pattern pages) can read the
// customer's real entered measurements, always converted to cm/kg.
window.getCustomerBodyMeasurements = collectProfile;

function scheduleUpdate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (!viewer) return;

    try {
      await viewer.setProfile(collectProfile());
    } catch (err) {
      console.error('BodyDouble update failed:', err);
    }
  }, 300);
}

function watchField(fieldId, measurementKey) {
  const el = document.getElementById(fieldId);
  el.addEventListener('input', scheduleUpdate);
  el.addEventListener('focus', () => {
    viewer?.showMeasurement(measurementKey, { autoZoom: true }).catch(() => {});
  });
}

document.getElementById('bd-unit').addEventListener('change', (e) => {
  const newUnit = e.target.value;
  convertDisplayedValues(currentUnit, newUnit);
  currentUnit = newUnit;
  updateUnitLabels();
  scheduleUpdate();
});

currentUnit = document.getElementById('bd-unit').value;
updateUnitLabels();

// Mounting a WebGL viewer into a hidden/zero-size container is what
// broke this the last time it lived inside a modal, so this no longer
// runs at page load — it's only called once the profile modal (which
// now holds body-view) has actually been made visible and laid out.
window.initBodyDoubleViewer = async function initBodyDoubleViewer(){
  try {
    viewer = mount({
      target: '#body-view',
      siteKey: "bd_site_2g3wFctQ5NH03P1zEw05IME9dNlWYPIi"
    });
    await viewer.ready;

    try {
      await viewer.setAppearance({ preset: 'light' });
    } catch (appearanceErr) {
      console.warn('Could not set appearance:', appearanceErr);
    }

    // Subscribe before the first setProfile call, per SeamScape's docs.
    viewer.on('profile', profile => {
      console.log('BodyDouble profile update:', profile.fields);
    });
    // Only these mean the viewer itself is broken. Everything else (like a
    // single field being out of range while someone's still typing) is a
    // normal, recoverable per-update error and shouldn't kill the viewer.
    const FATAL_ERROR_CODES = new Set([
      'INIT_TIMEOUT',
      'VERSION_MISMATCH',
      'WEBGL_UNAVAILABLE',
      'WEBGL_CONTEXT_LOST',
      'MODEL_LOAD_FAILED',
      'VIEWER_ERROR',
      'DESTROYED'
    ]);

    viewer.on('error', err => {
      console.error('BodyDouble runtime error:', err);
      if (FATAL_ERROR_CODES.has(err?.code)) {
        document.querySelector('#body-view').textContent =
          '3D preview ran into a problem. You can continue entering measurements.';
      }
    });

    document.getElementById('bd-gender').addEventListener('change', scheduleUpdate);
    document.getElementById('bd-height').addEventListener('input', scheduleUpdate);
    document.getElementById('bd-weight').addEventListener('input', scheduleUpdate);
    lengthFieldIds.forEach(id => {
      watchField('bd-' + id, id);
    });
  } catch (error) {
    viewer?.destroy();
    document.querySelector('#body-view').textContent =
      '3D preview unavailable. You can continue entering measurements.';
  }
};
