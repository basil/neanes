import type { PageSizeUnit } from '@/models/PageSetup';
import { findZoomStep, ZOOM_EPSILON, ZOOM_LEVELS } from '@/models/Workspace';

const MIN_PREVIEW_ZOOM = 0.125;
const MAX_PREVIEW_ZOOM = 8;

export const PRINT_PREVIEW_ZOOM_LEVELS = ZOOM_LEVELS.filter(
  (zoom) => zoom >= MIN_PREVIEW_ZOOM && zoom <= MAX_PREVIEW_ZOOM,
);

export function clampPreviewZoom(zoom: number) {
  return Math.min(Math.max(zoom, MIN_PREVIEW_ZOOM), MAX_PREVIEW_ZOOM);
}

function availableLength(length: number, gaps: number, padding: number) {
  return Math.max(length - gaps - padding * 2, 1);
}

export function fitToWidthScale(
  viewportWidth: number,
  pageWidth: number,
  columns = 1,
  gap = 0,
  padding = 0,
) {
  return (
    availableLength(viewportWidth, gap * Math.max(columns - 1, 0), padding) /
    (pageWidth * Math.max(columns, 1))
  );
}

export function fitInViewScale(
  viewportWidth: number,
  viewportHeight: number,
  pageWidth: number,
  pageHeight: number,
  columns = 1,
  rows = 1,
  gap = 0,
  padding = 0,
) {
  const widthScale = fitToWidthScale(
    viewportWidth,
    pageWidth,
    columns,
    gap,
    padding,
  );
  const heightScale =
    availableLength(viewportHeight, gap * Math.max(rows - 1, 0), padding) /
    (pageHeight * Math.max(rows, 1));

  return Math.min(widthScale, heightScale);
}

export function chooseAllPagesGrid(
  pageCount: number,
  viewportWidth: number,
  viewportHeight: number,
  pageWidth: number,
  pageHeight: number,
  gap = 0,
) {
  if (pageCount <= 0) {
    return { columns: 1, scale: 1 };
  }

  let best = { columns: 1, scale: 0 };

  for (let columns = 1; columns <= pageCount; columns++) {
    const rows = Math.ceil(pageCount / columns);
    const scale = fitInViewScale(
      viewportWidth,
      viewportHeight,
      pageWidth,
      pageHeight,
      columns,
      rows,
      gap,
    );

    if (scale > best.scale) {
      best = { columns, scale };
    }
  }

  return best;
}

export function facingPageColumn(pageNumber: number) {
  return pageNumber % 2 === 0 ? 1 : 2;
}

export type PrintPreviewViewMode = 'single' | 'facing' | 'all';

export function facingSpreadPageNumbers(pageNumber: number, pageCount: number) {
  if (pageCount <= 0) {
    return [];
  }

  const page = clampPageNumber(pageNumber, pageCount);
  if (page === 1) {
    return [1];
  }

  const firstPage = page % 2 === 0 ? page : page - 1;
  return [firstPage, firstPage + 1].filter(
    (candidate) => candidate <= pageCount,
  );
}

export function previewViewPageNumbers(
  viewMode: PrintPreviewViewMode,
  pageNumber: number,
  pageCount: number,
) {
  if (pageCount <= 0) {
    return [];
  }

  switch (viewMode) {
    case 'single':
      return [clampPageNumber(pageNumber, pageCount)];
    case 'facing':
      return facingSpreadPageNumbers(pageNumber, pageCount);
    case 'all':
      return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
}

export function previousPreviewPageNumber(
  viewMode: PrintPreviewViewMode,
  pageNumber: number,
  pageCount: number,
) {
  const page = clampPageNumber(pageNumber, pageCount);
  if (viewMode !== 'facing') {
    return clampPageNumber(page - 1, pageCount);
  }

  const firstPage = facingSpreadPageNumbers(page, pageCount)[0] ?? 1;
  return firstPage <= 2 ? 1 : firstPage - 2;
}

export function nextPreviewPageNumber(
  viewMode: PrintPreviewViewMode,
  pageNumber: number,
  pageCount: number,
) {
  const page = clampPageNumber(pageNumber, pageCount);
  if (viewMode !== 'facing') {
    return clampPageNumber(page + 1, pageCount);
  }

  const spread = facingSpreadPageNumbers(page, pageCount);
  const firstPage = spread[0] ?? 1;
  const lastPage = spread[spread.length - 1] ?? 1;

  if (lastPage >= pageCount) {
    return page;
  }

  return firstPage === 1 ? 2 : firstPage + 2;
}

export function nextZoomLevel(zoom: number) {
  return (
    findZoomStep(PRINT_PREVIEW_ZOOM_LEVELS, zoom, 1) ??
    PRINT_PREVIEW_ZOOM_LEVELS[PRINT_PREVIEW_ZOOM_LEVELS.length - 1]
  );
}

export function previousZoomLevel(zoom: number) {
  return (
    findZoomStep(PRINT_PREVIEW_ZOOM_LEVELS, zoom, -1) ??
    PRINT_PREVIEW_ZOOM_LEVELS[0]
  );
}

export function clampPageNumber(value: number, pageCount: number) {
  return Math.min(Math.max(Math.round(value), 1), Math.max(pageCount, 1));
}

export function parsePageNumberInput(
  value: string,
  pageCount: number,
  fallback: number,
) {
  const parsed = Number(value.trim());

  return Number.isFinite(parsed)
    ? clampPageNumber(parsed, pageCount)
    : clampPageNumber(fallback, pageCount);
}

export interface RulerTick {
  position: number;
  label: string | null;
  major: boolean;
}

function rulerStep(unit: PageSizeUnit) {
  switch (unit) {
    case 'in':
      return { minor: 0.125, major: 1 };
    case 'cm':
      return { minor: 0.1, major: 1 };
    case 'mm':
      return { minor: 1, major: 10 };
    case 'pt':
      return { minor: 6, major: 72 };
    case 'pc':
      return { minor: 1, major: 6 };
  }
}

export function generateRulerTicks(
  lengthPx: number,
  pxPerUnit: number,
  unit: PageSizeUnit,
): RulerTick[] {
  if (lengthPx <= 0 || pxPerUnit <= 0) {
    return [];
  }

  const { minor, major } = rulerStep(unit);
  const count = Math.floor(lengthPx / (pxPerUnit * minor) + ZOOM_EPSILON);

  return Array.from({ length: count + 1 }, (_, index) => {
    const value = index * minor;
    const majorTick =
      Math.abs(value / major - Math.round(value / major)) < 1e-5;

    return {
      position: value * pxPerUnit,
      label: majorTick ? `${Math.round(value)}` : null,
      major: majorTick,
    };
  });
}
