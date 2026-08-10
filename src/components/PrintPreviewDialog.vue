<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="h-[min(94dvh,56rem)] grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden sm:max-w-[min(96vw,80rem)]"
      :show-close-button="!busy"
      @escape-key-down="(event) => busy && event.preventDefault()"
    >
      <DialogHeader>
        <DialogTitle>
          {{ $t(($) => $.dialog.printPreview.root, { ns: 'dialog' }) }}
        </DialogTitle>
        <DialogDescription>
          {{ $t(($) => $.dialog.printPreview.description, { ns: 'dialog' }) }}
        </DialogDescription>
      </DialogHeader>

      <Toolbar
        class="h-auto w-full min-w-0 flex-nowrap gap-1 overflow-x-auto border bg-muted/30 p-2"
        loop
      >
        <AppTooltip
          :tooltip="$t(($) => $.dialog.printPreview.fitWidth, { ns: 'dialog' })"
        >
          <ToolbarButton
            variant="outline"
            size="icon"
            :disabled="zoomControlsAreDisabled"
            @click="selectFitMode('page-width')"
          >
            <PhArrowsOutLineHorizontal />
          </ToolbarButton>
        </AppTooltip>
        <AppTooltip
          :tooltip="$t(($) => $.dialog.printPreview.fitPage, { ns: 'dialog' })"
        >
          <ToolbarButton
            variant="outline"
            size="icon"
            :disabled="zoomControlsAreDisabled"
            @click="selectFitMode('whole-page')"
          >
            <PhCornersOut />
          </ToolbarButton>
        </AppTooltip>

        <ToolbarSeparator />
        <AppTooltip
          :tooltip="$t(($) => $.dialog.printPreview.zoomOut, { ns: 'dialog' })"
        >
          <ToolbarButton
            variant="outline"
            size="icon"
            :disabled="zoomControlsAreDisabled"
            @click="zoomOut"
          >
            <PhMagnifyingGlassMinus />
          </ToolbarButton>
        </AppTooltip>
        <DropdownMenu>
          <InputGroup class="w-24 shrink-0 bg-background">
            <InputGroupInput
              v-model="zoomText"
              :aria-label="
                $t(($) => $.dialog.printPreview.zoom, { ns: 'dialog' })
              "
              :disabled="zoomControlsAreDisabled"
              @change="commitZoom"
              @keydown.enter="onZoomInputEnter"
              @keydown.escape="resetZoomInput"
            />
            <InputGroupAddon
              align="inline-end"
              class="h-full border-l border-input p-0 has-[>button]:mr-0"
            >
              <DropdownMenuTrigger as-child>
                <InputGroupButton
                  size="icon-sm"
                  class="h-full border-0"
                  :aria-label="
                    $t(($) => $.dialog.printPreview.zoom, { ns: 'dialog' })
                  "
                  :disabled="zoomControlsAreDisabled"
                >
                  <PhCaretDown />
                </InputGroupButton>
              </DropdownMenuTrigger>
            </InputGroupAddon>
          </InputGroup>
          <DropdownMenuContent align="end" class="w-36 min-w-36">
            <DropdownMenuCheckboxItem
              :model-value="settings.zoomFitMode === 'page-width'"
              @select="selectFitMode('page-width')"
            >
              {{ $t(($) => $.dialog.printPreview.fitWidth, { ns: 'dialog' }) }}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              :model-value="settings.zoomFitMode === 'whole-page'"
              @select="selectFitMode('whole-page')"
            >
              {{ $t(($) => $.dialog.printPreview.fitPage, { ns: 'dialog' }) }}
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              v-for="option in PRINT_PREVIEW_ZOOM_LEVELS"
              :key="option"
              :model-value="zoomLevelIsSelected(option)"
              @select="selectZoom(option)"
            >
              {{ formatZoomPercent(option) }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AppTooltip
          :tooltip="$t(($) => $.dialog.printPreview.zoomIn, { ns: 'dialog' })"
        >
          <ToolbarButton
            variant="outline"
            size="icon"
            :disabled="zoomControlsAreDisabled"
            @click="zoomIn"
          >
            <PhMagnifyingGlassPlus />
          </ToolbarButton>
        </AppTooltip>

        <ToolbarSeparator />
        <AppTooltip
          :tooltip="
            $t(($) => $.dialog.printPreview.firstPage, { ns: 'dialog' })
          "
        >
          <ToolbarButton
            variant="outline"
            size="icon"
            :disabled="busy || firstPageIsShown"
            @click="navigateToPage(1)"
          >
            <PhCaretLineLeft />
          </ToolbarButton>
        </AppTooltip>
        <AppTooltip
          :tooltip="
            $t(($) => $.dialog.printPreview.previousPage, { ns: 'dialog' })
          "
        >
          <ToolbarButton
            variant="outline"
            size="icon"
            :disabled="busy || firstPageIsShown"
            @click="navigateToPage(previousPageNumber)"
          >
            <PhCaretLeft />
          </ToolbarButton>
        </AppTooltip>
        <Input
          v-model="pageNumberText"
          class="w-14 shrink-0 bg-background text-center dark:bg-background"
          :aria-label="
            $t(($) => $.dialog.printPreview.pageNumber, { ns: 'dialog' })
          "
          :disabled="busy || pageCount === 0"
          @blur="commitPageNumber"
          @keydown.enter="onPageNumberEnter"
          @keydown.escape="resetPageNumberInput"
        />
        <span class="shrink-0 px-1">{{ pageOfTotal }}</span>
        <AppTooltip
          :tooltip="$t(($) => $.dialog.printPreview.nextPage, { ns: 'dialog' })"
        >
          <ToolbarButton
            variant="outline"
            size="icon"
            :disabled="busy || lastPageIsShown"
            @click="navigateToPage(nextPageNumber)"
          >
            <PhCaretRight />
          </ToolbarButton>
        </AppTooltip>
        <AppTooltip
          :tooltip="$t(($) => $.dialog.printPreview.lastPage, { ns: 'dialog' })"
        >
          <ToolbarButton
            variant="outline"
            size="icon"
            :disabled="busy || lastPageIsShown"
            @click="navigateToPage(pageCount)"
          >
            <PhCaretLineRight />
          </ToolbarButton>
        </AppTooltip>

        <ToolbarSeparator />
        <ToolbarToggleGroup
          type="single"
          variant="outline"
          :model-value="settings.viewMode"
          :disabled="busy"
          @update:model-value="changeViewMode"
        >
          <AppTooltip
            :tooltip="
              $t(($) => $.dialog.printPreview.singlePage, { ns: 'dialog' })
            "
          >
            <ToolbarToggleItem
              class="size-8 p-0"
              value="single"
              :aria-label="
                $t(($) => $.dialog.printPreview.singlePage, { ns: 'dialog' })
              "
            >
              <PhFile />
            </ToolbarToggleItem>
          </AppTooltip>
          <AppTooltip
            :tooltip="
              $t(($) => $.dialog.printPreview.facingPages, { ns: 'dialog' })
            "
          >
            <ToolbarToggleItem
              class="size-8 p-0"
              value="facing"
              :aria-label="
                $t(($) => $.dialog.printPreview.facingPages, { ns: 'dialog' })
              "
            >
              <PhBookOpen />
            </ToolbarToggleItem>
          </AppTooltip>
          <AppTooltip
            :tooltip="
              $t(($) => $.dialog.printPreview.allPages, { ns: 'dialog' })
            "
          >
            <ToolbarToggleItem
              class="size-8 p-0"
              value="all"
              :aria-label="
                $t(($) => $.dialog.printPreview.allPages, { ns: 'dialog' })
              "
            >
              <PhSquaresFour />
            </ToolbarToggleItem>
          </AppTooltip>
        </ToolbarToggleGroup>

        <ToolbarToggleGroup
          type="single"
          variant="outline"
          :model-value="rulerIsShown ? 'ruler' : ''"
          @update:model-value="toggleRuler"
        >
          <AppTooltip
            :tooltip="
              $t(($) => $.dialog.printPreview.showRuler, { ns: 'dialog' })
            "
          >
            <ToolbarToggleItem
              class="size-8 p-0"
              value="ruler"
              :disabled="busy || settings.viewMode !== 'single'"
              :aria-label="
                $t(($) => $.dialog.printPreview.showRuler, { ns: 'dialog' })
              "
            >
              <PhRuler />
            </ToolbarToggleItem>
          </AppTooltip>
        </ToolbarToggleGroup>

        <ToolbarSeparator />
        <AppTooltip
          :tooltip="$t(($) => $.dialog.printPreview.refresh, { ns: 'dialog' })"
        >
          <ToolbarButton
            variant="outline"
            size="icon"
            :disabled="busy"
            @click="refreshPdf"
          >
            <PhArrowClockwise />
          </ToolbarButton>
        </AppTooltip>
        <AppTooltip
          :tooltip="
            $t(($) => $.dialog.printPreview.exportPdf, { ns: 'dialog' })
          "
        >
          <ToolbarButton
            variant="outline"
            size="icon"
            :disabled="busy || pageCount === 0"
            @click="runAction(exportPdf)"
          >
            <PhFilePdf />
          </ToolbarButton>
        </AppTooltip>
        <AppTooltip
          :tooltip="$t(($) => $.dialog.printPreview.print, { ns: 'dialog' })"
        >
          <ToolbarButton
            variant="outline"
            size="icon"
            :disabled="busy || pageCount === 0"
            @click="runAction(print)"
          >
            <PhPrinter />
          </ToolbarButton>
        </AppTooltip>
      </Toolbar>

      <div class="relative min-h-0 overflow-hidden bg-muted/60">
        <PrintPreviewRuler
          v-if="rulerIsShown && rulerPage != null"
          :page="rulerPage"
          :scroll-left="surfaceScrollLeft"
          :scroll-top="surfaceScrollTop"
          :px-per-unit="rulerPixelsPerUnit"
          :unit="pageSetup.pageSizeUnit"
        />
        <div
          ref="surfaceRef"
          class="absolute overflow-auto"
          :class="rulerIsShown ? 'top-7 right-0 bottom-0 left-7' : 'inset-0'"
          @scroll="onSurfaceScroll"
          @wheel="onSurfaceWheel"
        >
          <div
            class="grid min-h-full min-w-full content-start justify-center gap-6 p-6"
            :style="gridStyle"
          >
            <div
              v-for="page in displayedPages"
              :key="page.pageNumber"
              :ref="(element) => setPageCellRef(page.pageNumber, element)"
              v-observe-visibility="{
                callback: (isVisible: boolean) =>
                  updatePageVisibility(page.pageNumber, isVisible),
                intersection: pageVisibilityIntersection,
              }"
              class="bg-white shadow-lg ring-1 ring-black/10"
              :style="pageCellStyle(page)"
            >
              <canvas
                :ref="(element) => setCanvasRef(page.pageNumber, element)"
                class="block size-full bg-white"
              />
            </div>
          </div>
        </div>

        <div
          v-if="busy"
          class="absolute inset-0 z-20 grid place-items-center bg-background/70"
        >
          <div class="flex items-center gap-2 text-sm">
            <Spinner class="size-6" />
            {{ $t(($) => $.dialog.printPreview.rendering, { ns: 'dialog' }) }}
          </div>
        </div>
        <div
          v-else-if="renderError != null"
          class="absolute inset-0 grid place-items-center p-6 text-center text-destructive"
        >
          <div>
            <p class="font-medium">
              {{
                $t(($) => $.dialog.printPreview.renderFailed, { ns: 'dialog' })
              }}
            </p>
            <p v-if="renderError" class="mt-1 text-xs">{{ renderError }}</p>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  PhArrowClockwise,
  PhArrowsOutLineHorizontal,
  PhBookOpen,
  PhCaretDown,
  PhCaretLeft,
  PhCaretLineLeft,
  PhCaretLineRight,
  PhCaretRight,
  PhCornersOut,
  PhFile,
  PhFilePdf,
  PhMagnifyingGlassMinus,
  PhMagnifyingGlassPlus,
  PhPrinter,
  PhRuler,
  PhSquaresFour,
} from '@phosphor-icons/vue';
import { useTranslation } from 'i18next-vue';
import type * as PdfJs from 'pdfjs-dist';
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
} from 'pdfjs-dist';
import type { AcceptableValue } from 'reka-ui';
import { debounce } from 'throttle-debounce';
import type { ComponentPublicInstance, CSSProperties } from 'vue';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';

