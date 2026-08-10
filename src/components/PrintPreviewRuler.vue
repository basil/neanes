<template>
  <div class="pointer-events-none absolute inset-0 z-10 text-muted-foreground">
    <div class="absolute top-0 left-0 size-7 border-r border-b bg-muted" />
    <svg
      class="absolute top-0 right-0 left-7 h-7 w-[calc(100%-1.75rem)] border-b bg-muted"
      aria-hidden="true"
    >
      <g :transform="`translate(${page.offsetX - scrollLeft} 0)`">
        <g
          v-for="tick in horizontalTicks"
          :key="tick.position"
          :transform="`translate(${tick.position} 0)`"
        >
          <line
            :y1="tick.major ? 13 : 19"
            y2="28"
            x1="0"
            x2="0"
            stroke="currentColor"
          />
          <text
            v-if="tick.label != null"
            x="3"
            y="11"
            fill="currentColor"
            font-size="9"
          >
            {{ tick.label }}
          </text>
        </g>
      </g>
    </svg>
    <svg
      class="absolute top-7 bottom-0 left-0 h-[calc(100%-1.75rem)] w-7 border-r bg-muted"
      aria-hidden="true"
    >
      <g :transform="`translate(0 ${page.offsetY - scrollTop})`">
        <g
          v-for="tick in verticalTicks"
          :key="tick.position"
          :transform="`translate(0 ${tick.position})`"
        >
          <line
            :x1="tick.major ? 13 : 19"
            x2="28"
            y1="0"
            y2="0"
            stroke="currentColor"
          />
          <text
            v-if="tick.label != null"
            x="3"
            y="10"
            fill="currentColor"
            font-size="9"
          >
            {{ tick.label }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { RulerPageLayout } from '@/components/PrintPreviewDialog.types';
import type { PageSizeUnit } from '@/models/PageSetup';
import { generateRulerTicks } from '@/utils/printPreview';

const props = defineProps<{
  page: RulerPageLayout;
  scrollLeft: number;
  scrollTop: number;
  pxPerUnit: number;
  unit: PageSizeUnit;
}>();

const horizontalTicks = computed(() =>
  generateRulerTicks(props.page.width, props.pxPerUnit, props.unit),
);
const verticalTicks = computed(() =>
  generateRulerTicks(props.page.height, props.pxPerUnit, props.unit),
);
</script>
