import { describe, expect, it } from 'vitest';

import { PageSetup, pageSizes } from '@/models/PageSetup';
import { Unit } from '@/utils/Unit';

import { applyOrientation } from './pageOrientation';

describe('applyOrientation', () => {
  it('uses the built-in dimensions in portrait and landscape', () => {
    const setup = new PageSetup();
    const letter = pageSizes.find((pageSize) => pageSize.name === 'Letter')!;

    expect(applyOrientation(setup)).toEqual({
      pageWidth: letter.width,
      pageHeight: letter.height,
    });

    setup.landscape = true;
    expect(applyOrientation(setup)).toEqual({
      pageWidth: letter.height,
      pageHeight: letter.width,
    });
  });

  it('uses custom dimensions without mutating their stored orientation', () => {
    const setup = new PageSetup();
    setup.pageSize = 'Custom';
    setup.pageWidthCustom = Unit.fromInch(7);
    setup.pageHeightCustom = Unit.fromInch(9);
    setup.landscape = true;

    expect(applyOrientation(setup)).toEqual({
      pageWidth: Unit.fromInch(9),
      pageHeight: Unit.fromInch(7),
    });
    expect(setup.pageWidthCustom).toBe(Unit.fromInch(7));
    expect(setup.pageHeightCustom).toBe(Unit.fromInch(9));
  });
});