import AppTooltip from '@/components/AppTooltip.vue';
import { toStorage } from '@/components/InputUnit.types';
import type {
  PrintPreviewSettings,
  RulerPageLayout,
} from '@/components/PrintPreviewDialog.types';
import PrintPreviewRuler from '@/components/PrintPreviewRuler.vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from '@/components/ui/toolbar';
import { useResizeObserver } from '@/composables/useResizeObserver';
import { useZoomWheelStepper } from '@/composables/useZoomWheelStepper';
import type { RenderWorkspaceAsPdfReplyArgs } from '@/ipc/ipcChannels';
import type { PageSetup } from '@/models/PageSetup';
import {
  formatZoomPercent,
  ZOOM_EPSILON,
  type ZoomFitMode,
} from '@/models/Workspace';
import {
  chooseAllPagesGrid,
  clampPageNumber,
  clampPreviewZoom,
  facingPageColumn,
  fitInViewScale,
  fitToWidthScale,
  nextPreviewPageNumber,
  nextZoomLevel,
  parsePageNumberInput,
  previewViewPageNumbers,
  previousPreviewPageNumber,
  previousZoomLevel,
  PRINT_PREVIEW_ZOOM_LEVELS,
} from '@/utils/printPreview';
import { Unit } from '@/utils/Unit';

