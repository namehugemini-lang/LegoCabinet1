import { UnitConfig } from '../types';

/**
 * Calculates the display width for each unit based on the parametric rules.
 * 
 * Rule 1: Fixed units (isElastic: false) keep their defined width.
 * Rule 2: Calculate Remaining Space = Total Width - Sum(Fixed Widths).
 * Rule 3: Distribute Remaining Space equally among Elastic units.
 * Rule 4: If space is negative, units compress (CSS flex default), but we might want to warn.
 */
export const calculateUnitWidths = (
  totalWidth: number,
  units: UnitConfig[]
): Record<string, number> => {
  const elasticUnits = units.filter(u => u.isElastic);
  const fixedUnits = units.filter(u => !u.isElastic);

  const totalFixedUsed = fixedUnits.reduce((acc, u) => acc + u.width, 0);
  const remainingSpace = Math.max(0, totalWidth - totalFixedUsed);

  const widthMap: Record<string, number> = {};

  // Assign fixed widths
  fixedUnits.forEach(u => {
    widthMap[u.id] = u.width;
  });

  // Assign elastic widths
  if (elasticUnits.length > 0) {
    const elasticWidthPerUnit = remainingSpace / elasticUnits.length;
    elasticUnits.forEach(u => {
      widthMap[u.id] = elasticWidthPerUnit;
    });
  } else {
    // Edge case: No elastic units. Space remains empty on right, 
    // or we could force scale. For this logic, we just let fixed be fixed.
  }

  return widthMap;
};