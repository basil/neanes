import {
  BrowserWindow,
  ipcMain,
  type IpcMainEvent,
  type WebContents,
  WebContentsView,
} from 'electron';

import {
  IpcMainChannels,
  IpcRendererChannels,
} from '../../../src/ipc/ipcChannels';
import type {
  PngRenderOptions,
  ScoreRenderSnapshot,
  SnapshotRenderResult,
} from '../../../src/services/rendering/scoreRenderSnapshot';

// Pairs a renderer's webContents with the teardown for whatever hosts it.
function createRendererHost(
  parent: BrowserWindow | undefined,
  attachToParent: boolean,
  webPreferences: Electron.WebPreferences,
) {
  if (attachToParent && parent) {
    // A hidden view attached to the editor keeps rendering separate while
    // giving native print dialogs the editor's mapped native surface as their
    // parent.
    const view = new WebContentsView({ webPreferences });
    // The view drops its webContents reference once it is destroyed, so keep
    // our own for disposal.
    const { webContents } = view;
    view.setVisible(false);
    parent.contentView.addChildView(view);
    return {
      webContents,
      dispose() {
        if (!parent.isDestroyed()) {
          parent.contentView.removeChildView(view);
        }
        if (!webContents.isDestroyed()) {
          webContents.close();
        }
      },
    };
  }
  const window = new BrowserWindow({ show: false, parent, webPreferences });
  return {
    webContents: window.webContents,
    dispose() {
      if (!window.isDestroyed()) {
        window.destroy();
      }
    },
  };
}

// One disposable renderer per snapshot. It has no editor/workspace lifecycle.
export async function renderSnapshot<T>(options: {
  snapshot: ScoreRenderSnapshot;
  png?: PngRenderOptions;
  parent?: BrowserWindow;
  completeHasDialog?: boolean;
  writeImage?: (
    pageNumber: number,
    data: string,
    signal: AbortSignal,
  ) => Promise<boolean>;
  complete: (
    renderer: { webContents: WebContents },
    result: Extract<SnapshotRenderResult, { success: true }>,
  ) => Promise<T>;
  preload: string;
  entry: string;
  devServerUrl?: string;
  signal: AbortSignal;
}): Promise<T> {
  options.signal.throwIfAborted();
  const host = createRendererHost(
    options.parent,
    options.completeHasDialog === true,
    {
      preload: options.preload,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
      spellcheck: false,
    },
  );
  const { webContents } = host;
  webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  const outcome = Promise.withResolvers<T>();
  const rendering = new AbortController();
  let started = false;
  let disposed = false;
  let completing = false;
  const fail = (message: string) => {
    const error = new Error(`EXPORT_RENDER_FAILED: ${message}`);
    rendering.abort(error);
    outcome.reject(error);
  };
  const onReady = (event: IpcMainEvent) => {
    if (event.sender === webContents && !started) {
      started = true;
      event.sender.send(IpcMainChannels.ExportRendererSnapshot, {
        snapshot: options.snapshot,
        png: options.png,
      });
    }
  };
  const onResult = (event: IpcMainEvent, result: SnapshotRenderResult) => {
    if (event.sender !== webContents || !started || completing) {
      return;
    }
    completing = true;
    if (!result.success) {
      fail(result.message ?? 'Renderer failed');
      return;
    }
    // Rendering is ready; a native dialog can remain open without a deadline.
    if (options.completeHasDialog) {
      clearTimeout(timer);
    }
    void Promise.resolve()
      .then(() => options.complete({ webContents }, result))
      .then(outcome.resolve, (error: unknown) => fail(String(error)));
  };
  const onAbort = () => {
    rendering.abort(options.signal.reason);
    outcome.reject(options.signal.reason);
  };
  const onGone = () => fail('Renderer disconnected');
  const onNavigation = (event: Electron.Event) => event.preventDefault();
  const onOwnerNavigation = (
    _event: Electron.Event,
    _url: string,
    isInPlace: boolean,
    isMainFrame: boolean,
  ) => {
    if (isMainFrame && !isInPlace) {
      onGone();
    }
  };
  const owner = options.parent?.webContents;
  let timer = setTimeout(() => fail('Renderer timed out'), 45_000);
  webContents.ipc.handle(
    IpcRendererChannels.ExportRendererImage,
    async (_event, pageNumber: number, data: string) => {
      if (!started || !options.writeImage) {
        throw new Error('Unexpected export image');
      }
      clearTimeout(timer);
      try {
        return await options.writeImage(pageNumber, data, rendering.signal);
      } catch (error) {
        fail(String(error));
        throw error;
      } finally {
        if (!disposed) {
          timer = setTimeout(() => fail('Renderer timed out'), 45_000);
        }
      }
    },
  );
  ipcMain.on(IpcRendererChannels.ExportRendererReady, onReady);
  ipcMain.on(IpcRendererChannels.ExportRendererResult, onResult);
  options.signal.addEventListener('abort', onAbort, { once: true });
  webContents.on('render-process-gone', onGone);
  webContents.on('will-navigate', onNavigation);
  webContents.on('destroyed', onGone);
  owner?.on('destroyed', onGone);
  owner?.on('render-process-gone', onGone);
  owner?.on('did-start-navigation', onOwnerNavigation);
  try {
    // Start loading without delaying observation of crashes or cancellation.
    void (
      options.devServerUrl
        ? webContents.loadURL(new URL('export.html', options.devServerUrl).href)
        : webContents.loadFile(options.entry)
    ).catch((error: unknown) => fail(String(error)));
    return await outcome.promise;
  } finally {
    disposed = true;
    clearTimeout(timer);
    ipcMain.removeListener(IpcRendererChannels.ExportRendererReady, onReady);
    ipcMain.removeListener(IpcRendererChannels.ExportRendererResult, onResult);
    options.signal.removeEventListener('abort', onAbort);
    if (!webContents.isDestroyed()) {
      webContents.ipc.removeHandler(IpcRendererChannels.ExportRendererImage);
    }
    webContents.removeListener('destroyed', onGone);
    owner?.removeListener('destroyed', onGone);
    owner?.removeListener('render-process-gone', onGone);
    owner?.removeListener('did-start-navigation', onOwnerNavigation);
    host.dispose();
  }
}