interface PreviewPage {
  pageNumber: number;
  page: PDFPageProxy;
  width: number;
  height: number;
}

const props = defineProps<{
  pageSetup: PageSetup;
  settings: PrintPreviewSettings;
  renderPdf: () => Promise<RenderWorkspaceAsPdfReplyArgs>;
  exportPdf: () => Promise<void>;
  print: () => Promise<void>;
}>();
const emit = defineEmits<{
  'update:settings': [settings: PrintPreviewSettings];
}>();
const open = defineModel<boolean>('open', { required: true });

const { t } = useTranslation();

const surfaceRef = ref<HTMLElement | null>(null);
const previewPages = shallowRef<PreviewPage[]>([]);
const loading = ref(true);
const actionInProgress = ref(false);
const renderError = ref<string | null>(null);
const currentPageNumber = ref(1);
const pageNumberText = ref('1');
const zoomText = ref('100%');
const viewportWidth = ref(1);
const viewportHeight = ref(1);
const surfaceScrollLeft = ref(0);
const surfaceScrollTop = ref(0);
const rulerPageLayouts = shallowRef<RulerPageLayout[]>([]);
const visiblePages = new Set<number>();
const canvasRefs = new Map<number, HTMLCanvasElement>();
const pageCellRefs = new Map<number, HTMLElement>();
const renderTasks = new Map<number, RenderTask>();
const intersectionRatios = new Map<number, number>();
let pdfDocument: PDFDocumentProxy | null = null;
let pdfLoadingTask: PDFDocumentLoadingTask | null = null;
let pageObserver: IntersectionObserver | null = null;
let renderGeneration = 0;
let navigationTimer: number | null = null;
let programmaticNavigation = false;
let pdfjsPromise: Promise<typeof PdfJs> | null = null;
const surfaceResizeObserver = useResizeObserver();
const zoomWheelStepper = useZoomWheelStepper();
// Coalesce rasterization while the fit-mode scale tracks a drag-resize; the
// canvases CSS-scale immediately and sharpen when the scale settles.
const rerenderDebounced = debounce(150, () => {
  void rerenderCurrentViewPages();
});

