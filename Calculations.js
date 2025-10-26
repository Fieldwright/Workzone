// ========================================
// PART 7: CALCULATIONS MODULE
// ========================================

let lastTaperSpacingFt = null;
let lastBufferSpacingFt = null;
let lastTaperCones = 0;
let lastBufferCones = 0;

function calculateMUTCDSpacing(speedMph, zoneType) {
    let taperSpacingFt, bufferSpacingFt;
    
    if (speedMph <= 45) {
        taperSpacingFt = Math.max(10, speedMph);
        bufferSpacingFt = taperSpacingFt * 2;
    } else {
        taperSpacingFt = Math.max(20, speedMph * 1.5);
        bufferSpacingFt = taperSpacingFt * 2;
    }
    
    if (zoneType === 'urban') {
        taperSpacingFt = Math.max(10, taperSpacingFt * 0.75);
        bufferSpacingFt = Math.max(20, bufferSpacingFt * 0.75);
    }
    
    lastTaperSpacingFt = Math.round(taperSpacingFt);
    lastBufferSpacingFt = Math.round(bufferSpacingFt);
    
    return {
        taperSpacing: lastTaperSpacingFt,
        bufferSpacing: lastBufferSpacingFt
    };
}

function calculateTaperLength(speedMph, numLanes = 1) {
    let baseLength;
    
    if (speedMph <= 40) {
        baseLength = speedMph * 2 * numLanes;
    } else if (speedMph <= 50) {
        baseLength = speedMph * 3 * numLanes;
    } else {
        baseLength = speedMph * 4 * numLanes;
    }
    
    return Math.round(baseLength);
}

function calculateRequiredCones(lengthFt, spacingFt) {
    return Math.ceil(lengthFt / spacingFt) + 1;
}

function updateCalculationDisplay(speedMph, zoneType, lengthFt) {
    const spacing = calculateMUTCDSpacing(speedMph, zoneType);
    const taperLength = calculateTaperLength(speedMph);
    const taperCones = calculateRequiredCones(taperLength, spacing.taperSpacing);
    const bufferCones = lengthFt ? calculateRequiredCones(lengthFt, spacing.bufferSpacing) : 0;
    
    lastTaperCones = taperCones;
    lastBufferCones = bufferCones;
    
    const calcDiv = document.getElementById('calculationResults');
    if (!calcDiv) return;
    
    calcDiv.innerHTML = `
        <div class="calculation-result">
            <strong>Taper Length:</strong> ${taperLength} ft
            <br><strong>Taper Spacing:</strong> ${spacing.taperSpacing} ft (${taperCones} cones)
            <br><strong>Buffer Spacing:</strong> ${spacing.bufferSpacing} ft
            ${lengthFt ? `<br><strong>Buffer Cones:</strong> ${bufferCones}` : ''}
            <br><strong>Total Cones:</strong> ${taperCones + bufferCones}
        </div>
    `;
}

function getMUTCDCompliance() {
    const speed = parseInt(document.getElementById('workZoneSpeed')?.value || 45);
    const zoneType = document.getElementById('zoneType')?.value || 'highway';
    
    const spacing = calculateMUTCDSpacing(speed, zoneType);
    const taperLength = calculateTaperLength(speed);
    
    return {
        speed,
        zoneType,
        taperSpacing: spacing.taperSpacing,
        bufferSpacing: spacing.bufferSpacing,
        taperLength,
        compliant: true
    };
}
