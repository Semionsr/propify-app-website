// ============================================
// COMPREHENSIVE WEB CHAT DATA VISUALIZATION
// Full Mobile App Parity Implementation
// ============================================

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

// Format value helper
function formatValue(val, decimals = 1) {
    if (val === null || val === undefined || isNaN(parseFloat(val))) return '--';
    return parseFloat(val).toFixed(decimals);
}

// Format percentage
function formatPercentage(val) {
    if (val === null || val === undefined || isNaN(parseFloat(val))) return '--';
    const num = parseFloat(val);
    // If value is between 0-1, multiply by 100
    if (num > 0 && num < 1) {
        return (num * 100).toFixed(1) + '%';
    }
    return num.toFixed(1) + '%';
}

// Calculate difference and determine if significant
function calculateDiff(seasonValue, recentValue, isLowerBetter = false) {
    const season = parseFloat(seasonValue) || 0;
    const recent = parseFloat(recentValue) || 0;
    const diff = recent - season;
    const diffPercent = season !== 0 ? ((diff / season) * 100) : 0;
    
    const isSignificant = Math.abs(diffPercent) >= 3 || Math.abs(diff) >= 0.5;
    const isImproving = isLowerBetter ? (diff < 0) : (diff > 0);
    
    return { diff, isSignificant, isImproving };
}

// Get color class for underline/value
function getColorClass(isSignificant, isImproving) {
    if (!isSignificant) return '';
    return isImproving ? 'positive' : 'negative';
}

// Get grade color
function getGradeColor(grade) {
    if (!grade) return '#888';
    switch (grade) {
        case 'A+': case 'A': return '#4ADE80';
        case 'A-': case 'B+': return '#6EE7B7';
        case 'B': case 'B-': return '#FCD34D';
        case 'C+': case 'C': return '#FB923C';
        case 'C-': case 'D+': case 'D': return '#F87171';
        case 'D-': case 'F': return '#EF4444';
        default: return '#888';
    }
}

// ===========================================
// HTML COMPONENT BUILDERS
// ===========================================

// Section Header
function createSectionHeader(title, subtitle = '') {
    return `
        <div class="section-header">
            <div class="section-title">${title}</div>
            ${subtitle ? `<div class="section-subtitle">${subtitle}</div>` : ''}
            <div class="section-divider"></div>
        </div>
    `;
}

// Simple Stat Row
function createSimpleStatRow(label, value, isText = false) {
    const formattedValue = isText ? (value || '--') : formatValue(value);
    return `
        <div class="simple-stat-row">
            <div class="simple-stat-label">${label}</div>
            <div class="simple-stat-value">${formattedValue}</div>
        </div>
    `;
}

// Stat Row (Season vs Recent)
function createStatRow(label, seasonValue, recentValue, recentLabel = 'L5', isLowerBetter = false) {
    const { diff, isSignificant, isImproving } = calculateDiff(seasonValue, recentValue, isLowerBetter);
    const colorClass = getColorClass(isSignificant, isImproving);
    
    const diffBadge = isSignificant ? `
        <div class="diff-badge ${colorClass}">
            <span class="diff-text ${colorClass}">
                ${diff > 0 ? '+' : ''}${formatValue(diff)}
            </span>
        </div>
    ` : '';
    
    return `
        <div class="stat-row">
            <div class="stat-side">
                <div class="stat-side-label">Season</div>
                <div class="stat-value">${formatValue(seasonValue)}</div>
                <div class="stat-underline"></div>
            </div>
            <div class="stat-center">
                <div class="stat-label">${label}</div>
                ${diffBadge}
            </div>
            <div class="stat-side">
                <div class="stat-side-label">${recentLabel}</div>
                <div class="stat-value ${colorClass}">${formatValue(recentValue)}</div>
                <div class="stat-underline ${colorClass}"></div>
            </div>
        </div>
    `;
}

// Home/Away Split Row
function createHomeAwaySplitRow(label, homeValue, awayValue) {
    const home = parseFloat(homeValue) || 0;
    const away = parseFloat(awayValue) || 0;
    const diff = home - away;
    
    const homeColorClass = diff > 0.5 ? 'positive' : (diff < -0.5 ? 'negative' : '');
    const awayColorClass = diff < -0.5 ? 'positive' : (diff > 0.5 ? 'negative' : '');
    
    return `
        <div class="stat-row">
            <div class="stat-side">
                <div class="stat-side-label">Home</div>
                <div class="stat-value ${homeColorClass}">${formatValue(home)}</div>
                <div class="stat-underline ${homeColorClass}"></div>
            </div>
            <div class="stat-center">
                <div class="stat-label">${label}</div>
            </div>
            <div class="stat-side">
                <div class="stat-side-label">Away</div>
                <div class="stat-value ${awayColorClass}">${formatValue(away)}</div>
                <div class="stat-underline ${awayColorClass}"></div>
            </div>
        </div>
    `;
}