const busy = computed(() => loading.value || actionInProgress.value);
const pageCount = computed(() => previewPages.value.length);
const displayedPageNumbers = computed(() =>
  previewViewPageNumbers(
    props.settings.viewMode,
    currentPageNumber.value,
    pageCount.value,
  ),
);
const displayedPages = computed(() =>
  displayedPageNumbers.value.map(
    (pageNumber) => previewPages.value[pageNumber - 1],
  ),
);
const previousPageNumber = computed(() =>
  previousPreviewPageNumber(
    props.settings.viewMode,
    currentPageNumber.value,
    pageCount.value,
  ),
);
const nextPageNumber = computed(() =>
  nextPreviewPageNumber(
    props.settings.viewMode,
    currentPageNumber.value,
    pageCount.value,
  ),
);
const firstPageIsShown = computed(
  () => previousPageNumber.value === currentPageNumber.value,
);
const lastPageIsShown = computed(
  () => nextPageNumber.value === currentPageNumber.value,
);
const pageOfTotal = computed(() =>
  t(($) => $.dialog.printPreview.pageOfTotal, {
    ns: 'dialog',
    pageCount: pageCount.value,
  }),
);
const largestPage = computed(() =>
  previewPages.value.reduce(
    (largest, page) => ({
      width: Math.max(largest.width, page.width),
      height: Math.max(largest.height, page.height),
    }),
    { width: 1, height: 1 },
  ),
);
const allPagesGrid = computed(() =>
  chooseAllPagesGrid(
    pageCount.value,
    Math.max(viewportWidth.value - 48, 1),
    Math.max(viewportHeight.value - 48, 1),
    largestPage.value.width,
    largestPage.value.height,
    24,
  ),
);
const displayScale = computed(() => {
  if (props.settings.viewMode === 'all') {
    return allPagesGrid.value.scale;
  }

  const columns = gridColumns.value;

  if (props.settings.zoomFitMode === 'page-width') {
    return fitToWidthScale(
      viewportWidth.value,
      largestPage.value.width,
      columns,
      24,
      24,
    );
  }

  if (props.settings.zoomFitMode === 'whole-page') {
    return fitInViewScale(
      viewportWidth.value,
      viewportHeight.value,
      largestPage.value.width,
      largestPage.value.height,
      columns,
      1,
      24,
      24,
    );
  }

  // The preview zoom factor is CSS pixels per PDF point.
  return Unit.fromPt(props.settings.zoom);
});
const effectiveZoom = computed(() => Unit.toPt(displayScale.value));
const gridStyle = computed<CSSProperties>(() => ({
  gridTemplateColumns: `repeat(${gridColumns.value}, max-content)`,
}));
const gridColumns = computed(() => {
  if (props.settings.viewMode === 'all') {
    return allPagesGrid.value.columns;
  }

  return props.settings.viewMode === 'facing' ? 2 : 1;
});
const pageVisibilityIntersection = computed(() => ({
  root: surfaceRef.value,
  rootMargin: '300px',
}));
const rulerIsShown = computed(
  () => props.settings.rulerIsVisible && props.settings.viewMode === 'single',
);
const rulerPage = computed(() => rulerPageLayouts.value[0] ?? null);
const rulerPixelsPerUnit = computed(
  () => toStorage(1, props.pageSetup.pageSizeUnit) * effectiveZoom.value,
);
const zoomControlsAreDisabled = computed(
  () => busy.value || props.settings.viewMode === 'all',
);
const zoomDisplay = computed(() => formatZoomPercent(effectiveZoom.value));

