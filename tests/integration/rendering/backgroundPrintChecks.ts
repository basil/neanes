import assert from 'node:assert/strict';
import { once } from 'node:events';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { BrowserWindow, type WebContents, WebContentsView } from 'electron';

import { getNativePrintPageSize } from '../../../electron/main/export/pageSize';
import { renderSnapshot } from '../../../electron/main/export/renderSnapshot';
import type { ScoreRenderSnapshot } from '../../../src/services/rendering/scoreRenderSnapshot';

export async function checkPrintPreparation(options: {
  snapshot: ScoreRenderSnapshot;
  root: string;
  output: string;
  owner: BrowserWindow;
}) {
  const original = JSON.stringify(options.snapshot);
  const sourceUrl = options.owner.webContents.getURL();
  const originalWindows = BrowserWindow.getAllWindows().length;
  const originalViews = options.owner.contentView.children.length;
  const preload = path.join(options.root, 'dist-electron/preload/index.js');
  const entry = path.join(options.root, 'dist/export.html');
  let renderer: WebContents | undefined;
  await renderSnapshot({
    snapshot: options.snapshot,
    parent: options.owner,
    completeHasDialog: true,
    preload,
    entry,
    signal: new AbortController().signal,
    async complete({ webContents }) {
      renderer = webContents;
      assert.notEqual(renderer, options.owner.webContents);
      assert.equal(BrowserWindow.getAllWindows().length, originalWindows);
      const view = options.owner.contentView.children.find(
        (child) =>
          child instanceof WebContentsView && child.webContents === webContents,
      );
      assert(view instanceof WebContentsView);
      assert.equal(view.getVisible(), false);
      assert.equal(BrowserWindow.fromWebContents(webContents), options.owner);
      const prepared = await webContents.executeJavaScript(`(() => {
        const root = document.querySelector('.score-print-pages');
        return {
          zoom: getComputedStyle(root).getPropertyValue('--zoom').trim(),
          residue: getComputedStyle(root).getPropertyValue('--zoom-residue').trim(),
          title: document.title,
          pages: [...root.querySelectorAll('.page')].map(page => ({
            width: page.getBoundingClientRect().width,
            height: page.getBoundingClientRect().height,
            text: page.textContent,
          })),
        };
      })()`);
      assert.equal(prepared.zoom, '1');
      assert.equal(prepared.residue, '0');
      assert.equal(prepared.title, options.snapshot.title);
      assert.equal(prepared.pages.length, 2);
      for (const page of prepared.pages) {
        assert.equal(page.width, 816);
        assert.equal(page.height, 1056);
        assert(page.text.length > 100);
      }
      assert.equal(
        getNativePrintPageSize({
          pageSize: 'Letter',
          pageWidthInches: 8.5,
          pageHeightInches: 11,
        }),
        'Letter',
      );
      // Capture the prepared pages without submitting a physical print job.
      const pdf = await webContents.printToPDF({ pageSize: 'Letter' });
      await writeFile(
        path.join(options.output, 'native-print-prepared.pdf'),
        pdf,
      );
    },
  });
  assert.equal(options.owner.webContents.getURL(), sourceUrl);
  assert.equal(options.owner.contentView.children.length, originalViews);
  assert.equal(BrowserWindow.getAllWindows().length, originalWindows);
  assert(renderer);
  if (!renderer.isDestroyed()) {
    await once(renderer, 'destroyed', { signal: AbortSignal.timeout(5_000) });
  }
  assert.equal(JSON.stringify(options.snapshot), original);

  // Closing the editor while its hidden print view is attached cancels
  // rendering and disposes the view without leaving a window behind.
  const closingOwner = new BrowserWindow({ show: false });
  await closingOwner.loadURL('about:blank');
  const closing = renderSnapshot({
    snapshot: options.snapshot,
    parent: closingOwner,
    completeHasDialog: true,
    preload,
    entry,
    signal: new AbortController().signal,
    complete: async () => undefined,
  });
  closingOwner.destroy();
  await assert.rejects(closing, /EXPORT_RENDER_FAILED/);
  assert.equal(BrowserWindow.getAllWindows().length, originalWindows);
  console.log(
    'PASS: hidden-view native-print preparation, canonical geometry, owner/snapshot preservation, owner closure',
  );
}
