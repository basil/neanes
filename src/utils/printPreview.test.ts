import { describe, expect, it } from 'vitest';

import {
  chooseAllPagesGrid,
  clampPageNumber,
  clampPreviewZoom,
  facingPageColumn,
  facingSpreadPageNumbers,
  fitInViewScale,
  fitToWidthScale,
  generateRulerTicks,
  nextPreviewPageNumber,
  nextZoomLevel,
  parsePageNumberInput,
  previewViewPageNumbers,
  previousPreviewPageNumber,
  previousZoomLevel,
} from './printPreview';

describe('print preview geometry', () => {
  it('fits one or more page columns to the viewport', () => {
    expect(fitToWidthScale(1000, 400, 1, 20, 20)).toBeCloseTo(2.4);
    expect(fitToWidthScale(1000, 400, 2, 20, 20)).toBeCloseTo(1.175);
    expect(fitInViewScale(1000, 800, 400, 600, 1, 1, 20, 20)).toBeCloseTo(
      760 / 600,
    );
  });

  it('chooses the all-pages grid with the largest usable scale', () => {
    const result = chooseAllPagesGrid(4, 1000, 800, 400, 600, 20);

    expect(result.columns).toBe(2);
    expect(result.scale).toBeCloseTo(780 / 1200);
  });

  it('places facing pages in book order', () => {
    expect([1, 2, 3, 4].map(facingPageColumn)).toEqual([2, 1, 2, 1]);
  });

  it('selects only the pages belonging to the active view', () => {
    expect(previewViewPageNumbers('single', 3, 6)).toEqual([3]);
    expect(previewViewPageNumbers('facing', 1, 6)).toEqual([1]);
    expect(previewViewPageNumbers('facing', 2, 6)).toEqual([2, 3]);
    expect(previewViewPageNumbers('facing', 3, 6)).toEqual([2, 3]);
    expect(previewViewPageNumbers('facing', 6, 6)).toEqual([6]);
    expect(previewViewPageNumbers('all', 3, 4)).toEqual([1, 2, 3, 4]);
  });

  it('moves between facing-page spreads without revisiting a spread', () => {
    expect(facingSpreadPageNumbers(5, 8)).toEqual([4, 5]);
    expect(previousPreviewPageNumber('facing', 5, 8)).toBe(2);
    expect(nextPreviewPageNumber('facing', 3, 8)).toBe(4);
    expect(nextPreviewPageNumber('facing', 4, 8)).toBe(6);
    expect(previousPreviewPageNumber('facing', 2, 8)).toBe(1);
    expect(nextPreviewPageNumber('facing', 8, 8)).toBe(8);
  });
});

describe('print preview controls', () => {
  it('moves through the bounded preview zoom ladder', () => {
    expect(nextZoomLevel(1)).toBe(1.5);
    expect(nextZoomLevel(8)).toBe(8);
    expect(previousZoomLevel(1)).toBe(0.75);
    expect(previousZoomLevel(0.125)).toBe(0.125);
    expect(clampPreviewZoom(0.01)).toBe(0.125);
    expect(clampPreviewZoom(9)).toBe(8);
    expect(clampPreviewZoom(1)).toBe(1);
  });

  it('parses and clamps page-number input', () => {
    expect(clampPageNumber(-2, 8)).toBe(1);
    expect(clampPageNumber(12, 8)).toBe(8);
    expect(parsePageNumberInput(' 4 ', 8, 2)).toBe(4);
    expect(parsePageNumberInput('not a page', 8, 2)).toBe(2);
  });

  it('generates labeled major ruler ticks', () => {
    const ticks = generateRulerTicks(192, 96, 'in');

    expect(ticks).toHaveLength(17);
    expect(ticks.filter((tick) => tick.major)).toEqual([
      { position: 0, label: '0', major: true },
      { position: 96, label: '1', major: true },
      { position: 192, label: '2', major: true },
    ]);
  });
});