watch(zoomDisplay, (value) => (zoomText.value = value), { immediate: true });
watch(currentPageNumber, (value) => (pageNumberText.value = `${value}`), {
  immediate: true,
});
watch(displayScale, () => rerenderDebounced());
watch(
  [
    displayScale,
    currentPageNumber,
    viewportWidth,
    viewportHeight,
    previewPages,
    rulerIsShown,
  ],
  updateRulerPageLayouts,
  { flush: 'post' },
);
watch(
  surfaceRef,
  (element) => {
    if (element == null) {
      surfaceResizeObserver.disconnect();
      return;
    }

    surfaceResizeObserver.observe(element, ([entry]) => {
      viewportWidth.value = Math.max(entry.contentRect.width, 1);
      viewportHeight.value = Math.max(entry.contentRect.height, 1);
    });
    viewportWidth.value = Math.max(element.clientWidth, 1);
    viewportHeight.value = Math.max(element.clientHeight, 1);
  },
  { flush: 'post' },
);
watch(
  () => props.settings.viewMode,
  async () => {
    pageObserver?.disconnect();
    pageObserver = null;
    intersectionRatios.clear();
    await nextTick();
    setupPageObserver();
    await navigateToPage(currentPageNumber.value, false);
  },
);

onMounted(async () => {
  await nextTick();
  await refreshPdf();
});

onBeforeUnmount(() => {
  renderGeneration++;
  cancelRenderTasks();
  rerenderDebounced.cancel();
  pageObserver?.disconnect();
  if (navigationTimer != null) {
    window.clearTimeout(navigationTimer);
  }
  // Teardown is fire-and-forget, so keep its rejection from surfacing as an
  // unhandled promise rejection.
  if (pdfLoadingTask != null) {
    pdfLoadingTask.destroy().catch((error) => console.error(error));
  } else {
    pdfDocument?.cleanup().catch((error) => console.error(error));
  }
});

async function loadPdfJs() {
  pdfjsPromise ??= Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?worker&inline'),
  ]).then(([pdfjs, { default: PdfWorker }]) => {
    if (pdfjs.GlobalWorkerOptions.workerPort == null) {
      pdfjs.GlobalWorkerOptions.workerPort = new PdfWorker();
    }

    return pdfjs;
  });

  return await pdfjsPromise;
}

