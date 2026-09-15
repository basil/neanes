import { onBeforeUnmount } from 'vue';

const ZOOM_WHEEL_DELTA_THRESHOLD = 80;
const ZOOM_WHEEL_DELTA_RESET_DELAY_MS = 200;

// Turns Ctrl/Cmd+wheel events into discrete zoom steps. Discrete wheels
// (e.g. Firefox in line/page mode) deliver one notch per event, so they zoom
// a single step immediately. High-resolution pixel deltas (mice and trackpad
// pinch in Chromium) accumulate until they cross a threshold; accumulating
// discrete notches instead would require several to cross it, making one
// deliberate notch feel unresponsive. Sign flips and pauses reset the
// accumulator.
export function useZoomWheelStepper() {
  let delta = 0;
  let resetTimeout: number | null = null;

  function clearScheduledReset() {
    if (resetTimeout == null) {
      return;
    }

    window.clearTimeout(resetTimeout);
    resetTimeout = null;
  }

  function reset() {
    delta = 0;
    clearScheduledReset();
  }

  function scheduleReset() {
    clearScheduledReset();

    resetTimeout = window.setTimeout(() => {
      delta = 0;
      resetTimeout = null;
    }, ZOOM_WHEEL_DELTA_RESET_DELAY_MS);
  }

  function step(event: WheelEvent): 1 | -1 | null {
    const { deltaY } = event;

    if (event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) {
      reset();
      return deltaY < 0 ? 1 : -1;
    }

    if (delta !== 0 && Math.sign(delta) !== Math.sign(deltaY)) {
      delta = 0;
    }

    delta += deltaY;

    if (Math.abs(delta) < ZOOM_WHEEL_DELTA_THRESHOLD) {
      scheduleReset();
      return null;
    }

    const direction = delta < 0 ? 1 : -1;

    reset();
    return direction;
  }

  onBeforeUnmount(reset);

  return { step };
}