// Floor/Ceiling Row
function createFloorCeilingRow(label, floorValue, ceilingValue) {
    return `
        <div class="stat-row">
            <div class="stat-side">
                <div class="stat-side-label">Floor</div>
                <div class="stat-value negative">${formatValue(floorValue, 0)}</div>
                <div class="stat-underline negative"></div>
            </div>
            <div class="stat-center">
                <div class="stat-label">${label}</div>
            </div>
            <div class="stat-side">
                <div class="stat-side-label">Ceiling</div>
                <div class="stat-value positive">${formatValue(ceilingValue, 0)}</div>
                <div class="stat-underline positive"></div>
            </div>
        </div>
    `;
}

// Three Column Stat Row (Rest Days)
function createThreeColumnStatRow(label, value0, value1, value2plus) {
    return `
        <div class="three-column-row">
            <div class="three-column-side">
                <div class="stat-side-label">B2B</div>
                <div class="stat-value">${formatValue(value0)}</div>
                <div class="stat-underline"></div>
            </div>
            <div class="three-column-center">
                <div class="stat-label">${label}</div>
            </div>
            <div class="three-column-side">
                <div class="stat-side-label">1 Day</div>
                <div class="stat-value">${formatValue(value1)}</div>
                <div class="stat-underline"></div>
            </div>
            <div class="three-column-side">
                <div class="stat-side-label">2+ Days</div>
                <div class="stat-value positive">${formatValue(value2plus)}</div>
                <div class="stat-underline positive"></div>
            </div>
        </div>
    `;
}

// Team Defense Grade Row
function createTeamDefenseGradeRow(label, grade, rank, value = null, valueLabel = '') {
    const gradeColor = getGradeColor(grade);
    const valueHTML = value !== null && value !== undefined ? `
        <div class="simple-stat-value" style="font-size: 11px; color: var(--emerald-200); min-width: 80px; text-align: right;">
            ${formatValue(value)} ${valueLabel}
        </div>
    ` : '';
    
    return `
        <div class="simple-stat-row">
            <div class="simple-stat-label">${label}</div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 18px; font-weight: 900; color: ${gradeColor}; min-width: 30px; text-align: center;">
                    ${grade || '--'}
                </div>
                <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); min-width: 30px;">
                    #${rank || '--'}
                </div>
                ${valueHTML}
            </div>
        </div>
    `;
}

// Suppression Row
function createSuppressionRow(label, value, isPositiveGood = false) {
    const numValue = parseFloat(value) || 0;
    const isGood = isPositiveGood ? numValue > 0 : numValue < 0;
    const colorClass = Math.abs(numValue) < 0.5 ? '' : (isGood ? 'positive' : 'negative');
    
    return `
        <div class="simple-stat-row">
            <div class="simple-stat-label">${label}</div>
            <div class="stat-value ${colorClass}">
                ${numValue > 0 ? '+' : ''}${formatValue(numValue, 2)}
            </div>
        </div>
    `;
}

// Injury Player Row
function createInjuryPlayerRow(player, injury, position, status) {
    const isOut = status === 'Out';
    const statusColor = isOut ? '#EF4444' : '#FCD34D';
    
    return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid rgba(74, 222, 128, 0.1);">
            <div style="flex: 1;">
                <div style="font-size: 15px; font-weight: 700; color: #FFFFFF; margin-bottom: 2px;">${player}</div>
                <div style="font-size: 12px; font-weight: 500; color: var(--text-secondary);">${injury}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="font-size: 12px; font-weight: 600; color: var(--emerald-200); border: 1px solid ${statusColor}; padding: 3px 8px; border-radius: 4px;">
                    ${position}
                </div>
                <div style="font-size: 13px; font-weight: 800; color: ${statusColor}; letter-spacing: 0.5px; min-width: 35px; text-align: right;">
                    ${isOut ? 'OUT' : 'DTD'}
                </div>
            </div>
        </div>
    `;
}

// Strength/Weakness Badge Row
function createStrengthWeaknessRow(label, value, isStrong) {
    const bgColor = isStrong ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    const textColor = isStrong ? '#4ADE80' : '#EF4444';
    
    return `
        <div class="simple-stat-row">
            <div class="simple-stat-label">${label}</div>
            <div style="background: ${bgColor}; padding: 6px 12px; border-radius: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: ${textColor};">
                    ${value || '--'}
                </span>
            </div>
        </div>
    `;
}

// Export for use in main chat file
window.chatDataVizUtils = {
    formatValue,
    formatPercentage,
    calculateDiff,
    getColorClass,
    getGradeColor,
    createSectionHeader,
    createSimpleStatRow,
    createStatRow,
    createHomeAwaySplitRow,
    createFloorCeilingRow,
    createThreeColumnStatRow,
    createTeamDefenseGradeRow,
    createSuppressionRow,
    createInjuryPlayerRow,
    createStrengthWeaknessRow
};