function renderFailedText() {
  return t(($) => $.dialog.printPreview.renderFailed, { ns: 'dialog' });
}

async function refreshPdf() {
  loading.value = true;
  renderError.value = null;
  renderGeneration++;
  cancelRenderTasks();
  visiblePages.clear();
  pageObserver?.disconnect();
  pageObserver = null;

  if (pdfLoadingTask != null) {
    await pdfLoadingTask.destroy();
    pdfLoadingTask = null;
  } else if (pdfDocument != null) {
    await pdfDocument.cleanup();
  }
  pdfDocument = null;
  previewPages.value = [];

  try {
    const [reply, { getDocument }] = await Promise.all([
      props.renderPdf(),
      loadPdfJs(),
    ]);

    if (!reply.success || reply.data == null) {
      throw new Error(reply.errorMessage || renderFailedText());
    }

    pdfLoadingTask = getDocument({ data: reply.data });
    pdfDocument = await pdfLoadingTask.promise;

    previewPages.value = await Promise.all(
      Array.from({ length: pdfDocument.numPages }, async (_, index) => {
        const pageNumber = index + 1;
        const page = await pdfDocument!.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        return {
          pageNumber,
          page,
          width: viewport.width,
          height: viewport.height,
        };
      }),
    );

    currentPageNumber.value = clampPageNumber(
      currentPageNumber.value,
      pageCount.value,
    );
    await nextTick();
    setupPageObserver();
    const initialPages =
      props.settings.viewMode === 'all'
        ? [currentPageNumber.value]
        : displayedPageNumbers.value;
    initialPages.forEach((pageNumber) => visiblePages.add(pageNumber));
    await Promise.all(initialPages.map(renderPage));
  } catch (error) {
    console.error(error);
    renderError.value =
      error instanceof Error ? error.message : renderFailedText();
  } finally {
    loading.value = false;
  }
}

async function rerenderCurrentViewPages() {
  rerenderDebounced.cancel();

  if (loading.value || pageCount.value === 0) {
    return;
  }

  renderGeneration++;
  cancelRenderTasks();
  await nextTick();
  const pagesToRender =
    props.settings.viewMode === 'all'
      ? new Set(visiblePages)
      : new Set(displayedPageNumbers.value);
  pagesToRender.add(currentPageNumber.value);
  await Promise.all([...pagesToRender].map(renderPage));
}

async function renderPage(pageNumber: number) {
  const page = previewPages.value[pageNumber - 1];
  const canvas = canvasRefs.get(pageNumber);

  if (page == null || canvas == null || renderTasks.has(pageNumber)) {
    return;
  }

  const generation = renderGeneration;
  const viewport = page.page.getViewport({ scale: displayScale.value });
  const outputScale = window.devicePixelRatio || 1;
  canvas.width = Math.max(Math.floor(viewport.width * outputScale), 1);
  canvas.height = Math.max(Math.floor(viewport.height * outputScale), 1);
  const context = canvas.getContext('2d');

  if (context == null) {
    return;
  }

  const task = page.page.render({
    canvas,
    canvasContext: context,
    viewport,
    transform:
      outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
  });
  renderTasks.set(pageNumber, task);

  try {
    await task.promise;
  } catch (error) {
    if (
      generation === renderGeneration &&
      !(error instanceof Error && error.name === 'RenderingCancelledException')
    ) {
      console.error(error);
    }
  } finally {
    if (renderTasks.get(pageNumber) === task) {
      renderTasks.delete(pageNumber);
    }
  }
}

function cancelRenderTasks() {
  renderTasks.forEach((task) => task.cancel());
  renderTasks.clear();
}

function updatePageVisibility(pageNumber: number, isVisible: boolean) {
  if (isVisible) {
    visiblePages.add(pageNumber);
    void renderPage(pageNumber);
  } else {
    visiblePages.delete(pageNumber);
    const task = renderTasks.get(pageNumber);
    task?.cancel();
    renderTasks.delete(pageNumber);
    releaseCanvas(pageNumber);
  }
}

function releaseCanvas(pageNumber: number) {
  const canvas = canvasRefs.get(pageNumber);
  if (canvas != null) {
    canvas.width = 1;
    canvas.height = 1;
  }
}

