import type { ZoomFitMode } from '@/models/Workspace';
import type { PrintPreviewViewMode } from '@/utils/printPreview';

export type { PrintPreviewViewMode };

export interface PrintPreviewSettings {
  viewMode: PrintPreviewViewMode;
  rulerIsVisible: boolean;
  zoom: number;
  zoomFitMode: ZoomFitMode | null;
}

export interface RulerPageLayout {
  pageNumber: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}
