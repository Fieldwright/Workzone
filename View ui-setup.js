/****************************************
 * PART 4 - UI SETUP
 * START
 * 
 * UI initialization:
 * - DOM element references
 * - Collapsible section handlers
 * - Mobile menu toggle
 * - Initial date setting
 ****************************************/

const speedEl = document.getElementById('speedLimit');
const autoFromSpeedEl = document.getElementById('autoFromSpeed');
const spacingEl = document.getElementById('spacing');
const bufferSpacingEl = document.getElementById('bufferSpacing');
const scaleEl = document.getElementById('scale');
const stationStepEl = document.getElementById('stationStep');
const modeSingleEl = document.getElementById('modeSingle');
const modeDoubleEl = document.getElementById('modeDouble');
const chkDeleteEl = document.getElementById('chk-delete');

document.querySelectorAll('.section-header').forEach(header => {
  header.addEventListener('click', () => {
    const section = header.getAttribute('data-section');
    const content = document.querySelector(`.section-content[data-section="${section}"]`);
    const icon = header.querySelector('.section-icon');
    content.classList.toggle('collapsed');
    icon.classList.toggle('collapsed');
  });
});

document.getElementById('mobileToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('mobile-hidden');
});

document.getElementById('projectDate').value = new Date().toLocaleDateString();

/****************************************
 * PART 4 - UI SETUP
 * END
 ****************************************/