function setCanvasRef(
  pageNumber: number,
  element: Element | ComponentPublicInstance | null,
) {
  if (element instanceof HTMLCanvasElement) {
    canvasRefs.set(pageNumber, element);
  } else {
    canvasRefs.delete(pageNumber);
  }
}

function setPageCellRef(
  pageNumber: number,
  element: Element | ComponentPublicInstance | null,
) {
  const previous = pageCellRefs.get(pageNumber);
  if (previous != null) {
    pageObserver?.unobserve(previous);
  }

  if (element instanceof HTMLElement) {
    pageCellRefs.set(pageNumber, element);
    element.dataset.pageNumber = `${pageNumber}`;
    if (props.settings.viewMode === 'all') {
      pageObserver?.observe(element);
    }
  } else {
    pageCellRefs.delete(pageNumber);
  }
}

function setupPageObserver() {
  pageObserver?.disconnect();
  pageObserver = null;
  intersectionRatios.clear();

  if (surfaceRef.value == null || props.settings.viewMode !== 'all') {
    return;
  }

  pageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const pageNumber = Number(
          (entry.target as HTMLElement).dataset.pageNumber,
        );
        intersectionRatios.set(pageNumber, entry.intersectionRatio);
      });

      if (programmaticNavigation) {
        return;
      }

      const mostVisible = [...intersectionRatios.entries()]
        .filter(([, ratio]) => ratio > 0)
        .sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];

      if (mostVisible != null) {
        currentPageNumber.value = mostVisible[0];
      }
    },
    {
      root: surfaceRef.value,
      threshold: [0, 0.25, 0.5, 0.75, 1],
    },
  );

  pageCellRefs.forEach((element) => pageObserver?.observe(element));
}

function onSurfaceScroll() {
  if (surfaceRef.value == null) {
    return;
  }

  surfaceScrollLeft.value = surfaceRef.value.scrollLeft;
  surfaceScrollTop.value = surfaceRef.value.scrollTop;
}

function updateRulerPageLayouts() {
  if (!rulerIsShown.value) {
    rulerPageLayouts.value = [];
    return;
  }

  rulerPageLayouts.value = displayedPages.value.flatMap((page) => {
    const cell = pageCellRefs.get(page.pageNumber);
    return cell == null
      ? []
      : [
          {
            pageNumber: page.pageNumber,
            width: page.width * displayScale.value,
            height: page.height * displayScale.value,
            offsetX: cell.offsetLeft,
            offsetY: cell.offsetTop,
          },
        ];
  });
}

interface ZoomWheelAnchor {
  pageElement: HTMLElement;
  clientX: number;
  clientY: number;
  pageXRatio: number;
  pageYRatio: number;
}

function createZoomWheelAnchor(event: WheelEvent): ZoomWheelAnchor | null {
  const pageElement =
    event.target instanceof Element
      ? event.target.closest<HTMLElement>('[data-page-number]')
      : null;

  if (pageElement == null || !surfaceRef.value?.contains(pageElement)) {
    return null;
  }

  const pageRect = pageElement.getBoundingClientRect();

  return {
    pageElement,
    clientX: event.clientX,
    clientY: event.clientY,
    pageXRatio: (event.clientX - pageRect.left) / pageRect.width,
    pageYRatio: (event.clientY - pageRect.top) / pageRect.height,
  };
}

function restoreZoomWheelAnchor(anchor: ZoomWheelAnchor) {
  void nextTick(() => {
    const surface = surfaceRef.value;
    if (
      surface == null ||
      !anchor.pageElement.isConnected ||
      !surface.contains(anchor.pageElement)
    ) {
      return;
    }

    const pageRect = anchor.pageElement.getBoundingClientRect();
    surface.scrollLeft +=
      pageRect.left + pageRect.width * anchor.pageXRatio - anchor.clientX;
    surface.scrollTop +=
      pageRect.top + pageRect.height * anchor.pageYRatio - anchor.clientY;
    onSurfaceScroll();
  });
}

function applyZoomWheelStep(event: WheelEvent, direction: 1 | -1) {
  const nextZoom =
    direction === 1
      ? nextZoomLevel(effectiveZoom.value)
      : previousZoomLevel(effectiveZoom.value);

  if (Math.abs(nextZoom - effectiveZoom.value) <= ZOOM_EPSILON) {
    return;
  }

  const anchor = createZoomWheelAnchor(event);
  selectZoom(nextZoom);

  if (anchor != null) {
    restoreZoomWheelAnchor(anchor);
  }
}

