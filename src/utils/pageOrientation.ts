import type { PageSetup } from '@/models/PageSetup';
import { pageSizes } from '@/models/PageSetup';

type OrientationPageSetup = Pick<
  PageSetup,
  'pageSize' | 'pageWidthCustom' | 'pageHeightCustom' | 'landscape'
>;

export function applyOrientation(pageSetup: OrientationPageSetup) {
  const pageSize =
    pageSetup.pageSize === 'Custom'
      ? {
          width: pageSetup.pageWidthCustom,
          height: pageSetup.pageHeightCustom,
        }
      : pageSizes.find((option) => option.name === pageSetup.pageSize)!;

  return pageSetup.landscape
    ? { pageWidth: pageSize.height, pageHeight: pageSize.width }
    : { pageWidth: pageSize.width, pageHeight: pageSize.height };
}