function onSurfaceWheel(event: WheelEvent) {
  if (event.defaultPrevented || (!event.ctrlKey && !event.metaKey)) {
    return;
  }

  if (event.deltaY === 0) {
    return;
  }

  event.preventDefault();

  if (busy.value || props.settings.viewMode === 'all') {
    return;
  }

  const direction = zoomWheelStepper.step(event);

  if (direction != null) {
    applyZoomWheelStep(event, direction);
  }
}

async function navigateToPage(pageNumber: number, smooth = true) {
  const nextPage = clampPageNumber(pageNumber, pageCount.value);
  const surface = surfaceRef.value;

  if (props.settings.viewMode === 'all') {
    programmaticNavigation = true;
  }
  currentPageNumber.value = nextPage;
  await nextTick();

  if (surface == null) {
    programmaticNavigation = false;
    return;
  }

  if (props.settings.viewMode !== 'all') {
    surface.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    onSurfaceScroll();
    await rerenderCurrentViewPages();
    return;
  }

  const cell = pageCellRefs.get(nextPage);
  if (cell == null) {
    programmaticNavigation = false;
    return;
  }

  if (navigationTimer != null) {
    window.clearTimeout(navigationTimer);
  }
  surface.scrollTo({
    top: Math.max(cell.offsetTop - 24, 0),
    left: Math.max(
      cell.offsetLeft - (surface.clientWidth - cell.offsetWidth) / 2,
      0,
    ),
    behavior: smooth ? 'smooth' : 'auto',
  });
  void renderPage(nextPage);
  navigationTimer = window.setTimeout(() => {
    programmaticNavigation = false;
  }, 300);
}

function commitPageNumber() {
  void navigateToPage(
    parsePageNumberInput(
      pageNumberText.value,
      pageCount.value,
      currentPageNumber.value,
    ),
  );
}

function onPageNumberEnter(event: KeyboardEvent) {
  if (!event.isComposing) {
    event.preventDefault();
    commitPageNumber();
  }
}

function resetPageNumberInput() {
  pageNumberText.value = `${currentPageNumber.value}`;
}

function selectZoom(zoom: number) {
  updateSettings({ zoom, zoomFitMode: null });
}

function selectFitMode(zoomFitMode: ZoomFitMode) {
  updateSettings({ zoomFitMode });
}

function zoomIn() {
  selectZoom(nextZoomLevel(effectiveZoom.value));
}

function zoomOut() {
  selectZoom(previousZoomLevel(effectiveZoom.value));
}

function zoomLevelIsSelected(zoom: number) {
  return (
    props.settings.zoomFitMode == null &&
    Math.abs(props.settings.zoom - zoom) <= ZOOM_EPSILON
  );
}

function commitZoom() {
  const zoom = Number.parseFloat(zoomText.value);
  if (!Number.isFinite(zoom)) {
    resetZoomInput();
    return;
  }

  selectZoom(clampPreviewZoom(zoom / 100));
}

function onZoomInputEnter(event: KeyboardEvent) {
  if (!event.isComposing) {
    event.preventDefault();
    commitZoom();
  }
}

function resetZoomInput() {
  zoomText.value = zoomDisplay.value;
}

function changeViewMode(value: AcceptableValue | AcceptableValue[]) {
  if (value === 'single' || value === 'facing' || value === 'all') {
    updateSettings({ viewMode: value });
  }
}

function toggleRuler(value: AcceptableValue | AcceptableValue[]) {
  updateSettings({ rulerIsVisible: value === 'ruler' });
}

async function runAction(action: () => Promise<void>) {
  actionInProgress.value = true;
  try {
    await action();
  } finally {
    actionInProgress.value = false;
  }
}

function updateSettings(patch: Partial<PrintPreviewSettings>) {
  emit('update:settings', { ...props.settings, ...patch });
}

function pageCellStyle(page: PreviewPage): CSSProperties {
  return {
    width: `${page.width * displayScale.value}px`,
    height: `${page.height * displayScale.value}px`,
    gridColumn:
      props.settings.viewMode === 'facing'
        ? `${facingPageColumn(page.pageNumber)}`
        : undefined,
    gridRow: props.settings.viewMode === 'facing' ? '1' : undefined,
  };
}
</script>
